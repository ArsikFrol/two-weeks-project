import { useFormContext } from "react-hook-form"

import { useGetCities } from "@/hooks/useCities"
import { Elem } from "./Elem"
import { PlaceFormSchema } from "@/lib/schemas"
import { ClipLoaderUI } from "@/components/UI/ClipLoader"
import { Empty } from "../Countries/Empty"

type Props = {
    setShowCities: (value: boolean) => void,
}

export function ListCities({ setShowCities }: Props) {
    const { watch, formState, setValue, getValues } = useFormContext<PlaceFormSchema>()

    const search = watch('city')
    const cityError = formState.errors.city

    const { cities, error, loading } = useGetCities(
        getValues('countrySlug'), search && !cityError ? search : ''
    )

    console.log(cities)

    const clickCity = (slug: string, name: string) => {
        setValue("city", name, { shouldValidate: true })
        setValue("citySlug", slug)
        setShowCities(false)
    }

    if (loading) return <ClipLoaderUI />
    if (!cities || cities.length === 0) return <Empty />

    return (
        <div className="flex flex-col">
            {
                cities.map((obj, i) => <Elem key={i} obj={obj} clickCity={clickCity} />)
            }
        </div>
    )
}