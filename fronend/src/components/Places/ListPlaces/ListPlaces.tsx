'use client'

import { usePlaces } from "@/store/Places/places"
import { Elem } from "./Elem"
import { Place } from "@/types/place"

type Props = {

}

export const listPlaces: Place[] = [
    { placeId: 'place_001', name: 'Кафе Пушкин', address: 'Москва, Тверской бульвар, 26А', rating: 4.8, description: 'Легендарное кафе в стиле дворянской усадьбы XIX века. Французская и русская кухня, собственный кондитерский цех и знаменитая библиотека.', images: ['/places/pushkin-1.jpg', '/places/pushkin-2.jpg'] },
    { placeId: 'place_002', name: 'Парк Горького', address: 'Москва, Крымский Вал, 9', rating: 4.9, description: 'Центральный парк культуры и отдыха с набережной, прокатом велосипедов, музеем «Гараж» и множеством кафе. Идеален для прогулок и пикников.', images: ['/places/gorky-1.jpg', '/places/gorky-2.jpg'] },
    { placeId: 'place_003', name: 'Кофейня «Шоколадница»', address: 'Москва, ул. Арбат, 12', rating: 4.3, description: 'Сетевая кофейня с уютной атмосферой на Старом Арбате. Большой выбор десертов, завтраки весь день и ароматный кофе собственной обжарки.', images: ['/places/chocolate-1.jpg'] },
    { placeId: 'place_004', name: 'Ресторан «Турандот»', address: 'Москва, Тверской бульвар, 26', rating: 4.7, description: 'Ресторан авторской кухни в роскошных интерьерах китайского дворца. Панорамная веранда, живая музыка и блюда от шеф-повара.', images: ['/places/turandot-1.jpg', '/places/turandot-2.jpg'] },
    { placeId: 'place_005', name: 'Бар «Стрелка»', address: 'Москва, Берсеневская наб., 14', rating: 4.5, description: 'Популярный бар на крыше с видом на храм Христа Спасителя. Коктейли, крафтовое пиво и диджей-сеты по выходным.', images: ['/places/strelka-1.jpg'] },
    { placeId: 'place_006', name: 'Кинотеатр «Октябрь»', address: 'Москва, Новый Арбат, 24', rating: 4.4, description: 'Один из крупнейших кинотеатров столицы с премьерными показами, IMAX и уютными VIP-залами. Удобное расположение в центре.', images: ['/places/october-1.jpg'] },
    { placeId: 'place_007', name: 'Третьяковская галерея', address: 'Москва, Лаврушинский пер., 10', rating: 4.9, description: 'Главный музей русского искусства: от икон Рублёва до авангарда XX века. Постоянная экспозиция и регулярные временные выставки.', images: ['/places/tretyakov-1.jpg', '/places/tretyakov-2.jpg'] },
    { placeId: 'place_008', name: 'Библиотека им. Ленина', address: 'Москва, ул. Воздвиженка, 3/5', rating: 4.6, description: 'Одна из крупнейших библиотек мира. Читальные залы, музеи, экскурсии и тихие уголки для работы и учёбы.', images: ['/places/lenin-library-1.jpg'] },
    { placeId: 'place_009', name: 'Парк «Сокольники»', address: 'Москва, ул. Сокольнический Вал, 1', rating: 4.7, description: 'Большой лесопарк с озёрами, велодорожками и летними кафе. Отличное место для пробежек, пикников и прогулок с детьми.', images: ['/places/sokolniki-1.jpg', '/places/sokolniki-2.jpg'] },
    { placeId: 'place_010', name: 'Ресторан «White Rabbit»', address: 'Москва, Смоленская пл., 3', rating: 4.8, description: 'Ресторан с панорамным видом на Москву и авторской кухней. Входит в мировые рейтинги, славится дегустационным меню и винной картой.', images: ['/places/white-rabbit-1.jpg'] },
    { placeId: 'place_011', name: 'Кофейня «Double B»', address: 'Москва, ул. Малая Бронная, 4', rating: 4.5, description: 'Спешелти-кофейня с зерном собственной обжарки. Минималистичный интерьер, быстрый Wi-Fi и десерты от локальных кондитеров.', images: ['/places/doubleb-1.jpg'] },
    { placeId: 'place_012', name: 'Музей современного искусства «Гараж»', address: 'Москва, ул. Крымский Вал, 9, стр. 32', rating: 4.6, description: 'Главная площадка современного искусства в Москве. Крупные выставки, лекции, кинопоказы и книжный магазин в парке Горького.', images: ['/places/garage-1.jpg', '/places/garage-2.jpg'] },
    { placeId: 'place_013', name: 'Бар «Куклы»', address: 'Москва, ул. Кузнецкий Мост, 12', rating: 4.2, description: 'Камерный бар с авторскими коктейлями и атмосферой старого города. Небольшой зал, живая музыка и дружелюбный персонал.', images: ['/places/kukly-1.jpg'] },
    { placeId: 'place_014', name: 'Театр им. МХТ Чехова', address: 'Москва, Камергерский пер., 3', rating: 4.9, description: 'Легендарный театр с богатой историей. Классические и современные постановки, сильная труппа и уютный исторический зал.', images: ['/places/mht-1.jpg'] },
    { placeId: 'place_015', name: 'Пиццерия «Pinzeria by Bontempi»', address: 'Москва, ул. Покровка, 15', rating: 4.7, description: 'Настоящая неаполитанская пицца из дровяной печи. Свежие ингредиенты, итальянские вина и атмосфера маленькой траттории.', images: ['/places/pinzeria-1.jpg', '/places/pinzeria-2.jpg'] },
    { placeId: 'place_016', name: 'Смотровая площадка «Панорама 360»', address: 'Москва, Пресненская наб., 12', rating: 4.8, description: 'Смотровая на 89-м этаже башни «Федерация». Круговой обзор Москвы, стеклянный пол и кафе с панорамными окнами.', images: ['/places/panorama-1.jpg'] },
    { placeId: 'place_017', name: 'Ресторан «Кавказская пленница»', address: 'Москва, ул. Никольская, 10', rating: 4.4, description: 'Ресторан кавказской кухни с щедрыми порциями и домашней атмосферой. Хинкали, шашлыки, хачапури и хорошее вино.', images: ['/places/kavkaz-1.jpg'] },
    { placeId: 'place_018', name: 'Антикафе «Циферблат»', address: 'Москва, Покровский бульвар, 6/20', rating: 4.5, description: 'Антикафе с оплатой за время: уютные диваны, настольные игры, чай и кофе без ограничений. Место для работы и встреч с друзьями.', images: ['/places/ciferblat-1.jpg'] },
    { placeId: 'place_019', name: 'Парк «Зарядье»', address: 'Москва, ул. Варварка, 6', rating: 4.9, description: 'Современный парк у Кремля с «парящим мостом», ледяной пещерой и концертным залом. Красивые виды и много зон для отдыха.', images: ['/places/zaryadye-1.jpg', '/places/zaryadye-2.jpg'] },
    { placeId: 'place_020', name: 'Ресторан «Рыбы нет»', address: 'Москва, ул. Большая Дмитровка, 20', rating: 4.6, description: 'Ироничный ресторан с авторской кухней и необычной подачей. Сезонное меню, коктейли и атмосфера для неспешных ужинов.', images: ['/places/fish-1.jpg'] },
]

export function ListPlaces(props: Props) {
    /* const { listPlaces } = usePlaces() */

    return (
        <div className="flex flex-col gap-y-[50px] w-[1580px] mx-auto">
            {
                listPlaces.map((obj, i) => <Elem key={i} obj={obj} />)
            }
        </div>
    )
}