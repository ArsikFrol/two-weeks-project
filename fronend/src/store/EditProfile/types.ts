export type EditProfile = {
    photoProfile?: string,
    name: string,
    userName: string,
    description: string,
    age: number
}

export type UseEditProfile = {
    editProfile: EditProfile,
    setEditProfile: (value: Partial<EditProfile>) => void
}