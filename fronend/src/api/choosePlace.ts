import { PlaceFormSchema } from "@/lib/schemas"
import { api } from "./client"
import { Place } from "@/types/place"

export const postChoosePlace = async (body: PlaceFormSchema): Promise<Place[]> => {
    const { data } = await api.post<{ data: Place[] }>('/choosePlace', body)

    return data.data
}