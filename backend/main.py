import json
import os
import random
from typing import Optional

import requests
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
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
   
    __tablename__ = "cities"

    id = Column(String, primary_key=True)        
    name = Column(String, nullable=False)        
    count_places = Column(String, default="0")   
    country_id = Column(String, ForeignKey("countries.id"), nullable=False)

    country = relationship("Country", back_populates="cities")


def seed_database() -> None:
   
    Base.metadata.create_all(bind=engine)  

    db = SessionLocal()
    try:
        if db.query(Country).first() is not None:  # база уже заполнена
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


seed_database()  # выполняется сразу при запуске файла



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
   
    title: str
    category: str
    description: str


class GenerateResponse(BaseModel):
   
    places: list[PlaceOut]
    topics: list[str]
    aiUsed: bool = False


class GenerateRequest(BaseModel):
   
    companion: str                 
    atmosphere: list[str] = []     
    timeOfDay: str                 
    countryName: str               
    cityName: str                  
    customNotes: str = ""          


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
    title="YouMi API",
    description="Генератор мест и тем для встреч",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # запросы с любого источника
    allow_methods=["*"],   # любые HTTP-методы
    allow_headers=["*"],
)


def get_db():
    
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


def pick_places(atmosphere: list[str], city_name: str, time_of_day: str) -> list[PlaceOut]:
    """Возвращает 3 места: сначала те, что совпадают по атмосфере."""
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
                time_of_day: str, companion: str) -> list[str]:
    
    topics: list[str] = []

    if notes:
        topics.append(f"Обсудить пожелание «{notes}»: что вам в этом нравится и почему?")

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

AI_MODEL = os.getenv("OPENROUTER_MODEL", "google/ChatGPT 5.6")

AI_TIMEOUT_SECONDS = 60


def build_prompt(city_name: str, companion: str, atmosphere: list[str],
                 time_of_day: str, notes: str) -> str:
    """Собирает текст запроса к нейросети из параметров встречи."""
    atmosphere_text = ", ".join(atmosphere) if atmosphere else "любая"
    notes_text = notes if notes else "нет"
    return (
        f'Подбери 3 конкретных реальных места в городе "{city_name}", '
        f'куда можно пойти на встречу. С кем встреча: {companion}. '
        f'Желаемая атмосфера: {atmosphere_text}. Время суток: {time_of_day}. '
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
    """Отправляет промпт в OpenRouter и возвращает текст ответа нейросети.
    Если ключа нет или что-то пошло не так — возвращает None."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("OpenRouter: ключ OPENROUTER_API_KEY не задан — используем заглушку.")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:8000",
        "X-Title": "YouMi",
    }
    body = {
        "model": AI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.8,     # 0.8 = немного творчества в ответах
        "max_tokens": 1200,     # предел длины ответа нейросети
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=body,
                                 timeout=AI_TIMEOUT_SECONDS)
        response.raise_for_status()  
        return response.json()["choices"][0]["message"]["content"]
    except (requests.RequestException, KeyError, IndexError, ValueError) as error:
        print(f"OpenRouter: запрос не удался ({error}) — используем заглушку.")
        return None


def parse_ai_answer(text: Optional[str]) -> Optional[GenerateResponse]:
  
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

    return GenerateResponse(places=places, topics=topics, aiUsed=True)



HOME_HTML = """<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouMi — Генератор мест и тем для встреч</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Segoe UI", Arial, sans-serif;
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            padding: 24px;
            background: linear-gradient(135deg, #312e81 0%, #6d28d9 55%, #be185d 100%);
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
        .tagline { font-size: 18px; color: #ddd6fe; margin-bottom: 20px; }
        .description { font-size: 16px; line-height: 1.65; margin-bottom: 8px; color: #e5e7eb; }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px;
             color: #c4b5fd; margin: 26px 0 12px; }
        .chips { display: flex; flex-wrap: wrap; gap: 10px; }
        .chip {
            background: rgba(255, 255, 255, 0.14);
            border: 1px solid rgba(255, 255, 255, 0.22);
            padding: 8px 16px; border-radius: 999px; font-size: 15px;
        }
        .docs-button {
            display: inline-block; margin-top: 30px;
            background: #fbbf24; color: #1e1b4b;
            font-weight: 700; text-decoration: none;
            padding: 13px 26px; border-radius: 12px;
        }
        .docs-button:hover { background: #fcd34d; }
        .hint { margin-top: 14px; font-size: 13px; color: rgba(249, 250, 251, 0.65); }
    </style>
</head>
<body>
    <main class="card">
        <h1>Добро пожаловать в YouMi! 👋</h1>
        <p class="tagline">Генератор мест и тем для встреч</p>
        <p class="description">
            Tet-A-Tet придуман, чтобы встречи не начинались со слов
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
            <span class="chip">Даниил</span>
        </div>

        <h2>Технологии</h2>
        <div class="chips">
            <span class="chip">Python</span>
            <span class="chip">FastAPI</span>
            <span class="chip">SQLAlchemy</span>
            <span class="chip">SQLite</span>
            <span class="chip">ИИ-интеграция (OpenRouter)</span>
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


@app.post("/api/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
   
    prompt = build_prompt(request.cityName, request.companion,
                          request.atmosphere, request.timeOfDay,
                          request.customNotes)
    ai_result = parse_ai_answer(ask_openrouter(prompt))

    if ai_result is not None:
        return ai_result

    return GenerateResponse(
        places=pick_places(request.atmosphere, request.cityName, request.timeOfDay),
        topics=make_topics(request.customNotes, request.atmosphere,
                           request.timeOfDay, request.companion),
        aiUsed=False,
    )


if __name__ == "__main__":
    import uvicorn

    print("Сервер YouMi запускается...")
    print("Главная страница: http://127.0.0.1:8000/")
    print("Документация API: http://127.0.0.1:8000/docs")
    if os.getenv("OPENROUTER_API_KEY"):
        print("ИИ: ключ OpenRouter найден — /api/generate использует нейросеть.")
    else:
        print("ИИ: ключ OPENROUTER_API_KEY не задан — работает заглушка.")
    print("Для остановки нажмите Ctrl+C")
    uvicorn.run(app, host="127.0.0.1", port=8000)
