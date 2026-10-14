import { PlaceFormSchema } from "@/lib/schemas"
import { api } from "./client"

export const postChoosePlace = async (body: PlaceFormSchema): Promise<number> => {
    const { data } = await api.post<{ status: number }>('/choosePlace', body)

    return data.status
}