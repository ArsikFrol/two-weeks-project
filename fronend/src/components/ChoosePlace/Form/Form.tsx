'use client'

import { useFormContext } from "react-hook-form"

import { Time } from "./Time"
import { PlaceFormSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { Budget } from "./Budget"
import { TypePerson } from "./TypePerson/TypePerson"
import { Atmosphere } from "./Atmosphere/Atmosphere"
import { Input } from "@/components/UI/Input"
import { Country } from "./Countries/Country"
import { City } from "./City/City"
import { TypeMeeting } from "./TypeMeeting/TypeMeeting"
import { postChoosePlace } from "@/api/choosePlace"

export function Form() {
    const {
        handleSubmit,
        formState,
        reset,
        control,
    } = useFormContext<PlaceFormSchema>()

    const onSubmit = async (data: PlaceFormSchema) => {
        console.log('Валидные данные:', data)

        try {

            const status = await postChoosePlace(data)
            console.log(status)

            reset()
        } catch (error) {
            console.log(`Ошибка: ${error}`)
        }

    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={cn(
            'flex flex-col gap-y-[20px] h-[calc(100vh-77px)] overflow-auto',
            "bg-[rgba(228,170,169,1)] px-[50px] py-[50px] text-[rgba(62,81,79,1)]"
        )}>
            <div className='grid grid-cols-2 gap-x-[20px]'>
                <Input control={control} name="firstName" placeholder="Ivan" title="First name"
                    width={280} onClick={() => { }} flexCol onCliclX={() => { }} />
                <Input control={control} name="lastName" placeholder="Ivanov" title="Last name"
                    width={280} onClick={() => { }} flexCol onCliclX={() => { }} />
            </div>
            <Time />
            <Country />
            <City />
            <Budget />
            <Atmosphere />
            <TypeMeeting />
            <TypePerson />
            <button type="submit" disabled={formState.isSubmitting}
                className={cn(
                    'bg-white/50 rounded-xl h-[50px] mt-[20px] w-[300px] mx-auto flex-shrink-0 text-[20px]',
                    formState.isValid && 'bg-white text-black hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
                )}>
                {formState.isSubmitting ? 'Отправка...' : 'Find a place'}
            </button>
        </form>
    )
}