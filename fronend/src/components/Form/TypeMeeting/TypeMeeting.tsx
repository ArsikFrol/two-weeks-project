'use client'

import { Dispatch, SetStateAction, useCallback, useState } from "react"

import { Filter } from "../Form"
import { Elem } from "./Elem"

type Props = {
    filter: Filter,
    setFilter: Dispatch<SetStateAction<Filter>>
}

export type Meeting = {
    id: number,
    type: string,
    name: string,
    bgColor: string,
    colorText: string
}

export const meetingTypes = [
    { id: 1, type: 'date', name: 'Свидание', bgColor: '#FCE7F3', colorText: '#9D174D' },
    { id: 2, type: 'friends', name: 'Дружеская встреча', bgColor: '#DBEAFE', colorText: '#1E40AF' },
    { id: 3, type: 'family', name: 'Семейная встреча', bgColor: '#FEF3C7', colorText: '#92400E' },
    { id: 4, type: 'business', name: 'Деловая встреча', bgColor: '#E0E7FF', colorText: '#3730A3' },
    { id: 5, type: 'interview', name: 'Собеседование', bgColor: '#FEE2E2', colorText: '#991B1B' },
    { id: 6, type: 'negotiation', name: 'Переговоры', bgColor: '#FFEDD5', colorText: '#9A3412' },
    { id: 7, type: 'meeting', name: 'Рабочее совещание', bgColor: '#E5E7EB', colorText: '#374151' },
    { id: 8, type: 'standup', name: 'Планёрка', bgColor: '#CFFAFE', colorText: '#155E75' },
    { id: 9, type: 'one-on-one', name: 'Встреча тет-а-тет', bgColor: '#F3E8FF', colorText: '#6B21A8' },
    { id: 10, type: 'brainstorm', name: 'Мозговой штурм', bgColor: '#FEF9C3', colorText: '#854D0E' },
    { id: 11, type: 'presentation', name: 'Презентация', bgColor: '#FFE4E6', colorText: '#9F1239' },
    { id: 12, type: 'workshop', name: 'Воркшоп', bgColor: '#DCFCE7', colorText: '#166534' },
    { id: 13, type: 'training', name: 'Тренинг', bgColor: '#D1FAE5', colorText: '#065F46' },
    { id: 14, type: 'conference', name: 'Конференция', bgColor: '#EDE9FE', colorText: '#5B21B6' },
    { id: 15, type: 'seminar', name: 'Семинар', bgColor: '#E0F2FE', colorText: '#075985' },
    { id: 16, type: 'consultation', name: 'Консультация', bgColor: '#FEF3C7', colorText: '#78350F' },
    { id: 17, type: 'webinar', name: 'Вебинар', bgColor: '#CFFAFE', colorText: '#0E7490' },
    { id: 18, type: 'reunion', name: 'Встреча выпускников', bgColor: '#FAE8FF', colorText: '#86198F' },
    { id: 19, type: 'blind-date', name: 'Свидание вслепую', bgColor: '#FCE7F3', colorText: '#831843' },
] as const satisfies readonly Meeting[]

export type TypeMeeting = (typeof meetingTypes)[number]['type'] | ''

export function TypeMeeting({ filter, setFilter }: Props) {
    const [activeMeeting, setActiveMeeting] = useState<TypeMeeting>('')

    const clickMeeting = useCallback((type: TypeMeeting) => {
        setActiveMeeting(type)
        setFilter({ ...filter, typeMeeting: type })
    }, [])

    return (
        <div className="mt-[20px]">
            <div className="text-[20px] mb-[10px]">Выбиерите категорию встречи</div>
            <div className="flex flex-wrap gap-x-[20px] gap-y-[10px]">
                {
                    meetingTypes
                        .map((obj, i) => <Elem key={i} obj={obj} clickMeeting={clickMeeting} activeMeeting={activeMeeting} />)
                }
            </div>
        </div>
    )
}