import { api } from "./client"

export const postFavorites = async (myId: string, profileId?: string) => await api.post('/favorites', { myId, profileId })