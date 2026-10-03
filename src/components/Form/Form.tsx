'use client'

import { useState } from "react"

import { Input } from "../UI/Input"
import { Cities } from "./Cities/Cities"
import { Countries } from "./Сountries/Сountries"
import { TypeMeeting } from "./TypeMeeting/TypeMeeting"

export type Filter = {
    countyId: string,
    cityId: string
}

export function Form () {
    const [filter, setFilter] = useState<Filter>({
        countyId: '',
        cityId: ''
    })

    console.log(filter)

    return(
        <div className="w-[640px] mx-auto mt-[100px]">
            <div className="flex gap-x-[40px]">
                <Input title="Имя" placeholder="Введите ваше имя" width={300}/>
                <Input placeholder="Введите вашу фамилию" title="Фамилия" width={300}/>
            </div>
            <Countries setFilter={setFilter} />
            <Cities  setFilter={setFilter} />
            <TypeMeeting />
        </div>
    )
}