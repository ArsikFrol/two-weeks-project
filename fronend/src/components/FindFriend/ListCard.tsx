import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Card } from "../UI/Card"
import { useGetProfileCards } from "@/hooks/useProfileCard"
import { ClipLoaderUI } from "../UI/ClipLoader"
import { ProfileCard } from "@/types/profileCard"

type Props = {
    currentIndex: number,

    list: ProfileCard[]
}

export function ListCard({ currentIndex, list }: Props) {
    const { data: session } = useSession()

    const { profileCards, error, loading } = useGetProfileCards(session?.user.id)

    /*  if (loading) return <ClipLoaderUI />
     if (!profileCards) return */

    return (
        <div className="flex gap-x-[20px]">
            {list.map((profile, i) => {
                const isActive = currentIndex === i
                return (
                    <div key={i} className={cn(
                        'flex-[0_0_370px] transition-all duration-500',
                        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50',
                    )}>
                        <Card obj={profile} />
                    </div>
                )
            })}
        </div>
    )
}