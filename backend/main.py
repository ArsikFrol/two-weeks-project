import json
import os
import random
from typing import Optional

import requests
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import AliasChoices, BaseModel, Field, field_validator, model_validator
from sqlalchemy import Column, ForeignKey, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker


DATABASE_URL = "sqlite:///./places.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



class Country(Base):
    """Страна. id — короткий код: 'ru', 'kz', 'uz', 'by'."""
    __tablename__ = "countries"

    id = Column(String, primary_key=True)        
    name = Column(String, nullable=False)        
    count_places = Column(Integer, default=0)    

    cities = relationship("City", back_populates="country")


class City(Base):
    """Город. id — код вида 'ru-mow'. count_places — строка, потому что
    по контракту с фронтендом она может быть '50+'."""
    __tablename__ = "cities"

    id = Column(String, primary_key=True)        
    name = Column(String, nullable=False)        
    count_places = Column(String, default="0")   
    country_id = Column(String, ForeignKey("countries.id"), nullable=False)

    country = relationship("Country", back_populates="cities")



def seed_database() -> None:
    """Создаёт таблицы и один раз заполняет их странами и городами.
    Если страны в базе уже есть — ничего не делает."""
    Base.metadata.create_all(bind=engine)  

    db = SessionLocal()
    try:
        if db.query(Country).first() is not None: 
            return

        data = [
            ("ru", "Россия", 115, [
                ("ru-mow", "Москва", "50+"),
                ("ru-spb", "Санкт-Петербург", "40+"),
                ("ru-ekb", "Екатеринбург", "30+"),
                ("ru-kzn", "Казань", "20+"),
                ("ru-nsk", "Новосибирск", "15+"),
            ]),
            ("kz", "Казахстан", 55, [
                ("kz-ala", "Алматы", "25+"),
                ("kz-ast", "Астана", "20+"),
                ("kz-shy", "Шымкент", "10+"),
            ]),
            ("uz", "Узбекистан", 38, [
                ("uz-tas", "Ташкент", "20+"),
                ("uz-sam", "Самарканд", "10+"),
                ("uz-buk", "Бухара", "8+"),
            ]),
            ("by", "Беларусь", 46, [
                ("by-msq", "Минск", "25+"),
                ("by-gom", "Гомель", "8+"),
                ("by-brst", "Брест", "7+"),
                ("by-grd", "Гродно", "6+"),
            ]),
        ]

        for country_id, country_name, total, cities in data:
            db.add(Country(id=country_id, name=country_name, count_places=total))
            for city_id, city_name, places in cities:
                db.add(City(id=city_id, name=city_name,
                            count_places=places, country_id=country_id))

        db.commit()
        print("База данных places.db создана и заполнена тестовыми данными.")
    finally:
        db.close()


seed_database()  



class CountryOut(BaseModel):
    """Страна (вложенный объект ответа)."""
    countryId: str
    name: str
    countPlaces: int


class CountriesResponse(BaseModel):
    """Ответ GET /api/countries."""
    data: list[CountryOut]


class CityOut(BaseModel):
    """Город (вложенный объект ответа)."""
    cityId: str
    name: str
    countPlaces: str


class CitiesResponse(BaseModel):
    """Ответ GET /api/cities."""
    data: list[CityOut]



class PlaceOut(BaseModel):
    """Одно предложенное место (вложенный объект ответа)."""
    title: str
    category: str
    description: str


class GenerateResponse(BaseModel):
    """Ответ POST /api/generate — ровно та структура, что согласована
    с фронтендом: 3 места + 4 темы для разговора."""
    places: list[PlaceOut]
    topics: list[str]


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


class GenerateRequest(BaseModel):
    """Тело запроса POST /api/generate (входящий запрос верхнего уровня).

    Принимает ДВА формата — каноничный и форму Арсения:

      1) Каноничный (наш): companion, meetingType, atmosphere (список
         русских тегов), timeOfDay, countryName, cityName, customNotes.

      2) Формат формы фронтендера: person="wife", metting="presentation"
         (да, с опечаткой — принимаем как есть), atmosphere="quiet"
         (строкой), city, country, min/max (бюджет), time="22:01".
         date, firstName, lastName пока игнорируются («на будущее»).

    Поля-алиасы означают: запрос можно прислать и со старым именем
    (cityName), и с новым (city) — Pydantic поймёт оба. Английские
    значения автоматически переводятся в русские теги, поэтому вся
    остальная логика (подсказки, заглушка, промпт) работает как раньше.
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
        """Атмосфера может прийти строкой ("quiet") или списком — принимаем оба
        варианта и переводим английские значения в русские теги."""
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


def to_country_out(country: Country) -> CountryOut:
    return CountryOut(
        countryId=country.id,
        name=country.name,
        countPlaces=country.count_places,
    )


def to_city_out(city: City) -> CityOut:
    return CityOut(
        cityId=city.id,
        name=city.name,
        countPlaces=city.count_places,
    )



app = FastAPI(
    title="TET-a-TET API",
    description="Генератор мест и тем для встреч",
    version="3.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],  
    allow_headers=["*"],
)


def get_db():
    """Даёт эндпоинту сессию базы и закрывает её после ответа."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


TIME_WORDS = {
    "утро": "утром",
    "день": "днём",
    "вечер": "вечером",
    "ночь": "ночью",
}

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

MEETING_TYPE_TOPICS = {
    "Деловая встреча": "Какие цели у встречи и какой результат нужен каждому?",
    "Собеседование": "Почему вам интересна эта роль и эта команда?",
    "Переговоры": "Какие условия важнее всего каждой из сторон?",
    "Свидание": "Что вас зацепило друг в друге при знакомстве?",
    "Дружеская встреча": "Что нового случилось с прошлой встречи?",
    "Семейная встреча": "Новости семьи и планы на ближайшие праздники",
    "Мозговой штурм": "Какая идея кажется самой смелой и почему бы её не попробовать?",
}


def pick_places(atmosphere: list[str], city_name: str, time_of_day: str) -> list[PlaceOut]:
    """Заглушка: возвращает 3 места из библиотеки — сначала те,
    что совпадают по атмосфере."""
    wanted = set(atmosphere)

    matching = [p for p in PLACES_LIBRARY if wanted & set(p["tags"])]
    others = [p for p in PLACES_LIBRARY if not wanted & set(p["tags"])]

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


def make_topics(notes: str, atmosphere: list[str],
                time_of_day: str, companion: str,
                meeting_type: str = "") -> list[str]:
    """Заглушка: собирает 4 темы для разговора из пожеланий пользователя."""
    topics: list[str] = []
    if notes:
        topics.append(f"Обсудить пожелание «{notes}»: что вам в этом нравится и почему?")

    if meeting_type in MEETING_TYPE_TOPICS and len(topics) < 4:
        topics.append(MEETING_TYPE_TOPICS[meeting_type])

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
            break  

    time_topics = {
        "утро": "Как проходит ваше идеальное утро?",
        "день": "Куда любите выбираться среди дня?",
        "вечер": "Как обычно любите проводить вечера?",
        "ночь": "Самое запоминающееся ночное приключение",
    }
    if time_of_day.lower() in time_topics:
        topics.append(time_topics[time_of_day.lower()])

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



OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

AI_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-5.6")

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
    Если ключа нет или что-то пошло не так — возвращает None (страховка)."""
    api_key = os.getenv("OPENROUTER_API_KEY")   
    if not api_key:
        print("OpenRouter: ключ OPENROUTER_API_KEY не задан — пропускаем уровень ИИ.")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:8000",
        "X-Title": "TET-a-TET",
    }
    body = {
        "model": AI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.8,     
        "max_tokens": 1200,     
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=body,
                                 timeout=AI_TIMEOUT_SECONDS)
        response.raise_for_status()  
        return response.json()["choices"][0]["message"]["content"]
    except (requests.RequestException, KeyError, IndexError, ValueError) as error:
        print(f"OpenRouter: запрос не удался ({error}) — пропускаем уровень ИИ.")
        return None


def parse_ai_answer(text: Optional[str]) -> Optional[GenerateResponse]:
    """Превращает текст нейросети в GenerateResponse.
    Возвращает None, если разобрать не получилось (тогда будет заглушка)."""
    if not text:
        return None

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


GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

GOOGLE_TIMEOUT_SECONDS = 10

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

    search_word = "кафе"
    for tag in atmosphere:
        if tag in ATMOSPHERE_TO_SEARCH:
            search_word = ATMOSPHERE_TO_SEARCH[tag]
            break

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
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
            <span class="chip">Настя</span>
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
        <p class="hint">GET /api/countries &middot; GET /api/cities &middot; POST /api/generate</p>
    </main>
</body>
</html>"""


@app.get("/", response_class=HTMLResponse)
def home():
    """Главная страница — красивая HTML-визитка проекта."""
    return HOME_HTML



@app.get("/api/countries", response_model=CountriesResponse)
def get_countries(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Список стран. Необязательный ?search= — поиск по названию.

    Поиск делаем на Python, а не средствами SQLite: SQLite не умеет
    понижать регистр русских букв, а Python — умеет.
    """
    countries = db.query(Country).all()

    if search:
        search_lower = search.lower()
        countries = [c for c in countries if search_lower in c.name.lower()]

    return {"data": [to_country_out(c) for c in countries]}


@app.get("/api/cities", response_model=CitiesResponse)
def get_cities(countryId: Optional[str] = None, search: Optional[str] = None,
               db: Session = Depends(get_db)):
    """Список городов. ?countryId= — города одной страны,
    ?search= — регистронезависимый поиск по названию города.
    Параметры можно использовать вместе или по отдельности."""
    query = db.query(City)

    if countryId:
        query = query.filter(City.country_id == countryId)

    cities = query.all()

    if search:
        search_lower = search.lower()
        cities = [c for c in cities if search_lower in c.name.lower()]

    return {"data": [to_city_out(c) for c in cities]}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    """Подбирает 3 места и 4 темы для разговора. Три уровня надёжности:

      Уровень 1 — OpenRouter (ИИ): места + темы одним ответом;
      Уровень 2 — Google Places: настоящие места + локальные темы;
      Уровень 3 — полная заглушка PLACES_LIBRARY.

    Ни на одном уровне ошибка 500 не выходит наружу: при любой проблеме
    включается следующий уровень, и пользователь всегда получает ответ.
    """
    hints = MEETING_TYPE_HINTS.get(request.meetingType, [])
    effective_atmosphere = request.atmosphere + hints

    prompt = build_prompt(request.cityName, request.companion,
                          request.meetingType, request.atmosphere,
                          request.timeOfDay, request.customNotes,
                          request.budgetMin, request.budgetMax)
    ai_result = parse_ai_answer(ask_openrouter(prompt))
    if ai_result is not None:
        print("Генерация: источник — OpenRouter (ИИ).")
        return ai_result

    google_places = get_places_from_google(request.cityName, effective_atmosphere)
    if google_places is not None:
        print("Генерация: места — Google Places, темы — локальный генератор.")
        return GenerateResponse(
            places=google_places,
            topics=make_topics(request.customNotes, request.atmosphere,
                               request.timeOfDay, request.companion,
                               request.meetingType),
        )

    print("Генерация: источник — локальная заглушка PLACES_LIBRARY.")
    return GenerateResponse(
        places=pick_places(effective_atmosphere, request.cityName, request.timeOfDay),
        topics=make_topics(request.customNotes, request.atmosphere,
                           request.timeOfDay, request.companion,
                           request.meetingType),
    )


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
