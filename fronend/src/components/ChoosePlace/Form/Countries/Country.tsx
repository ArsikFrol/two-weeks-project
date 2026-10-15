import { useFormContext, } from "react-hook-form"
import { useRef, useState } from "react"
import { useClickAway } from "react-use"

import { Input } from "@/components/UI/Input"
import { PlaceFormSchema } from "@/lib/schemas"
import { ListCountry } from "./ListCountry"
import { cn } from "@/lib/utils"

type Props = {
    setcityAndCountry: (value: any) => void
}

export function Country({ setcityAndCountry }: Props) {
    const { setValue, control } = useFormContext<PlaceFormSchema>()

    const [showCountries, setShowCountries] = useState<boolean>(false)

    const ref = useRef<HTMLDivElement>(null)

    const clickX = () => {
        setValue('city', '')
        setShowCountries(false)
    }

    useClickAway(ref, () => setShowCountries(false))

    return (
        <div ref={ref} className="relative bg-[rgba(233,235,214,1)] rounded-2xl flex items-center gap-x-[20px]">
            <Input control={control} name="country" placeholder="Россия" title="Country: "
                width={510} onClick={() => setShowCountries(!showCountries)}
                onCliclX={clickX} />
            <div className={cn(
                'z-10 w-[500px] h-[200px] overflow-y-auto absolute top-[80px] left-1/8  bg-[rgba(164,188,188,1)] rounded-xl',
                'p-[20px]',
                showCountries
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
            )}>
                <ListCountry setShowCountries={setShowCountries} />
            </div>
        </div>
    )
}