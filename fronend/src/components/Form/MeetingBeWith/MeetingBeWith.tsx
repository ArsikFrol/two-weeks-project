import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { Filter } from "../Form"
import { Elem } from "./Elem"

type Props = {
    filter: Filter,
    setFilter: Dispatch<SetStateAction<Filter>>
}

export type MeetingHuman = {
    id: number,
    name: string,
    type: string,
    bgColor: string,
    colorText: string
}

export const meetingHumans = [
    { id: 1, name: 'С девушкой', type: 'girlfriend', bgColor: '#FCE7F3', colorText: '#9D174D' },
    { id: 2, name: 'С парнем', type: 'boyfriend', bgColor: '#FFE4E6', colorText: '#9F1239' },
    { id: 3, name: 'С женой', type: 'wife', bgColor: '#FCE7F3', colorText: '#831843' },
    { id: 4, name: 'С мужем', type: 'husband', bgColor: '#FFE4E6', colorText: '#881337' },
    { id: 5, name: 'С другом', type: 'friend', bgColor: '#DBEAFE', colorText: '#1E40AF' },
    { id: 6, name: 'С подругой', type: 'female-friend', bgColor: '#E0F2FE', colorText: '#075985' },
    { id: 7, name: 'С родителями', type: 'parents', bgColor: '#FEF3C7', colorText: '#92400E' },
    { id: 8, name: 'С мамой', type: 'mother', bgColor: '#FEF9C3', colorText: '#854D0E' },
    { id: 9, name: 'С папой', type: 'father', bgColor: '#FFEDD5', colorText: '#9A3412' },
    { id: 10, name: 'С ребёнком', type: 'child', bgColor: '#FEF3C7', colorText: '#78350F' },
    { id: 11, name: 'С братом', type: 'brother', bgColor: '#FFEDD5', colorText: '#7C2D12' },
    { id: 12, name: 'С сестрой', type: 'sister', bgColor: '#FCE7F3', colorText: '#9D174D' },
    { id: 13, name: 'С коллегой', type: 'colleague', bgColor: '#E0E7FF', colorText: '#3730A3' },
    { id: 14, name: 'С начальником', type: 'boss', bgColor: '#E5E7EB', colorText: '#374151' },
    { id: 15, name: 'С подчинённым', type: 'subordinate', bgColor: '#E5E7EB', colorText: '#1F2937' },
    { id: 16, name: 'С клиентом', type: 'client', bgColor: '#EDE9FE', colorText: '#5B21B6' },
    { id: 17, name: 'С партнёром по бизнесу', type: 'business-partner', bgColor: '#E0E7FF', colorText: '#312E81' },
    { id: 18, name: 'С одногруппником', type: 'classmate', bgColor: '#DCFCE7', colorText: '#166534' },
    { id: 19, name: 'С учителем', type: 'teacher', bgColor: '#D1FAE5', colorText: '#065F46' },
    { id: 20, name: 'С незнакомцем', type: 'stranger', bgColor: '#F3E8FF', colorText: '#6B21A8' },
] as const satisfies readonly MeetingHuman[]

export type TypeMeetingHuman = (typeof meetingHumans)[number]['type'] | ''

export function MeetingBeWith({ filter, setFilter }: Props) {
    const [activeHuman, setActiveHuman] = useState<TypeMeetingHuman>('')

    const clickHuman = useCallback((type: TypeMeetingHuman) => {
        setActiveHuman(type),
            setFilter({ ...filter, humanMeeting: type })
    }, [])

    return (
        <div className="mt-[50px]">
            <div className='text-[20px] mb-[10px]'>С кем будет встреча?</div>
            <div className='flex flex-wrap gap-[10px]'>
                {
                    meetingHumans
                        .map((obj, i) => <Elem key={i} obj={obj} activeHuman={activeHuman} clickHuman={clickHuman} />)
                }
            </div>
        </div>
    )
}