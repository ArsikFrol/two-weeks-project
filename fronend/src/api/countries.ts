import { Country } from "@/types/country"
import { api } from "./client"

export const getCountries = async (search?: string): Promise<Country[]> => {

    const params = new URLSearchParams()

    if (search && search.length > 3) params.set('search', search)

    const qs = params.toString()
    const url = qs ? `/countries?${qs}` : '/countries'

    const { data } = await api.get<{ data: Country[], status: number }>(url)

    return data.data
}