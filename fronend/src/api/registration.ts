import { api } from "./client"

type Registration = {
    email: string,
    password: string,
    name: string
}

export const postAccount = async (body: Registration): Promise<Registration> => {
    const { data } = await api.post<{ data: Registration }>('/auth/registration', body)

    return data.data
}