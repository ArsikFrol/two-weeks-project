import { useGetCities } from "@/hooks/useCities"
import { Elem } from "./Elem"
import { City } from "@/types/city"
import { useFormContext } from "react-hook-form"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {
    setShowCities: (value: boolean) => void,
}

const listCities: City[] = [
    { name: 'Москва', slug: 'moscow', countPlaces: '1250' },
    { name: 'Санкт-Петербург', slug: 'spb', countPlaces: '1180' },
    { name: 'Казань', slug: 'kazan', countPlaces: '1120' },
    { name: 'Новосибирск', slug: 'novosibirsk', countPlaces: '1080' },
    { name: 'Екатеринбург', slug: 'ekaterinburg', countPlaces: '950' },
    { name: 'Нижний Новгород', slug: 'nizhny', countPlaces: '890' },
    { name: 'Самара', slug: 'samara', countPlaces: '870' },
    { name: 'Омск', slug: 'omsk', countPlaces: '830' },
    { name: 'Ростов-на-Дону', slug: 'rostov', countPlaces: '810' },
    { name: 'Уфа', slug: 'ufa', countPlaces: '780' },
    { name: 'Красноярск', slug: 'krasnoyarsk', countPlaces: '720' },
    { name: 'Воронеж', slug: 'voronezh', countPlaces: '690' },
    { name: 'Пермь', slug: 'perm', countPlaces: '660' },
    { name: 'Волгоград', slug: 'volgograd', countPlaces: '640' },
    { name: 'Краснодар', slug: 'krasnodar', countPlaces: '610' },
    { name: 'Саратов', slug: 'saratov', countPlaces: '590' },
    { name: 'Тюмень', slug: 'tyumen', countPlaces: '570' },
    { name: 'Тольятти', slug: 'tolyatti', countPlaces: '540' },
    { name: 'Ижевск', slug: 'izhevsk', countPlaces: '520' },
    { name: 'Барнаул', slug: 'barnaul', countPlaces: '500' },
]

export function ListCities({ setShowCities }: Props) {
    const { watch, formState, setValue } = useFormContext<PlaceFormSchema>()

    const city = watch('city')
    const cityError = formState.errors.city

    const { cities, error, loading } = useGetCities(
        watch('country'), city && !cityError ? city : ''
    )

    const clickCity = (slug: string, name: string) => {
        setValue("city", name, { shouldValidate: true })
        setShowCities(false)
    }

    /* if (loading) return <ClipLoaderUI />
     if (error) return <Error />
    if (!countries) return <Empty /> */

    return (
        <div className="flex flex-col">
            {
                listCities.map((obj, i) => <Elem key={i} obj={obj} clickCity={clickCity} />)
            }
        </div>
    )
}