'use client'

import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { MeetingSlug } from "../types"
import { Elem } from "./Elem"
import { listMeeting } from "../constans"
import { PlaceFormSchema } from "@/lib/schemas"

export function TypeMeeting() {
    const { setValue, formState } = useFormContext<PlaceFormSchema>()

    const [activeMeeting, setActiveMetting] = useState<MeetingSlug>('')

    const clickMeeting = (slug: MeetingSlug) => {
        setActiveMetting(slug)
        setValue('meeting', slug, { shouldValidate: true })
    }

    return (
        <div className="bg-[rgba(233,235,214,1)] rounded-2xl py-[10px] px-[30px]">
            <div className='text-[20px] font-light'>What type of meeting?</div>
            <div className='flex flex-wrap gap-[10px] mt-[20px]'>
                {
                    listMeeting.map((obj, i) => <Elem key={i} obj={obj} activeMeeting={activeMeeting}
                        clickMeeting={clickMeeting} />)
                }
            </div>
            {formState.errors.meeting &&
                <p className="text-red-500 font-light mt-[10px]">{formState.errors.meeting.message}</p>
            }
        </div>
    )
}