'use client'

import { useFormContext } from "react-hook-form"
import { useRef, useState } from "react"
import { useClickAway } from "react-use"

import { Input } from "@/components/UI/Input"
import { PlaceFormSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { ListCities } from "./ListCities"

type Props = {

}

export function City({ }: Props) {
    const { watch, setValue, control } = useFormContext<PlaceFormSchema>()

    const [showCities, setShowCities] = useState<boolean>(false)

    const ref = useRef<HTMLDivElement>(null)

    const clickX = () => {
        setShowCities(false)
        setValue('city', '', { shouldValidate: true })
    }

    useClickAway(ref, () => setShowCities(false))

    return (
        <div ref={ref} className={cn(
            'relative grid transition-[grid-template-rows,opacity] duration-300',
            watch('country') === ''
                ? 'grid-rows-[0fr] opacity-0'
                : 'grid-rows-[1fr] opacity-100'
        )}>
            <div className="overflow-hidden">
                <Input control={control} name="city" placeholder="Москва" title="City:"
                    width={550} onClick={() => setShowCities(!showCities)}
                    onCliclX={clickX} />
            </div>
            <div className={cn(
                'z-10 w-[500px] h-[200px] overflow-y-auto absolute top-[80px] left-1/8  bg-[rgba(164,188,188,1)] rounded-xl',
                'p-[20px]',
                showCities
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
            )}>
                <ListCities setShowCities={setShowCities} />
            </div>
        </div>
    )
}