import { ProfileCard } from "@/types/profileCard"
import { api } from "./client"

export const postFavoritesToogle = async (myId: string, profileId: string): Promise<boolean> => {
    const { data } = await api.post<{ data: { isFavorite: boolean } }>('/favorites', { myId, profileId })

    return data.data.isFavorite
}

export const getMyFavorites = async (myId: string): Promise<ProfileCard[]> => {
    const { data } = await api.get<{ data: ProfileCard[] }>(`/favorites?myId=${myId}`)

    return data.data
}