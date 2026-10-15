import { City } from "@/types/city"
import { api } from "./client"

export const getCities = async (slug: string, search?: string): Promise<City[] | null> => {

    const params = new URLSearchParams()

    if (!slug) return null
    if (slug) params.set('slug', slug)
    if (search && search.length > 3) params.set('search', search)

    const qs = params.toString()
    const url = qs ? `/cities?${qs}` : '/cities'

    const { data } = await api.get<{ data: City[] }>(url)

    return data.data
}