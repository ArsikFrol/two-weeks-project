import { City } from "@/types/city"
import { api } from "./client"

export const getCities = async (): Promise<City[]> => {
    const {data} = await  api.get<City[]>('/cities')

    return data
}