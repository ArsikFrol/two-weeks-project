import { City } from "@/types/city"
import { api } from "./client"

export const getCities = async (countryId?: string, search?: string): Promise<City[]> => {

    const params = new URLSearchParams()

    if (countryId) params.set('countryId', countryId)

    const trimmed = search?.trim() ?? ''
    if (trimmed.length >= 3) {
        params.set('search', trimmed)
    }

    const qs = params.toString()
    const url = `/cities${qs ? `?${qs}` : ''}`


    const { data } = await api.get<{ items: City[] }>(url)

    return data.items
}