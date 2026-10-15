import { useEffect, useState } from "react"

import { City } from "@/types/city"
import { getCities } from "@/api/cities"

type TReturn = {
    cities: City[] | undefined,
    loading: boolean,
    error: Error | undefined
}

export function useGetCities(slug: string, search?: string): TReturn {
    const [cities, setCities] = useState<City[]>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error>()

    useEffect(() => {
        const trimmed = search?.trim() ?? ''

        if (trimmed.length > 0 && trimmed.length < 3) {
            return
        }

        async function fetchCities() {

            setLoading(true)
            setError(undefined)

            try {
                const data = await getCities(slug, search)
                setCities(data)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchCities()
    }, [slug, search])

    return { cities, loading, error }
}