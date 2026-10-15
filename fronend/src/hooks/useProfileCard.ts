import { useEffect, useState } from "react"

import { getProfileCard } from "@/api/profileCard"
import { ProfileCard } from "@/types/profileCard"

type TReturn = {
    profileCards: ProfileCard[] | undefined,
    loading: boolean,
    error: Error | undefined
}

export function useGetProfileCards(): TReturn {
    const [profileCards, setProfileCards] = useState<ProfileCard[]>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error>()

    useEffect(() => {
        async function fetchProfileCards() {
            try {
                const data = await getProfileCard()
                setProfileCards(data)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfileCards()
    }, [])

    return { profileCards, loading, error }
}