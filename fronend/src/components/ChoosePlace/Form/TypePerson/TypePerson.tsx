import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { Elem } from "./Elem"
import { PersonSlug } from "../types"
import { listPerson } from "../constans"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {

}

export function TypePerson({ }: Props) {
    const { setValue, formState } = useFormContext<PlaceFormSchema>()

    const [activePerson, setActivePerson] = useState<PersonSlug>('')

    const clickPerson = (slug: PersonSlug) => {
        setActivePerson(slug)
        setValue('person', slug, { shouldValidate: true })
    }

    return (
        <div className="bg-[rgba(233,235,214,1)] rounded-2xl py-[10px] px-[30px]">
            <div className='text-[20px] font-light'>Who will the meeting be with?</div>
            <div className='flex flex-wrap gap-[10px] mt-[20px]'>
                {
                    listPerson.map((obj, i) => <Elem key={i} obj={obj} clickPerson={clickPerson}
                        activePerson={activePerson} />)
                }
            </div>
            {formState.errors.person &&
                <p className="text-red-500 font-light mt-[10px]">{formState.errors.person.message}</p>
            }
        </div>
    )
}