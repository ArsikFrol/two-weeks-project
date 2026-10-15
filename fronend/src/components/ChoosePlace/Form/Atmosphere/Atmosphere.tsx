'use client'

import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { listAtmosphere } from "../constans"
import { Elem } from "./Elem"
import { AtmosphereSlug } from "../types"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {

}

export function Atmosphere({ }: Props) {
    const { setValue, formState } = useFormContext<PlaceFormSchema>()

    const [activeAtmosphere, setActiveAtmosphere] = useState<AtmosphereSlug>('')

    const clickAtmosphere = (slug: AtmosphereSlug) => {
        setActiveAtmosphere(slug)
        setValue('atmosphere', slug, { shouldValidate: true })
    }

    return (
        <div className="bg-[rgba(233,235,214,1)] rounded-2xl py-[10px] px-[30px]">
            <div className='text-[20px] font-light'>What kind of atmosphere is this?</div>
            <div className='flex flex-wrap gap-[10px] mt-[20px]'>
                {
                    listAtmosphere.map((obj, i) => <Elem key={i} obj={obj} clickAtmosphere={clickAtmosphere}
                        activeAtmosphere={activeAtmosphere} />)
                }
            </div>
            {formState.errors.atmosphere &&
                <p className="text-red-500 font-light mt-[10px]">{formState.errors.atmosphere.message}</p>
            }
        </div>
    )
}