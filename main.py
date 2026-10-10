import random
from typing import Optional

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

# 1 БАЗАДАННЫХ (SQLite)

DATABASE_URL = "sqlite:///./places.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# 2 описание таблиц бд


class Country(Base):
    """Страна. id — короткий код: 'ru', 'kz', 'uz', 'by'."""
    __tablename__ = "countries"

    id = Column(String, primary_key=True)        
    name = Column(String, nullable=False)        # "Россия"
    count_places = Column(Integer, default=0)    # всего мест в стране (число)

    cities = relationship("City", back_populates="country")


class City(Base):
    __tablename__ = "cities"

    id = Column(String, primary_key=True)        
    name = Column(String, nullable=False)        # "Москва"
    count_places = Column(String, default="0")   
    country_id = Column(String, ForeignKey("countries.id"), nullable=False)

    
    country = relationship("Country", back_populates="cities")



# 3 НАЧАЛЬНОЕ ЗАПОЛНЕНИЕ БАЗЫ (SEED)


def seed_database() -> None:

    Base.metadata.create_all(bind=engine)  # создаёт таблицы

    db = SessionLocal()
    try:
        if db.query(Country).first() is not None:  
            return

        # [(код города, название, мест), ...]
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


# 4 PYDANTIC-СХЕМЫ (формат запросов и ответов API)
#    поля одинаковые с JSON

class CountryOut(BaseModel):
    countryId: str
    name: str
    countPlaces: int


class CountriesResponse(BaseModel):
    data: list[CountryOut]


class CityOut(BaseModel):
    cityId: str
    name: str
    countPlaces: str


class CitiesResponse(BaseModel):
    data: list[CityOut]


class PlaceOut(BaseModel):
    """Одно предложенное место"""
    title: str
    category: str
    description: str


class GenerateOut(BaseModel):
    """Ответ /api/generate: 3 места + 4 темы для разговора"""
    places: list[PlaceOut]
    topics: list[str]


class GenerateIn(BaseModel):
   
    companion: str                 # с кем встреча
    atmosphere: list[str] = []     # желаемая атмосфера (теги, макс 4)
    timeOfDay: str                 # "утро" / "день" / "вечер" / "ночь"
    countryName: str               # Россия
    cityName: str                  # Екатеринбург
    customNotes: str = ""          # доп инфа


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


# 5 ПРИЛОЖЕНИЕ FASTAPI и CORS

app = FastAPI(
    title="YouMi API",
    description="Генератор мест и тем для встреч",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # зап с люб источника
    allow_methods=["*"],   # HTTP-методы
    allow_headers=["*"],
)


def get_db():
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 6 ГЕНЕРАТОР МЕСТ И ТЕМ тут пока что будет заглушка, как выберем ии, получим ключ - будет ии (платный так же как и м)

# время суток
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


def pick_places(atmosphere: list[str], city_name: str, time_of_day: str) -> list[PlaceOut]:
    """Возвращает 3 места: сначала те, что совпадают по атмосфере"""
    wanted = set(atmosphere)

    matching = [p for p in PLACES_LIBRARY if wanted & set(p["tags"])]
    others = [p for p in PLACES_LIBRARY if not wanted & set(p["tags"])]

    # в каждом запросе разный варик
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
                time_of_day: str, companion: str) -> list[str]:
    """Собирает 4 темы для разговора из пожеланий пользователя"""
    topics: list[str] = []

    # 1.1 доп инфа
    if notes:
        topics.append(f"Обсудить пожелание «{notes}»: что вам в этом нравится и почему?")

    # 2.1 темы на основе атмосферы
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

    # 3.1 одна тема на основе времени суток
    time_topics = {
        "утро": "Как проходит ваше идеальное утро?",
        "день": "Куда любите выбираться среди дня?",
        "вечер": "Как обычно любите проводить вечера?",
        "ночь": "Самое запоминающееся ночное приключение",
    }
    if time_of_day.lower() in time_topics:
        topics.append(time_topics[time_of_day.lower()])

    # 4.1 рандом из универсального списка
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


# 7 ЭНДПОИНТЫ API


@app.get("/")
def root():
    
    return {"message": "YouMi API работает. Документация: http://127.0.0.1:8000/docs"}


@app.get("/api/countries", response_model=CountriesResponse)
def get_countries(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Список стран. Необязательный ?search= — поиск по названию.

    
    countries = db.query(Country).all()

    if search:
        search_lower = search.lower()
        countries = [c for c in countries if search_lower in c.name.lower()]

    return {"data": [to_country_out(c) for c in countries]}


@app.get("/api/cities", response_model=CitiesResponse)
def get_cities(countryId: Optional[str] = None, search: Optional[str] = None,
               db: Session = Depends(get_db)):
    
    query = db.query(City)
    if countryId:
        query = query.filter(City.country_id == countryId)

    cities = query.all()

    
    if search:
        search_lower = search.lower()
        cities = [c for c in cities if search_lower in c.name.lower()]

    return {"data": [to_city_out(c) for c in cities]}


@app.post("/api/generate", response_model=GenerateOut)
def generate(data: GenerateIn):
    
    places = pick_places(data.atmosphere, data.cityName, data.timeOfDay)
    topics = make_topics(data.customNotes, data.atmosphere,
                         data.timeOfDay, data.companion)
    return GenerateOut(places=places, topics=topics)




if __name__ == "__main__":
    import uvicorn

    print("Сервер YouMi запускается...")
    print("Документация API: http://127.0.0.1:8000/docs")
    print("Для остановки нажмите Ctrl+C")
    uvicorn.run(app, host="127.0.0.1", port=8000)
