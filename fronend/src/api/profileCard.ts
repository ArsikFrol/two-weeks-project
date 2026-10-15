import { ProfileCard } from "@/types/profileCard"
import { api } from "./client"

export const getProfileCard = async (): Promise<ProfileCard[]> => {
    const { data } = await api.get<{ data: ProfileCard[] }>('/profileCard')

    return data.data
}