import { useFormContext } from "react-hook-form"

import { useGetCountries } from "@/hooks/useCountries"
import { Elem } from "./Elem"
import { Country } from "@/types/country"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {
    setShowCountries: (value: boolean) => void,
}

const listCountries: Country[] = [
    { slug: 'italy', name: 'Италия', countPlaces: 1250 },
    { slug: 'france', name: 'Франция', countPlaces: 1180 },
    { slug: 'spain', name: 'Испания', countPlaces: 1120 },
    { slug: 'japan', name: 'Япония', countPlaces: 1080 },
    { slug: 'greece', name: 'Греция', countPlaces: 950 },
    { slug: 'turkey', name: 'Турция', countPlaces: 890 },
    { slug: 'usa', name: 'США', countPlaces: 870 },
    { slug: 'uk', name: 'Великобритания', countPlaces: 830 },
    { slug: 'germany', name: 'Германия', countPlaces: 810 },
    { slug: 'thailand', name: 'Таиланд', countPlaces: 780 },
    { slug: 'portugal', name: 'Португалия', countPlaces: 720 },
    { slug: 'austria', name: 'Австрия', countPlaces: 690 },
    { slug: 'switzerland', name: 'Швейцария', countPlaces: 660 },
    { slug: 'egypt', name: 'Египет', countPlaces: 640 },
    { slug: 'uae', name: 'ОАЭ', countPlaces: 610 },
    { slug: 'china', name: 'Китай', countPlaces: 590 },
    { slug: 'india', name: 'Индия', countPlaces: 570 },
    { slug: 'croatia', name: 'Хорватия', countPlaces: 540 },
    { slug: 'czech', name: 'Чехия', countPlaces: 520 },
    { slug: 'netherlands', name: 'Нидерланды', countPlaces: 500 },
]

export function ListCountry({ setShowCountries }: Props) {
    const { watch, formState, setValue } = useFormContext<PlaceFormSchema>()

    const country = watch('country')
    const countryError = formState.errors.country

    const { countries, error, loading } = useGetCountries(
        country && !countryError ? country : ''
    )

    const clickCountry = (slug: string, name: string) => {
        setValue("country", name, { shouldValidate: true })
        setShowCountries(false)
    }

    /* if (loading) return <ClipLoaderUI />
     if (error) return <Error />
    if (!countries) return <Empty /> */

    return (
        <div className="flex flex-col">
            {
                listCountries.map((obj, i) => <Elem key={i} obj={obj} clickCountry={clickCountry} />)
            }
        </div>
    )
}