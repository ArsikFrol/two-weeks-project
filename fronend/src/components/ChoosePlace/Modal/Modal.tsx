'use client'

import { useRef } from "react"
import { useClickAway } from "react-use"

import { PlaceFormSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { useTypedRouter } from "@/hooks/useTypedRouter"
import { postChoosePlace } from "@/api/choosePlace"
import { usePlaces } from "@/store/Places/places"

const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}.${month}.${year}`
}

type Props = {
    data: PlaceFormSchema,
    setShowModal: (value: boolean) => void
}

const tagLabels: Record<string, string> = {
    romantic: 'Романтичная',
    cozy: 'Уютная',
    fun: 'Весёлая',
    calm: 'Спокойная',
    active: 'Активная',
    creative: 'Творческая',
    business: 'Деловая',
    friendly: 'Дружеская',
    family: 'Семейная',
    festive: 'Праздничная',
    quiet: 'Тихая',
    adventure: 'Приключение',
    cultural: 'Культурная',
    gaming: 'Игровая',
    outdoor: 'На природе',
    foodie: 'Гастрономическая',
    artistic: 'Художественная',
    sporty: 'Спортивная',
    intellectual: 'Интеллектуальная',
    relaxed: 'Расслабленная',
}

const meetingLabels: Record<string, string> = {
    date: 'Свидание',
    friends: 'Дружеская встреча',
    family: 'Семейная встреча',
    business: 'Деловая встреча',
    interview: 'Собеседование',
    negotiation: 'Переговоры',
    meeting: 'Рабочее совещание',
    standup: 'Планёрка',
    'one-on-one': 'Встреча тет-а-тет',
    brainstorm: 'Мозговой штурм',
    presentation: 'Презентация',
    workshop: 'Воркшоп',
    training: 'Тренинг',
    conference: 'Конференция',
    seminar: 'Семинар',
    consultation: 'Консультация',
    webinar: 'Вебинар',
    reunion: 'Встреча выпускников',
    'blind-date': 'Свидание вслепую',
}

const personLabels: Record<string, string> = {
    girlfriend: 'С девушкой',
    boyfriend: 'С парнем',
    wife: 'С женой',
    husband: 'С мужем',
    friend: 'С другом',
    'female-friend': 'С подругой',
    parents: 'С родителями',
    mother: 'С мамой',
    father: 'С папой',
    child: 'С ребёнком',
    brother: 'С братом',
    sister: 'С сестрой',
    colleague: 'С коллегой',
    boss: 'С начальником',
    subordinate: 'С подчинённым',
    client: 'С клиентом',
    'business-partner': 'С партнёром по бизнесу',
    classmate: 'С одногруппником',
    teacher: 'С учителем',
    stranger: 'С незнакомцем',
}

export function Modal({ data, setShowModal }: Props) {
    const router = useTypedRouter()
    const ref = useRef<HTMLDivElement>(null)

    const { setPlaces } = usePlaces()

    const clickGood = async () => {
        router.push('/choosePlace/cards')
        try {

            const places = await postChoosePlace(data)
            setPlaces(places)

        } catch (error) {
            console.log(`Ошибка: ${error}`)
        }
    }

    useClickAway(ref, () => setShowModal(false))

    return (
        <div className='fixed w-full h-screen top-0 left-0 bg-white/50'>
            <div ref={ref} className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px]",
                'bg-[rgba(234,181,173,1)] rounded-2xl p-[20px]'
            )}>
                <div className="text-[20px] font-light text-center">Проверьте введенные данные:</div>
                <div className='flex items-center justify-between mt-[20px]'>
                    <div className='flex flex-col gap-y-[5px]'>
                        <div className='flex items-center gap-x-[5px] bg-[rgba(233,235,214,1)] rounded-2xl py-[10px] px-[30px]'>
                            <div className='text-[18px] font-light'>Имя: </div>
                            <div className=''>{data.firstName}</div>
                        </div>
                        <div className='flex items-center gap-x-[5px] bg-[rgba(233,235,214,1)] rounded-2xl py-[10px] px-[30px]'>
                            <div className='text-[18px] font-light'>Фамилия: </div>
                            <div className=''>{data.lastName}</div>
                        </div>
                    </div>
                    <div className='flex items-center gap-x-[5px] bg-[rgba(233,235,214,1)] rounded-2xl py-[10px] px-[30px]'>
                        <div className='text-[18px] font-light'>Время: </div>
                        <div className=''>{data.time}</div>
                    </div>
                </div>
                <div className='bg-[rgba(233,235,214,1)] rounded-2xl p-[20px] flex items-center justify-center gap-x-[10px] my-[20px]'>
                    <div className='text-[18px] font-light'>Атмосфера:</div>
                    <div className='text-[18px]'>{tagLabels[data.atmosphere]}</div>
                </div>
                <div className='bg-[rgba(233,235,214,1)] rounded-2xl p-[20px] flex items-center justify-center gap-x-[10px] my-[20px]'>
                    <div className='text-[18px] font-light'>Какой тип встречи:</div>
                    <div className='text-[18px]'>{meetingLabels[data.meeting]}</div>
                </div>
                <div className='bg-[rgba(233,235,214,1)] rounded-2xl p-[20px] flex items-center justify-center gap-x-[10px] my-[20px]'>
                    <div className='text-[18px] font-light'>С кем будет встреча:</div>
                    <div className='text-[18px]'>{personLabels[data.person]}</div>
                </div>
                <div className='bg-[rgba(233,235,214,1)] rounded-2xl p-[20px] flex items-center justify-center gap-x-[10px] my-[20px]'>
                    <div className='text-[18px] font-light'>Дата встречи:</div>
                    <div className='text-[18px]'>{formatDate(data.date)}</div>
                </div>
                <div className='grid grid-cols-2 gap-x-[30px] text-center mt-[20px]'>
                    <div className={cn(
                        'bg-[#DCFCE7] text-[#166534] rounded-2xl py-[12px] font-medium',
                        'hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer'
                    )} onClick={clickGood}>
                        Все верно!
                    </div>
                    <div className={cn(
                        'bg-[#E0E7FF] text-[#3730A3] rounded-2xl py-[12px] font-medium',
                        'cursor-pointer hover:bg-[#C7D2FE] transition-colors'
                    )} onClick={() => setShowModal(false)}>
                        Изменить
                    </div>
                </div>
            </div>
        </div>
    )
}