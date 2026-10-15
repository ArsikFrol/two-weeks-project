# -*- coding: utf-8 -*-
# ============================================================
#  TET-a-TET — «Генератор мест и тем для встреч»
#  Бэкенд в одном файле:
#  FastAPI + SQLAlchemy + SQLite + OpenRouter (ИИ) + Google Places
#
#  Как запустить:
#    1) pip install fastapi "uvicorn[standard]" sqlalchemy requests
#    2) python main.py
#    3) Главная страница: http://127.0.0.1:8000/
#       Документация API: http://127.0.0.1:8000/docs
#
#  Эндпоинты:
#    GET  /                      — HTML-визитка проекта
#    GET  /api/countries         — справочник стран (?search=, ?slug=)
#    GET  /api/cities            — справочник городов (?countryId=,
#                                  ?countrySlug=, ?slug=, ?search=)
#    POST /api/generate          — подбор 3 мест + 4 тем (3 уровня страховки)
#    POST /api/auth/registration — создание аккаунта
#    POST /api/auth/login        — вход (проверка email и пароля)
#    GET  /api/profileCard       — карточки всех пользователей
#
#  Переменные окружения (все НЕобязательны — без них работает заглушка):
#    OPENROUTER_API_KEY  — ключ с https://openrouter.ai/keys (ИИ)
#    GOOGLE_API_KEY      — ключ Google Places (настоящие места)
#    OPENROUTER_MODEL    — модель ИИ (по умолчанию "openrouter/free")
#
#  Тестовые пользователи после первого запуска (пароль у всех "1234"):
#    ivan@example.com, anna@example.com, kira@example.com,
#    arseniy@example.com
#
#  ГЛАВНАЯ ГАРАНТИЯ: /api/generate ВСЕГДА возвращает 200 OK с местами
#  и темами; auth-эндпоинты всегда отвечают 200 OK со полем success.
# ============================================================

import hashlib
import json
import os
import random
from typing import Optional

import requests
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import AliasChoices, BaseModel, Field, field_validator, model_validator
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

# ============================================================
# 1. БАЗА ДАННЫХ (SQLite — файл places_v4.db появится рядом со скриптом).
#     v4 — добавлены таблицы пользователей; новый файл гарантирует,
#     что все колонки создадутся с нуля без конфликтов со старыми базами.
# ============================================================

DATABASE_URL = "sqlite:///./places_v4.db"

# check_same_thread=False — особенность SQLite: FastAPI работает с базой
# из разных потоков, без этого параметра SQLite выдаст ошибку.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Сессия — «соединение» с базой, через которое делаются все запросы.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс, от которого наследуются модели-таблицы.
Base = declarative_base()


# ============================================================
# 2. МОДЕЛИ (описание таблиц базы данных).
#     Внутри базы поля в snake_case (count_places) — это внутреннее
#     дело бэкенда. Наружу (фронтенду) отдаём camelCase через
#     DTO-схемы из секции 4.
# ============================================================

class Country(Base):
    """Страна. id — короткий код: 'ru', 'kz', 'uz', 'by', 'tr', 'ge'.
    slug — латинское имя для ссылок и фильтров: 'russia', 'turkey'..."""
    __tablename__ = "countries"

    id = Column(String, primary_key=True)        # "ru"
    name = Column(String, nullable=False)        # "Россия"
    slug = Column(String, unique=True, nullable=False)   # "russia"
    count_places = Column(Integer, default=0)    # всего мест в стране (число)

    # у одной страны много городов
    cities = relationship("City", back_populates="country")


class City(Base):
    """Город. id — код вида 'ru-mow'. slug — латинское имя: 'moscow'."""
    __tablename__ = "cities"

    id = Column(String, primary_key=True)        # "ru-mow"
    name = Column(String, nullable=False)        # "Москва"
    slug = Column(String, nullable=False)        # "moscow"
    count_places = Column(String, default="0")   # строка: "50+", "20+" ...
    country_id = Column(String, ForeignKey("countries.id"), nullable=False)

    # каждый город принадлежит одной стране
    country = relationship("Country", back_populates="cities")


class User(Base):
    """Аккаунт для входа: email + пароль (хранится ТОЛЬКО хэш пароля,
    не сам пароль — так принято даже в учебных проектах)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)          # "ivan@example.com"
    password_hash = Column(String, nullable=False)               # хэш пароля

    # у каждого аккаунта одна карточка профиля
    profile = relationship("UserProfile", back_populates="user", uselist=False)


class UserProfile(Base):
    """Карточка профиля — то, что фронтенд показывает в списке людей."""
    __tablename__ = "user_profiles"

    profile_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_profile = Column(String, default="")   # ссылка на фото
    name = Column(String, nullable=False)        # "Иван"
    age = Column(Integer, nullable=False)        # 25
    user_name = Column(String, unique=True, nullable=False)   # ник: "ivan_traveler"
    description = Column(String, default="")     # "о себе"
    favourites = Column(Boolean, default=False)  # избранный профиль (по ТЗ Арсения)

    # профиль принадлежит одному аккаунту
    user = relationship("User", back_populates="profile")


# ============================================================
# 3. НАЧАЛЬНОЕ ЗАПОЛНЕНИЕ БАЗЫ (SEED)
# ============================================================

def hash_password(password: str) -> str:
    """Превращает пароль в хэш: из хэша нельзя восстановить пароль,
    но можно проверить, что введённый пароль совпадает сoriginal.
    Для учебного проекта соль фиксированная; в настоящем продакшене
    используют уникальную соль на пользователя и библиотеку bcrypt."""
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), b"tet-a-tet-static-salt", 100_000
    ).hex()


def seed_database() -> None:
    """Создаёт таблицы и один раз заполняет их странами, городами
    и тестовыми профилями. Если страны уже есть — ничего не делает."""
    Base.metadata.create_all(bind=engine)  # создаёт таблицы, если их ещё нет

    db = SessionLocal()
    try:
        if db.query(Country).first() is not None:  # база уже заполнена
            return

        # (код, название, слаг, всего мест,
        #  [(код города, название, слаг города, мест), ...])
        data = [
            ("ru", "Россия", "russia", 155, [
                ("ru-mow", "Москва", "moscow", "50+"),
                ("ru-spb", "Санкт-Петербург", "saint-petersburg", "40+"),
                ("ru-ekb", "Екатеринбург", "ekaterinburg", "30+"),
                ("ru-kzn", "Казань", "kazan", "20+"),
                ("ru-nsk", "Новосибирск", "novosibirsk", "15+"),
            ]),
            ("kz", "Казахстан", "kazakhstan", 55, [
                ("kz-ala", "Алматы", "almaty", "25+"),
                ("kz-ast", "Астана", "astana", "20+"),
                ("kz-shy", "Шымкент", "shymkent", "10+"),
            ]),
            ("uz", "Узбекистан", "uzbekistan", 38, [
                ("uz-tas", "Ташкент", "tashkent", "20+"),
                ("uz-sam", "Самарканд", "samarkand", "10+"),
                ("uz-buk", "Бухара", "bukhara", "8+"),
            ]),
            ("by", "Беларусь", "belarus", 46, [
                ("by-msq", "Минск", "minsk", "25+"),
                ("by-gom", "Гомель", "gomel", "8+"),
                ("by-brst", "Брест", "brest", "7+"),
                ("by-grd", "Гродно", "grodno", "6+"),
            ]),
            ("tr", "Турция", "turkey", 135, [
                ("tr-ist", "Стамбул", "istanbul", "60+"),
                ("tr-ayt", "Анталья", "antalya", "30+"),
                ("tr-ank", "Анкара", "ankara", "25+"),
                ("tr-izm", "Измир", "izmir", "20+"),
            ]),
            ("ge", "Грузия", "georgia", 70, [
                ("ge-tbs", "Тбилиси", "tbilisi", "35+"),
                ("ge-bus", "Батуми", "batumi", "25+"),
                ("ge-kut", "Кутаиси", "kutaisi", "10+"),
            ]),
        ]

        for country_id, country_name, country_slug, total, cities in data:
            db.add(Country(id=country_id, name=country_name,
                           slug=country_slug, count_places=total))
            for city_id, city_name, city_slug, places in cities:
                db.add(City(id=city_id, name=city_name, slug=city_slug,
                            count_places=places, country_id=country_id))

        # Тестовые профили, чтобы фронтенд сразу видел карточки.
        # Пароль у всех — "1234".
        test_users = [
            ("ivan@example.com", "Иван", 25, "ivan_traveler",
             "Люблю кофейни, долгие прогулки и настолки. Ищу компанию на выходные.",
             "https://i.pravatar.cc/150?img=12", True),
            ("anna@example.com", "Анна", 23, "anna_reader",
             "Книжные клубы, тихие антикафе и планетарий — моя стихия.",
             "https://i.pravatar.cc/150?img=45", False),
            ("kira@example.com", "Кира", 24, "kira_photo",
             "Фотографирую город и ищу интересные локации для съёмок.",
             "https://i.pravatar.cc/150?img=32", True),
            ("arseniy@example.com", "Арсений", 26, "ars_dev",
             "Деловые встречи, воркшопы и мозговые штурмы в спокойных местах.",
             "https://i.pravatar.cc/150?img=59", False),
        ]
        for email, name, age, user_name, description, photo, fav in test_users:
            user = User(email=email, password_hash=hash_password("1234"))
            db.add(user)
            db.flush()   # получаем user.id до сохранения профиля
            db.add(UserProfile(user_id=user.id, name=name, age=age,
                               user_name=user_name, description=description,
                               photo_profile=photo, favourites=fav))

        db.commit()
        print("База places_v4.db создана: 6 стран, 22 города, 4 тестовых профиля.")
    finally:
        db.close()


seed_database()  # выполняется сразу при запуске файла


# ============================================================
# 4. PYDANTIC-СХЕМЫ (DTO — формат запросов и ответов API).
#
#    СТРОГИЕ ПРАВИЛА НЕЙМИНГА (по код-ревью):
#      входящие запросы верхнего уровня  -> ...Request  (GenerateRequest)
#      ответы сервера верхнего уровня    -> ...Response (CountriesResponse)
#      вложенные объекты в ответах       -> ...Out      (CountryOut, PlaceOut)
#      вложенные объекты в запросах      -> ...In       (появятся, когда
#        какой-то запрос станет сложным и потребует вложенности)
#
#    Все поля DTO — в camelCase (countryId, countPlaces, timeOfDay,
#    photoProfile), чтобы фронтенду на Next.js не приходилось
#    ничего конвертировать.
# ============================================================

# --- Справочники: страны и города ---

class CountryOut(BaseModel):
    """Страна (вложенный объект ответа)."""
    countryId: str
    name: str
    slug: str
    countPlaces: int


class CountriesResponse(BaseModel):
    """Ответ GET /api/countries."""
    data: list[CountryOut]


class CityOut(BaseModel):
    """Город (вложенный объект ответа)."""
    cityId: str
    name: str
    slug: str
    countPlaces: str


class CitiesResponse(BaseModel):
    """Ответ GET /api/cities."""
    data: list[CityOut]


# --- Генерация ---

class PlaceOut(BaseModel):
    """Одно предложенное место (вложенный объект ответа)."""
    title: str
    category: str
    description: str


class GenerateResponse(BaseModel):
    """Ответ POST /api/generate — 3 места + 4 темы для разговора."""
    places: list[PlaceOut]
    topics: list[str]


class GenerateRequest(BaseModel):
    """Тело запроса POST /api/generate.

    Принимает ДВА формата — каноничный и форму Арсения:
      1) каноничный: companion, meetingType, atmosphere (список),
         timeOfDay, countryName, cityName, customNotes;
      2) форма фронтендера: person="wife", metting="presentation",
         atmosphere="quiet" (строкой), city, country, min/max (бюджет),
         time="22:01". date, firstName, lastName игнорируются.
    Английские значения автоматически переводятся в русские теги.
    """
    companion: str = Field(default="",
                           validation_alias=AliasChoices("companion", "person"))
    meetingType: str = Field(default="",
                             validation_alias=AliasChoices("meetingType", "metting", "meeting"))
    atmosphere: list[str] = Field(default_factory=list)

    timeOfDay: str = ""
    arrivalTime: str = Field(default="",
                             validation_alias=AliasChoices("arrivalTime", "time"))

    countryName: str = Field(default="",
                             validation_alias=AliasChoices("countryName", "country"))
    cityName: str = Field(default="",
                          validation_alias=AliasChoices("cityName", "city"))
    customNotes: str = ""

    budgetMin: int = Field(default=0,
                           validation_alias=AliasChoices("budgetMin", "min"))
    budgetMax: int = Field(default=0,
                           validation_alias=AliasChoices("budgetMax", "max"))

    @field_validator("atmosphere", mode="before")
    @classmethod
    def atmosphere_accepts_string(cls, value):
        """Атмосфера может прийти строкой ("quiet") или списком."""
        if value is None:
            return []
        if isinstance(value, str):
            value = [value]
        return [ru_tag(ATMOSPHERE_RU, item) for item in value]

    @field_validator("companion", mode="before")
    @classmethod
    def translate_person(cls, value):
        return ru_tag(PERSON_RU, value) if value else ""

    @field_validator("meetingType", mode="before")
    @classmethod
    def translate_meeting(cls, value):
        return ru_tag(MEETING_RU, value) if value else ""

    @model_validator(mode="after")
    def derive_time_of_day(self) -> "GenerateRequest":
        """Если timeOfDay не прислали, но есть точное время "22:01" —
        вычисляем часть суток сами."""
        if not self.timeOfDay and self.arrivalTime:
            try:
                hour = int(str(self.arrivalTime).strip().split(":")[0])
            except ValueError:
                return self
            if 5 <= hour < 11:
                self.timeOfDay = "утро"
            elif 11 <= hour < 17:
                self.timeOfDay = "день"
            elif 17 <= hour < 23:
                self.timeOfDay = "вечер"
            else:
                self.timeOfDay = "ночь"
        return self


# --- Регистрация и вход ---

def lower_text(value) -> str:
    """Приводит любое значение к строке в нижнем регистре (для email)."""
    return str(value).strip().lower() if value else ""


class RegistrationRequest(BaseModel):
    """Тело POST /api/auth/registration.

    Обязательны email и password. Остальное — данные карточки профиля;
    если name не прислали, собираем его из firstName + lastName,
    если userName пустой — делаем из email ("ivan@example.com" ->
    "ivan").
    """
    email: str
    password: str
    name: str = ""
    age: int = 18
    userName: str = ""
    description: str = ""
    photoProfile: str = ""
    firstName: str = ""     # форма Арсения шлёт имя и фамилию отдельно
    lastName: str = ""

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        return lower_text(value)

    @field_validator("age", mode="before")
    @classmethod
    def age_accepts_string(cls, value):
        """Возраст может прийти строкой ("25") — приводим к числу."""
        if value in (None, ""):
            return 18
        try:
            return int(value)
        except (ValueError, TypeError):
            return 18

    @model_validator(mode="after")
    def fill_missing_fields(self) -> "RegistrationRequest":
        if not self.name and (self.firstName or self.lastName):
            self.name = (self.firstName + " " + self.lastName).strip()
        if not self.userName and self.email:
            self.userName = self.email.split("@")[0]
        return self


class LoginRequest(BaseModel):
    """Тело POST /api/auth/login."""
    email: str = Field(validation_alias=AliasChoices("email", "login"))
    password: str = ""

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        return lower_text(value)


class AuthResponse(BaseModel):
    """Ответ auth-эндпоинтов. Всегда HTTP 200 — результат смотри
    в поле success: True = операция удалась, False = нет (тогда
    в message лежит человеческое объяснение)."""
    success: bool
    message: str
    profileId: Optional[int] = None


class ProfileCardOut(BaseModel):
    """Карточка пользователя (вложенный объект ответа)."""
    profileId: int
    name: str
    age: int
    userName: str
    description: str
    photoProfile: str
    favourites: bool


class ProfileCardsResponse(BaseModel):
    """Ответ GET /api/profileCard."""
    data: list[ProfileCardOut]


# Вспомогательные функции: превращают объект базы в DTO для ответа.
# Здесь и происходит превращение snake_case (база) в camelCase (API).
def to_country_out(country: Country) -> CountryOut:
    return CountryOut(
        countryId=country.id,
        name=country.name,
        slug=country.slug,
        countPlaces=country.count_places,
    )


def to_city_out(city: City) -> CityOut:
    return CityOut(
        cityId=city.id,
        name=city.name,
        slug=city.slug,
        countPlaces=city.count_places,
    )


def to_profile_card_out(profile: UserProfile) -> ProfileCardOut:
    return ProfileCardOut(
        profileId=profile.profile_id,
        name=profile.name,
        age=profile.age,
        userName=profile.user_name,
        description=profile.description or "",
        photoProfile=profile.photo_profile or "",
        favourites=bool(profile.favourites),
    )


# --- Перевод значений формы фронтенда в русские теги ---
# Арсений присылает значения по-английски ("wife", "quiet", "presentation").
# Бэкенд принимает оба варианта: английский переводится в русский тег,
# а русское значение проходит как есть (его нет в словаре — вернётся само).
ATMOSPHERE_RU = {
    "cozy": "уютная", "comfortable": "уютная",
    "fun": "веселая", "festive": "веселая",
    "quiet": "спокойная", "calm": "спокойная",
    "loud": "шумная", "noisy": "шумная",
    "formal": "формальная",
    "informal": "неформальная", "casual": "неформальная",
    "neutral": "нейтральная",
    "romantic": "романтическая",
    "active": "активная", "energetic": "активная",
}

PERSON_RU = {
    "girlfriend": "С девушкой", "boyfriend": "С парнем",
    "wife": "С женой", "husband": "С мужем",
    "friend": "С другом", "female friend": "С подругой",
    "parents": "С родителями", "mother": "С мамой", "father": "С папой",
    "child": "С ребёнком", "brother": "С братом", "sister": "С сестрой",
    "colleague": "С коллегой", "boss": "С начальником",
    "subordinate": "С подчинённым", "client": "С клиентом",
    "business partner": "С партнёром по бизнесу",
    "groupmate": "С одногруппником",
}

MEETING_RU = {
    "date": "Свидание",
    "blind date": "Свидание вслепую",
    "friendly meeting": "Дружеская встреча",
    "family meeting": "Семейная встреча",
    "business meeting": "Деловая встреча",
    "interview": "Собеседование",
    "negotiations": "Переговоры",
    "planning meeting": "Планёрка",
    "tet-a-tet": "Встреча тет-а-тет",
    "brainstorm": "Мозговой штурм",
    "presentation": "Презентация",
    "workshop": "Воркшоп",
    "training": "Тренинг",
    "conference": "Конференция",
    "seminar": "Семинар",
    "consultation": "Консультация",
    "webinar": "Вебинар",
    "alumni meeting": "Встреча выпускников",
}


def ru_tag(translation: dict, value) -> str:
    """Переводит значение по словарю; неизвестное возвращает как есть."""
    text = str(value).strip()
    return translation.get(text.lower(), text)


# ============================================================
# 5. ПРИЛОЖЕНИЕ FASTAPI + CORS
# ============================================================

app = FastAPI(
    title="TET-a-TET API",
    description="Генератор мест и тем для встреч",
    version="4.0.0",
)

# CORS разрешает браузеру (фронтенду) отправлять запросы на этот сервер,
# даже если фронтенд и бэкенд лежат на разных адресах или портах.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # запросы с любого источника
    allow_methods=["*"],   # любые HTTP-методы
    allow_headers=["*"],
)


def get_db():
    """Даёт эндпоинту сессию базы и закрывает её после ответа."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# 6. ЛОКАЛЬНАЯ ЗАГЛУШКА PLACES_LIBRARY (уровень страховки №3).
#     Это запасной источник данных: работает БЕЗ интернета, БЕЗ ключей
#     и БЕЗ денег. Сюда бэкенд падает при ЛЮБОЙ проблеме с внешними
#     API — поэтому пользователь гарантированно получает результат.
# ============================================================

# Слова для подстановки времени суток в описания мест
TIME_WORDS = {
    "утро": "утром",
    "день": "днём",
    "вечер": "вечером",
    "ночь": "ночью",
}

# Библиотека мест. tags — какие варианты атмосферы подходят этому месту.
# Город подставляется в скобках в именительном падеже: Python сам
# не умеет склонять русские названия ("в Екатеринбурге").
PLACES_LIBRARY = [
    {
        "title": "Кофейня с десертами",
        "category": "кафе",
        "tags": ["уютная", "спокойная", "романтическая", "нейтральная"],
        "description": "Уютная кофейня (город {city}): {time} здесь тихо, "
                       "можно долго разговаривать за чашкой кофе и десертом.",
    },
    {
        "title": "Городской парк",
        "category": "парк",
        "tags": ["спокойная", "романтическая", "активная", "неформальная", "нейтральная"],
        "description": "Прогулка по живописному парку (город {city}): лавочки и "
                       "беседки отлично подходят для душевных разговоров.",
    },
    {
        "title": "Попугайня",
        "category": "контактный зоопарк",
        "tags": ["веселая", "неформальная", "активная", "шумная"],
        "description": "Попугайня (город {city}): яркие попугаи, которых можно "
                       "кормить с рук. Море эмоций и фотографии на память.",
    },
    {
        "title": "Книжный магазин с кофейней",
        "category": "книжный магазин",
        "tags": ["уютная", "спокойная", "нейтральная", "формальная"],
        "description": "Книжный с собственной кофейней (город {city}): побродить "
                       "между полок, выбрать книгу друг другу и обсудить авторов.",
    },
    {
        "title": "Квест-комната",
        "category": "квест",
        "tags": ["активная", "веселая", "шумная", "неформальная"],
        "description": "Квест-комната (город {city}): общая загадка сплотит вас, "
                       "а после квеста точно будет что обсудить.",
    },
    {
        "title": "Боулинг-клуб",
        "category": "боулинг",
        "tags": ["шумная", "веселая", "активная", "неформальная"],
        "description": "Боулинг-клуб (город {city}): игра, смех и лёгкое "
                       "соревнование — {time} здесь особенно оживлённо.",
    },
    {
        "title": "Планетарий",
        "category": "планетарий",
        "tags": ["спокойная", "романтическая", "нейтральная"],
        "description": "Планетарий (город {city}): купол со звёздами создаёт "
                       "атмосферу, в которой хорошо и помолчать, и помечтать вслух.",
    },
    {
        "title": "Ресторан с красивым видом",
        "category": "ресторан",
        "tags": ["романтическая", "формальная", "уютная"],
        "description": "Ресторан с панорамным видом (город {city}): {time} здесь "
                       "располагающая к беседе атмосфера и неспешный ужин.",
    },
    {
        "title": "Антикафе с настольными играми",
        "category": "антикафе",
        "tags": ["неформальная", "веселая", "спокойная", "уютная"],
        "description": "Антикафе (город {city}): настольные игры, вкусный чай и "
                       "оплата за время, а не за еду — можно сидеть весь вечер.",
    },
    {
        "title": "Мастер-класс в гончарной студии",
        "category": "мастер-класс",
        "tags": ["активная", "романтическая", "веселая", "уютная"],
        "description": "Гончарная студия (город {city}): совместный мастер-класс, "
                       "после которого останутся кружки и тёплые воспоминания.",
    },
    {
        "title": "Музей или выставка",
        "category": "музей",
        "tags": ["спокойная", "формальная", "нейтральная"],
        "description": "Музей или интересная выставка (город {city}): общие "
                       "впечатления — готовые темы для разговора на всю встречу.",
    },
    {
        "title": "Караоке-бар",
        "category": "караоке",
        "tags": ["шумная", "веселая", "неформальная"],
        "description": "Караоке-бар (город {city}): петь дуэтом — верный способ "
                       "весело провести время и сблизиться.",
    },
]


def pick_places(atmosphere: list[str], city_name: str, time_of_day: str) -> list[PlaceOut]:
    """Заглушка: возвращает 3 места из библиотеки — сначала те,
    что совпадают по атмосфере."""
    wanted = set(atmosphere)

    matching = [p for p in PLACES_LIBRARY if wanted & set(p["tags"])]
    others = [p for p in PLACES_LIBRARY if not wanted & set(p["tags"])]

    # Перемешиваем, чтобы при каждом запросе были разные варианты
    random.shuffle(matching)
    random.shuffle(others)

    time_word = TIME_WORDS.get(time_of_day.lower(), "в любое время")

    return [
        PlaceOut(
            title=p["title"],
            category=p["category"],
            description=p["description"].format(city=city_name, time=time_word),
        )
        for p in (matching + others)[:3]
    ]


# Подсказки по атмосфере для каждого формата встречи (теги из макета).
# Если пользователь не выбрал атмосферу вручную, бэкенд сам понимает,
# какие места подходят: "Деловая встреча" -> формальная, "Свидание" ->
# романтическая и т.д. Работает и для заглушки, и для поиска Google.
MEETING_TYPE_HINTS = {
    "Свидание": ["романтическая", "уютная"],
    "Свидание вслепую": ["романтическая", "веселая"],
    "Встреча тет-а-тет": ["уютная", "спокойная"],
    "Дружеская встреча": ["веселая", "неформальная"],
    "Встреча выпускников": ["веселая", "неформальная"],
    "Семейная встреча": ["спокойная", "уютная"],
    "Деловая встреча": ["формальная", "нейтральная"],
    "Собеседование": ["формальная", "нейтральная"],
    "Переговоры": ["формальная", "нейтральная"],
    "Рабочее совещание": ["формальная", "нейтральная"],
    "Планёрка": ["формальная", "нейтральная"],
    "Презентация": ["формальная", "нейтральная"],
    "Конференция": ["формальная", "нейтральная"],
    "Семинар": ["формальная", "нейтральная"],
    "Консультация": ["формальная", "нейтральная"],
    "Вебинар": ["нейтральная"],
    "Мозговой штурм": ["активная", "веселая"],
    "Воркшоп": ["активная", "веселая"],
    "Тренинг": ["активная", "веселая"],
}

# Одна готовая тема разговора для самых частых форматов встречи
MEETING_TYPE_TOPICS = {
    "Деловая встреча": "Какие цели у встречи и какой результат нужен каждому?",
    "Собеседование": "Почему вам интересна эта роль и эта команда?",
    "Переговоры": "Какие условия важнее всего каждой из сторон?",
    "Свидание": "Что вас зацепило друг в друге при знакомстве?",
    "Дружеская встреча": "Что нового случилось с прошлой встречи?",
    "Семейная встреча": "Новости семьи и планы на ближайшие праздники",
    "Мозговой штурм": "Какая идея кажется самой смелой и почему бы её не попробовать?",
}


def make_topics(notes: str, atmosphere: list[str],
                time_of_day: str, companion: str,
                meeting_type: str = "") -> list[str]:
    """Заглушка: собирает 4 темы для разговора из пожеланий пользователя."""
    topics: list[str] = []

    # 1) Самое личное — тема из заметок пользователя ("любим кофе")
    if notes:
        topics.append(f"Обсудить пожелание «{notes}»: что вам в этом нравится и почему?")

    # 2) Тема по формату встречи (если для него есть готовая)
    if meeting_type in MEETING_TYPE_TOPICS and len(topics) < 4:
        topics.append(MEETING_TYPE_TOPICS[meeting_type])

    # 3) Одна тема по выбранной атмосфере
    atmosphere_topics = {
        "романтическая": "Как вы познакомились и какой момент вспоминаете чаще всего?",
        "веселая": "Самая смешная история, которая случилась с каждым из вас",
        "спокойная": "О чём мечтаете на ближайший год?",
        "уютная": "Ваши «маленькие радости»: любимая еда, места, ритуалы",
        "шумная": "Концерты и фестивали: где уже были и куда хотите ещё",
        "формальная": "Текущие проекты и планы: чем каждый сейчас занимается",
        "неформальная": "Странные хобби и скрытые таланты, о которых мало кто знает",
        "нейтральная": "Последний фильм или сериал, который зацепил",
        "активная": "Какие приключения хотите попробовать в этом году?",
    }
    for tag in atmosphere:
        if tag in atmosphere_topics:
            topics.append(atmosphere_topics[tag])
            break  # достаточно одной темы по атмосфере

    # 4) Одна тема по времени суток
    time_topics = {
        "утро": "Как проходит ваше идеальное утро?",
        "день": "Куда любите выбираться среди дня?",
        "вечер": "Как обычно любите проводить вечера?",
        "ночь": "Самое запоминающееся ночное приключение",
    }
    if time_of_day.lower() in time_topics:
        topics.append(time_topics[time_of_day.lower()])

    # 5) Добираем до четырёх из универсального списка
    universal = [
        "Что нового произошло с момента вашей последней встречи?",
        f"Как должна пройти идеальная встреча с «{companion}»?",
        "Места в вашем городе, которые хочется посетить вместе",
    ]
    for topic in universal:
        if len(topics) >= 4:
            break
        topics.append(topic)

    return topics[:4]


# ============================================================
# 7. ВНЕШНИЕ СЕРВИСЫ И СТРАХОВКА ОТ ПАДЕНИЙ.
#
#    Уровни источников мест и тем (от лучшего к запасному):
#
#      Уровень 1: OpenRouter (ИИ)        — нужны OPENROUTER_API_KEY и интернет
#      Уровень 2: Google Places          — нужны GOOGLE_API_KEY и интернет
#      Уровень 3: заглушка PLACES_LIBRARY — работает всегда
#
#    КАК РАБОТАЕТ СТРАХОВКА: каждая функция внешнего сервиса возвращает
#    None вместо исключения, если ключ не задан, сеть недоступна,
#    ключ не принят или ответ не по формату. Эндпоинт /api/generate
#    просто переходит на следующий уровень. Ошибки 500 не бывает:
#    пользователь всегда получает 200 OK с местами и темами.
# ============================================================

# --- OpenRouter (ИИ) ---

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Модель по умолчанию — "openrouter/free": специальный БЕСПЛАТНЫЙ роутер
# OpenRouter, который сам выбирает любую доступную бесплатную модель,
# поэтому его слаг не устаревает. Свою модель можно задать без правки
# кода: создай переменную окружения OPENROUTER_MODEL (список моделей:
# https://openrouter.ai/models)
AI_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")

# Запасные бесплатные модели: если основная недоступна (исчерпан дневной
# лимит бесплатных запросов, слаг устарел и т.п.), пробуем следующую.
AI_MODEL_FALLBACKS = [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-chat:free",
]

# Сколько секунд ждать ответ нейросети (она может думать подолго)
AI_TIMEOUT_SECONDS = 60


def build_prompt(city_name: str, companion: str, meeting_type: str,
                 atmosphere: list[str], time_of_day: str, notes: str,
                 budget_min: int = 0, budget_max: int = 0) -> str:
    """Собирает текст запроса к нейросети из параметров встречи."""
    atmosphere_text = ", ".join(atmosphere) if atmosphere else "любая"
    notes_text = notes if notes else "нет"
    type_text = meeting_type if meeting_type else "не указан"
    budget_text = ""
    if budget_max > 0 and budget_min > 0:
        budget_text = f"Бюджет на человека: от {budget_min} до {budget_max} рублей. "
    elif budget_max > 0:
        budget_text = f"Бюджет на человека: до {budget_max} рублей. "
    return (
        f'Подбери 3 конкретных реальных места в городе "{city_name}", '
        f'куда можно пойти на встречу. С кем встреча: {companion}. '
        f'Формат встречи: {type_text}. '
        f'Желаемая атмосфера: {atmosphere_text}. Время суток: {time_of_day}. '
        f'{budget_text}'
        f'Пожелания: {notes_text}. '
        'Для каждого места укажи категорию (кафе, парк, музей и т.п.) и напиши '
        'короткое описание (1-2 предложения), почему оно подходит под ситуацию. '
        'Дополнительно предложи 4 темы для разговора на этой встрече. '
        'Ответь СТРОГО одним JSON-объектом без какого-либо другого текста, в формате: '
        '{"places": [{"title": "название", "category": "категория", '
        '"description": "описание"}], '
        '"topics": ["тема 1", "тема 2", "тема 3", "тема 4"]}'
    )


def ask_openrouter(prompt: str) -> Optional[str]:
    """Уровень 1: отправляет промпт в OpenRouter и возвращает текст ответа.
    Пробует основную модель, затем запасные бесплатные из AI_MODEL_FALLBACKS.
    Если ключа нет или все модели недоступны — None (страховка)."""
    api_key = os.getenv("OPENROUTER_API_KEY")   # <-- ПРОВЕРКА КЛЮЧА ИИ
    if not api_key:
        print("OpenRouter: ключ OPENROUTER_API_KEY не задан — пропускаем уровень ИИ.")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # OpenRouter просит называть проект — так он видит, откуда трафик
        "HTTP-Referer": "http://127.0.0.1:8000",
        "X-Title": "TET-a-TET",
    }

    for model in [AI_MODEL] + AI_MODEL_FALLBACKS:
        body = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.8,     # 0.8 = немного творчества в ответах
            "max_tokens": 1200,     # предел длины ответа нейросети
        }
        try:
            response = requests.post(OPENROUTER_URL, headers=headers, json=body,
                                     timeout=AI_TIMEOUT_SECONDS)
            response.raise_for_status()  # исключение, если код ответа 4xx/5xx
            content = response.json()["choices"][0]["message"]["content"]
            print(f"OpenRouter: ответила модель {model}.")
            return content
        except (requests.RequestException, KeyError, IndexError, ValueError) as error:
            # Сеть недоступна, ключ не принят, лимит бесплатной модели
            # исчерпан — пробуем следующую модель, это НЕ ошибка сервера.
            print(f"OpenRouter: модель {model} недоступна ({error}) — пробуем следующую.")

    print("OpenRouter: ни одна модель не ответила — пропускаем уровень ИИ.")
    return None


def parse_ai_answer(text: Optional[str]) -> Optional[GenerateResponse]:
    """Превращает текст нейросети в GenerateResponse.
    Возвращает None, если разобрать не получилось (тогда будет заглушка)."""
    if not text:
        return None

    # Нейросети любят добавлять текст вокруг JSON или маркировку ```json.
    # Надёжный способ: взять кусок между первой "{" и последней "}".
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end <= start:
        return None

    try:
        data = json.loads(text[start:end + 1])
    except ValueError:
        return None

    try:
        places = [
            PlaceOut(
                title=str(place.get("title", "Место")),
                category=str(place.get("category", "место для встречи")),
                description=str(place.get("description", "")),
            )
            for place in data["places"][:3]
        ]
        topics = [str(topic) for topic in data["topics"][:4]]
    except (KeyError, TypeError, AttributeError):
        return None

    if not places or not topics:
        return None

    return GenerateResponse(places=places, topics=topics)


# --- Google Places (настоящие места) ---

# Google Places API (New): поиск по текстовой фразе
GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

# Сколько секунд ждать ответ Google (он отвечает быстро)
GOOGLE_TIMEOUT_SECONDS = 10

# Какие типы мест Google переводить на русский в поле category
PLACE_TYPE_RU = {
    "cafe": "кафе",
    "restaurant": "ресторан",
    "park": "парк",
    "museum": "музей",
    "bar": "бар",
    "bowling_alley": "боулинг",
    "art_gallery": "галерея",
    "tourist_attraction": "достопримечательность",
    "zoo": "зоопарк",
    "movie_theater": "кинотеатр",
}

# Какое место искать в Google под каждую атмосферу
ATMOSPHERE_TO_SEARCH = {
    "уютная": "кафе",
    "спокойная": "парк",
    "романтическая": "ресторан",
    "веселая": "антикафе",
    "шумная": "боулинг",
    "формальная": "ресторан",
    "неформальная": "антикафе",
    "нейтральная": "кафе",
    "активная": "квест",
}


def get_places_from_google(city_name: str, atmosphere: list[str]) -> Optional[list[PlaceOut]]:
    """Уровень 2: ищет настоящие места в городе через Google Places.
    Если ключа нет или запрос не удался — возвращает None (страховка)."""
    api_key = os.getenv("GOOGLE_API_KEY")       # <-- ПРОВЕРКА КЛЮЧА GOOGLE
    if not api_key:
        print("Google Places: ключ GOOGLE_API_KEY не задан — пропускаем уровень Google.")
        return None

    # Выбираем, ЧТО искать: первое совпадение атмосферы или кафе по умолчанию
    search_word = "кафе"
    for tag in atmosphere:
        if tag in ATMOSPHERE_TO_SEARCH:
            search_word = ATMOSPHERE_TO_SEARCH[tag]
            break

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        # Какие поля возвращать — за неиспрошенные поля Google берёт деньги
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,"
                            "places.rating,places.primaryType",
    }
    body = {
        "textQuery": f"{search_word} {city_name}",
        "languageCode": "ru",
        "maxResultCount": 3,
    }

    try:
        response = requests.post(GOOGLE_PLACES_URL, headers=headers, json=body,
                                 timeout=GOOGLE_TIMEOUT_SECONDS)
        response.raise_for_status()
        raw_places = response.json().get("places", [])
    except (requests.RequestException, ValueError) as error:
        print(f"Google Places: запрос не удался ({error}) — пропускаем уровень Google.")
        return None

    if not raw_places:
        print("Google Places: ничего не нашлось — пропускаем уровень Google.")
        return None

    # Нормализация: сырой ответ Google -> наши DTO PlaceOut
    result = []
    for place in raw_places[:3]:
        name = (place.get("displayName") or {}).get("text", "Место")
        address = place.get("formattedAddress", "")
        rating = place.get("rating")
        place_type = place.get("primaryType", "")

        description = f"Настоящее место по данным Google Карт: {address}"
        if rating:
            description += f". Рейтинг {rating} из 5"
        description += "."

        result.append(PlaceOut(
            title=name,
            category=PLACE_TYPE_RU.get(place_type, search_word),
            description=description,
        ))

    return result


# ============================================================
# 8. ГЛАВНАЯ СТРАНИЦА (HTML-визитка проекта)
# ============================================================

HOME_HTML = """<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TET-a-TET — Генератор мест и тем для встреч</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Segoe UI", Arial, sans-serif;
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            padding: 24px;
            background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0e7490 100%);
            color: #f9fafb;
        }
        .card {
            max-width: 760px; width: 100%;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 24px;
            padding: 48px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        }
        h1 { font-size: 42px; margin-bottom: 6px; }
        .tagline { font-size: 18px; color: #bae6fd; margin-bottom: 20px; }
        .description { font-size: 16px; line-height: 1.65; margin-bottom: 8px; color: #e5e7eb; }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px;
             color: #7dd3fc; margin: 26px 0 12px; }
        .chips { display: flex; flex-wrap: wrap; gap: 10px; }
        .chip {
            background: rgba(255, 255, 255, 0.14);
            border: 1px solid rgba(255, 255, 255, 0.22);
            padding: 8px 16px; border-radius: 999px; font-size: 15px;
        }
        .docs-button {
            display: inline-block; margin-top: 30px;
            background: #fbbf24; color: #0f172a;
            font-weight: 700; text-decoration: none;
            padding: 13px 26px; border-radius: 12px;
        }
        .docs-button:hover { background: #fcd34d; }
        .hint { margin-top: 14px; font-size: 13px; color: rgba(249, 250, 251, 0.65); }
    </style>
</head>
<body>
    <main class="card">
        <h1>Добро пожаловать в TET-a-TET! 👋</h1>
        <p class="tagline">Генератор мест и тем для встреч</p>
        <p class="description">
            TET-a-TET придуман, чтобы встречи не начинались со слов
            «ну... куда пойдём?». Расскажи, с кем идёшь, какая атмосфера нужна
            и в какое время, — а мы умно подберём 3 подходящих места
            в твоём городе и предложим 4 темы, о которых точно будет
            о чём поговорить.
        </p>

        <h2>Наша команда</h2>
        <div class="chips">
            <span class="chip">Арсений</span>
            <span class="chip">Ника</span>
            <span class="chip">Кира</span>
            <span class="chip">Данил</span>
        </div>

        <h2>Технологии</h2>
        <div class="chips">
            <span class="chip">Python</span>
            <span class="chip">FastAPI</span>
            <span class="chip">SQLAlchemy</span>
            <span class="chip">SQLite</span>
            <span class="chip">ИИ (OpenRouter)</span>
            <span class="chip">Google Places</span>
        </div>

        <a class="docs-button" href="/docs">Открыть документацию API &rarr;</a>
        <p class="hint">GET /api/countries &middot; GET /api/cities &middot;
            POST /api/generate &middot; POST /api/auth/registration &middot;
            POST /api/auth/login &middot; GET /api/profileCard</p>
    </main>
</body>
</html>"""


@app.get("/", response_class=HTMLResponse)
def home():
    """Главная страница — красивая HTML-визитка проекта."""
    return HOME_HTML


# ============================================================
# 9. ЭНДПОИНТЫ API
# ============================================================

@app.get("/api/countries", response_model=CountriesResponse)
def get_countries(search: Optional[str] = None, slug: Optional[str] = None,
                  db: Session = Depends(get_db)):
    """Список стран. Параметры (можно вместе или по отдельности):
    ?search=рос — регистронезависимый поиск по названию;
    ?slug=russia — страна по слагу."""
    query = db.query(Country)

    # Точное совпадение слага — фильтруем прямо в SQL
    if slug:
        query = query.filter(Country.slug == slug.lower())

    countries = query.all()

    # Поиск по названию — на Python, а не средствами SQLite: SQLite не умеет
    # понижать регистр русских букв, а Python — умеет.
    if search:
        search_lower = search.lower()
        countries = [c for c in countries if search_lower in c.name.lower()]

    return {"data": [to_country_out(c) for c in countries]}


@app.get("/api/cities", response_model=CitiesResponse)
def get_cities(countryId: Optional[str] = None, countrySlug: Optional[str] = None,
               slug: Optional[str] = None, search: Optional[str] = None,
               db: Session = Depends(get_db)):
    """Список городов. Параметры (можно использовать вместе или по отдельности):
    ?countryId=ru — города одной страны по её коду;
    ?countrySlug=russia — города страны по её слагу;
    ?slug=moscow — один город по своему слагу;
    ?search=моск — регистронезависимый поиск по названию города."""
    query = db.query(City)

    # Точные совпадения кодов и слагов — фильтруем прямо в SQL
    if countryId:
        query = query.filter(City.country_id == countryId)
    if countrySlug:
        # соединяем таблицы: город -> его страна -> слаг страны
        query = query.join(Country).filter(Country.slug == countrySlug.lower())
    if slug:
        query = query.filter(City.slug == slug.lower())

    cities = query.all()

    # Поиск по названию — на Python (см. комментарий в /api/countries)
    if search:
        search_lower = search.lower()
        cities = [c for c in cities if search_lower in c.name.lower()]

    return {"data": [to_city_out(c) for c in cities]}


@app.post("/api/auth/registration", response_model=AuthResponse)
def registration(request: RegistrationRequest, db: Session = Depends(get_db)):
    """Создаёт аккаунт (User) и карточку профиля (UserProfile).

    Всегда отвечает 200 OK — результат смотри в поле success:
    True = аккаунт создан, False = отказ (занят email или ник,
    объяснение — в message).
    """
    # Проверка 1: email не должен быть занят
    if db.query(User).filter(User.email == request.email).first() is not None:
        return AuthResponse(success=False,
                            message="Пользователь с таким email уже существует")

    # Проверка 2: ник не должен быть занят
    if db.query(UserProfile).filter(UserProfile.user_name == request.userName).first() is not None:
        return AuthResponse(success=False,
                            message=f"Ник «{request.userName}» уже занят")

    # Создаём аккаунт и профиль одной транзакцией
    user = User(email=request.email, password_hash=hash_password(request.password))
    db.add(user)
    db.flush()   # получаем user.id до commit

    profile = UserProfile(
        user_id=user.id,
        name=request.name or "Без имени",
        age=request.age,
        user_name=request.userName,
        description=request.description,
        photo_profile=request.photoProfile,
        favourites=False,
    )
    db.add(profile)
    db.commit()

    print(f"Регистрация: создан пользователь {request.email} (профиль {profile.profile_id}).")
    return AuthResponse(success=True, message="Аккаунт создан",
                        profileId=profile.profile_id)


@app.post("/api/auth/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Проверяет email и пароль. Всегда 200 OK — смотри поле success:
    True = вход выполнен (в profileId — номер профиля пользователя),
    False = неверный email или пароль."""
    user = db.query(User).filter(User.email == request.email).first()

    # Один и тот же текст ошибки для «нет такого email» и «неверный пароль» —
    # так злоумышленник не узнает, какие email зарегистрированы.
    if user is None or user.password_hash != hash_password(request.password):
        return AuthResponse(success=False, message="Неверный email или пароль")

    profile_id = user.profile.profile_id if user.profile else None
    return AuthResponse(success=True, message="Вход выполнен", profileId=profile_id)


@app.get("/api/profileCard", response_model=ProfileCardsResponse)
def get_profile_cards(db: Session = Depends(get_db)):
    """Карточки всех пользователей — витрина профилей для фронтенда."""
    profiles = db.query(UserProfile).all()
    return {"data": [to_profile_card_out(p) for p in profiles]}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    """Подбирает 3 места и 4 темы для разговора. Три уровня надёжности:

      Уровень 1 — OpenRouter (ИИ): места + темы одним ответом;
      Уровень 2 — Google Places: настоящие места + локальные темы;
      Уровень 3 — полная заглушка PLACES_LIBRARY.

    Ни на одном уровне ошибка 500 не выходит наружу: при любой проблеме
    включается следующий уровень, и пользователь всегда получает ответ.
    """
    # Подсказки по атмосфере из формата встречи: бэкенд сам понимает,
    # какие места подходят ("Деловая встреча" -> формальная и т.д.)
    hints = MEETING_TYPE_HINTS.get(request.meetingType, [])
    effective_atmosphere = request.atmosphere + hints

    # --- Уровень 1: настоящий ИИ (OpenRouter) ---
    prompt = build_prompt(request.cityName, request.companion,
                          request.meetingType, request.atmosphere,
                          request.timeOfDay, request.customNotes,
                          request.budgetMin, request.budgetMax)
    ai_result = parse_ai_answer(ask_openrouter(prompt))
    if ai_result is not None:
        print("Генерация: источник — OpenRouter (ИИ).")
        return ai_result

    # --- Уровень 2: настоящие места из Google Places, темы — локальные ---
    google_places = get_places_from_google(request.cityName, effective_atmosphere)
    if google_places is not None:
        print("Генерация: места — Google Places, темы — локальный генератор.")
        return GenerateResponse(
            places=google_places,
            topics=make_topics(request.customNotes, request.atmosphere,
                               request.timeOfDay, request.companion,
                               request.meetingType),
        )

    # --- Уровень 3: полная заглушка (работает всегда) ---
    print("Генерация: источник — локальная заглушка PLACES_LIBRARY.")
    return GenerateResponse(
        places=pick_places(effective_atmosphere, request.cityName, request.timeOfDay),
        topics=make_topics(request.customNotes, request.atmosphere,
                           request.timeOfDay, request.companion,
                           request.meetingType),
    )


# ============================================================
# 10. ЗАПУСК СЕРВЕРА: python main.py
# ============================================================
if __name__ == "__main__":
    import uvicorn

    print("Сервер TET-a-TET запускается...")
    print("Главная страница: http://127.0.0.1:8000/")
    print("Документация API: http://127.0.0.1:8000/docs")
    print("Ключи внешних сервисов (необязательны):")
    print("  OPENROUTER_API_KEY:",
          "задан — ИИ включён" if os.getenv("OPENROUTER_API_KEY")
          else "не задан — ИИ отключён")
    print("  GOOGLE_API_KEY:",
          "задан — Google Places включён" if os.getenv("GOOGLE_API_KEY")
          else "не задан — Google Places отключён")
    print("Без ключей всё работает на встроенной заглушке.")
    print("Для остановки нажмите Ctrl+C")
    uvicorn.run(app, host="127.0.0.1", port=8000)
