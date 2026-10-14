import { ProfileCard } from "@/types/profileCard"
import { api } from "./client"

export const getProfileCard = async (myId?: string, profileId?: string): Promise<ProfileCard[]> => {

    const params = new URLSearchParams()

    if (myId) params.set('myId', myId)
    if (profileId) params.set('profileId', profileId)

    const qs = params.toString()
    const url = qs ? `/profileCard?${qs}` : '/profileCard'

    const { data } = await api.get<{ data: ProfileCard[] }>(url)

    return data.data
}