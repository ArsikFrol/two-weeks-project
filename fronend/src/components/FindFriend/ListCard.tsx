import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Card } from "../UI/Card"
import { useGetProfileCards } from "@/hooks/useProfileCard"
import { ClipLoaderUI } from "../UI/ClipLoader"

type Props = {
    currentIndex: number,
}

export function ListCard({ currentIndex }: Props) {
    const { data: session, status } = useSession()

    const { profileCards, error, loading } = useGetProfileCards()

    if (loading) return <ClipLoaderUI />
    if (!profileCards) return <div className='flex justify-center text-white text-[30px]'>Карточек пока что нет :(</div>

    return (
        <div className="flex gap-x-[20px]">
            {profileCards.map((profile, i) => {
                const isActive = currentIndex === i
                return (
                    <div key={i} className={cn(
                        'flex-[0_0_370px] transition-all duration-500',
                        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50',
                    )}>
                        <Card obj={profile} status={status} myId={session ? session.user.id : ''} />
                    </div>
                )
            })}
        </div>
    )
}