import { useEffect, useState } from "react"

import { getCities } from "@/api/cities"
import { Country } from "@/types/country"
import { getCountries } from "@/api/countries"

type TReturn = {
    countries: Country[] | undefined,
    loading: boolean,
    error: Error | undefined
}

export function useGetCountries(search?: string): TReturn {
    const [countries, setCountries] = useState<Country[]>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error>()

    useEffect(() => {
        const trimmed = search?.trim() ?? ''

        if (trimmed.length > 0 && trimmed.length < 3) {
            return
        }

        async function fetChcountries() {

            setLoading(true)
            setError(undefined)

            try {
                const data = await getCountries(search)
                setCountries(data)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetChcountries()
    }, [search])

    return { countries, loading, error }
}