'use client'

import { ChevronDown } from "lucide-react"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { useClickAway } from "react-use"
import { Control, useController } from "react-hook-form"

import { Input } from "@/components/UI/Input"
import { cn } from "@/lib/utils"
import { Country } from "@/types/country"
import { Filter } from "../Form"
import { useEscape } from "@/components/hooks/useEscape"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {
    filter: Filter,
    setFilter: Dispatch<SetStateAction<Filter>>

    control: Control<PlaceFormSchema>
}

const listCountries: Country[] = [
    { countryId: '1', name: 'Италия', countPlaces: 1250 },
    { countryId: '2', name: 'Франция', countPlaces: 1180 },
    { countryId: '3', name: 'Испания', countPlaces: 1120 },
    { countryId: '4', name: 'Япония', countPlaces: 1080 },
    { countryId: '5', name: 'Греция', countPlaces: 950 },
    { countryId: '6', name: 'Турция', countPlaces: 890 },
    { countryId: '7', name: 'США', countPlaces: 870 },
    { countryId: '8', name: 'Великобритания', countPlaces: 830 },
    { countryId: '9', name: 'Германия', countPlaces: 810 },
    { countryId: '10', name: 'Таиланд', countPlaces: 780 },
    { countryId: '11', name: 'Португалия', countPlaces: 720 },
    { countryId: '12', name: 'Австрия', countPlaces: 690 },
    { countryId: '13', name: 'Швейцария', countPlaces: 660 },
    { countryId: '14', name: 'Египет', countPlaces: 640 },
    { countryId: '15', name: 'ОАЭ', countPlaces: 610 },
    { countryId: '16', name: 'Китай', countPlaces: 590 },
    { countryId: '17', name: 'Индия', countPlaces: 570 },
    { countryId: '18', name: 'Хорватия', countPlaces: 540 },
    { countryId: '19', name: 'Чехия', countPlaces: 520 },
    { countryId: '20', name: 'Нидерланды', countPlaces: 500 },
]

export function Countries({ filter, setFilter, control }: Props) {
    const [showCountries, setShowCountries] = useState<boolean>(false)

    const ref = useRef<HTMLInputElement>(null)
    const { field, fieldState } = useController({ name: 'COUNTRY', control })
    const error = fieldState.error

    const clickShowCountries = () => setShowCountries(!showCountries)

    const clickElem = (id: string, name: string) => {
        setFilter({ ...filter, countryId: id })
        setShowCountries(false)
        field.onChange(name)
    }

    useClickAway(ref, () => setShowCountries(false))
    useEscape(() => setShowCountries(false))

    return (
        <div ref={ref} className="relative mt-[20px] w-[640px]">
            <div className=' flex items-end gap-x-[10px]'>
                <Input name='COUNTRY' control={control} placeholder="Введите страну" title="Страна"
                    width={580} onClick={() => setShowCountries(true)} />
                <div className={cn(
                    " bg-gray-300 rounded-2xl flex justify-center items-center w-full h-[50px]",
                    'transition-transform duration-1000 cursor-pointer',
                    showCountries
                        ? 'rotate-180'
                        : 'hover:translate-y-[3px]'
                )} onClick={clickShowCountries}>
                    <ChevronDown size={40} strokeWidth={1} className="cursor-pointer" />
                </div>
            </div>
            {error && <p className="text-red-500 font-light mt-[5px]">{error.message}</p>}
            <div className={cn(
                'z-10 absolute top-[90px] left-0',
                'bg-gray-300 rounded-2xl overflow-auto',
                'transition-[opacity,height] duration-300',
                showCountries
                    ? 'opacity-100 h-[250px] w-[640px] flex flex-col gap-y-[10px] p-[20px]'
                    : 'opacity-0 h-0 w-0 p-0'
            )}>
                {
                    listCountries.map((obj, i) => {
                        return (
                            <div className={cn(
                                "flex items-center justify-between",
                                'hover:scale-101 transition-transform duration-300 cursor-pointer'
                            )} key={i} onClick={() => clickElem(obj.countryId, obj.name)}>
                                <div className="text-[18px]">{obj.name}</div>
                                <div className="text-gray-600">{obj.countPlaces} городов</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}