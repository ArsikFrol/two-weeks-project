import { useFormContext } from "react-hook-form"

import { useGetCountries } from "@/hooks/useCountries"
import { Elem } from "./Elem"
import { PlaceFormSchema } from "@/lib/schemas"
import { ClipLoaderUI } from "@/components/UI/ClipLoader"
import { Error } from "./Error"
import { Empty } from "./Empty"

type Props = {
    setShowCountries: (value: boolean) => void,
}


export function ListCountry({ setShowCountries }: Props) {
    const { watch, formState, setValue } = useFormContext<PlaceFormSchema>()

    const country = watch('country')
    const countryError = formState.errors.country

    const { countries, error, loading } = useGetCountries(
        country && !countryError ? country : ''
    )

    const clickCountry = (slug: string, name: string) => {
        setValue("country", name, { shouldValidate: true })
        setValue("countrySlug", slug)
        setShowCountries(false)
    }

    if (loading) return <ClipLoaderUI />
    if (error) return <Error />
    if (!countries || countries.length === 0) return <Empty />

    return (
        <div className="flex flex-col">
            {
                countries.map((obj, i) => <Elem key={i} obj={obj} clickCountry={clickCountry} />)
            }
        </div>
    )
}