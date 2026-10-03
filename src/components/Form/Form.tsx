'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Input } from "../UI/Input"
import { Cities } from "./Cities/Cities"
import { Countries } from "./Сountries/Сountries"
import { TypeMeeting } from "./TypeMeeting/TypeMeeting"
import { placeFormSchema, PlaceFormSchema } from "@/lib/schemas"

export type Filter = {
    countryId: string,
    cityId: string,
    typeMeeting: TypeMeeting
}

export function Form() {
    const [filter, setFilter] = useState<Filter>({
        countryId: '',
        cityId: '',
        typeMeeting: ''
    })

    const defaultValues = {
        FIRSTNAME: '',
        LASTNAME: '',
        COUNTRY: '',
        CITY: ''
    }

    const {
        handleSubmit,
        formState,
        control,
    } = useForm<PlaceFormSchema>({
        resolver: zodResolver(placeFormSchema),
        mode: 'onTouched',
        defaultValues,
    });

    console.log(filter)

    return (
        <div className="w-[640px] mx-auto mt-[100px]">
            <div className="flex gap-x-[40px]">
                <Input name='FIRSTNAME' control={control} title="Имя" placeholder="Введите ваше имя" width={300} />
                <Input name='LASTNAME' control={control} placeholder="Введите вашу фамилию" title="Фамилия" width={300} />
            </div>
            <Countries control={control} setFilter={setFilter} filter={filter} />
            <Cities control={control} setFilter={setFilter} filter={filter} />
            <TypeMeeting setFilter={setFilter} filter={filter} />
        </div>
    )
}