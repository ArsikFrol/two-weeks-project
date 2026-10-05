'use client'

import { ChevronDown } from "lucide-react"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { useClickAway } from "react-use"
import { Control, useController } from "react-hook-form"

import { Input } from "@/components/UI/Input"
import { cn } from "@/lib/utils"
import { City } from "@/types/city"
import { Filter } from "../Form"
import { useEscape } from "@/components/hooks/useEscape"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {
    filter: Filter,
    setFilter: Dispatch<SetStateAction<Filter>>

    control: Control<PlaceFormSchema>,
}

const listCities: City[] = [
    { cityId: '1', name: 'Москва', countPlaces: '151' },
    { cityId: '2', name: 'Санкт-Петербург', countPlaces: '67' },
    { cityId: '3', name: 'Новосибирск', countPlaces: '22' },
    { cityId: '4', name: 'Екатеринбург', countPlaces: '20' },
    { cityId: '5', name: 'Казань', countPlaces: '24' },
    { cityId: '6', name: 'Красноярск', countPlaces: '16' },
    { cityId: '7', name: 'Нижний Новгород', countPlaces: '10' },
    { cityId: '8', name: 'Челябинск', countPlaces: '25' },
    { cityId: '9', name: 'Уфа', countPlaces: '14' },
    { cityId: '10', name: 'Краснодар', countPlaces: '17' },
    { cityId: '11', name: 'Самара', countPlaces: '17' },
    { cityId: '12', name: 'Ростов-на-Дону', countPlaces: '27' },
    { cityId: '13', name: 'Омск', countPlaces: '18' },
    { cityId: '14', name: 'Воронеж', countPlaces: '23' },
    { cityId: '15', name: 'Пермь', countPlaces: '17' },
    { cityId: '16', name: 'Волгоград', countPlaces: '23' },
    { cityId: '17', name: 'Саратов', countPlaces: '17' },
    { cityId: '18', name: 'Тюмень', countPlaces: '6' },
    { cityId: '19', name: 'Ижевск', countPlaces: '0' },
    { cityId: '20', name: 'Махачкала', countPlaces: '0' },
]

export function Cities({ filter, setFilter, control }: Props) {

    const [showCities, setShowCities] = useState<boolean>(false)
    const ref = useRef<HTMLInputElement>(null)
    const { field, fieldState } = useController({ name: 'CITY', control })
    const error = fieldState.error

    const clickShowCities = () => setShowCities(!showCities)

    const clickELem = (id: string, name: string) => {
        setFilter({ ...filter, cityId: id })
        setShowCities(false)
        field.onChange(name)
    }

    useClickAway(ref, () => setShowCities(false))
    useEscape(() => setShowCities(false))

    return (
        <div ref={ref} className={cn(
            "relative mt-[20px] w-[640px]",
            'transition-opacity duration-1000',
            filter.countryId
                ? 'opacity-100 max-h-[200px]'
                : 'opacity-0 h-0 max-h-0 pointer-events-none'
        )}>
            <div className='flex items-end gap-x-[10px]'>
                <Input control={control} name="CITY" placeholder="Введите город" title="Город" width={580}
                    onClick={() => setShowCities(true)} />
                <div className={cn(
                    " bg-gray-300 rounded-2xl flex justify-center items-center w-full h-[50px]",
                    'transition-transform duration-1000 cursor-pointer',
                    showCities
                        ? 'rotate-180'
                        : 'hover:translate-y-[3px]'
                )} onClick={clickShowCities}>
                    <ChevronDown size={40} strokeWidth={1} className="cursor-pointer" />
                </div>
            </div>
            {error && <p className="text-red-500 font-light mt-[5px]">{error.message}</p>}
            <div className={cn(
                'absolute top-[90px] left-0',
                'bg-gray-300 rounded-2xl overflow-auto',
                'transition-[opacity,height] duration-300',
                showCities
                    ? 'opacity-100 h-[250px] w-[640px] flex flex-col gap-y-[10px] p-[20px]'
                    : 'opacity-0 h-0 w-0 p-0'
            )}>
                {
                    listCities.map((obj, i) => {
                        return (
                            <div key={i} className={cn(
                                "flex items-center justify-between",
                                'hover:scale-101 transition-transform duration-300 cursor-pointer'
                            )} onClick={() => clickELem(obj.cityId, obj.name)}>
                                <div className="text-[18px]">{obj.name}</div>
                                <div className="text-gray-500">{obj.countPlaces} мест для встречи</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}