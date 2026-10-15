import { create } from "zustand";

import { EditProfile, UseEditProfile } from "./types";

export const useEditProfile = create<UseEditProfile>((set) => ({
    editProfile: {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18
    },

    setEditProfile: (value: Partial<EditProfile>) =>
        set((state) => ({
            editProfile: { ...state.editProfile, ...value }
        }))
}))