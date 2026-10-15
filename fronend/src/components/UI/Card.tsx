'use client'

import { MessageCircle, Star } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { ProfileCard } from "@/types/profileCard"
import { useTypedRouter } from "@/hooks/useTypedRouter"
import { postFavoritesToogle } from "@/api/favorites"

type Props = {
    obj: ProfileCard,
    status: "authenticated" | "loading" | "unauthenticated",
    myId: string,

    myCard?: boolean
}

export function Card({ obj, status, myId, myCard = false }: Props) {
    const router = useTypedRouter()

    const [isFavorites, setIsFavorites] = useState<boolean>(obj.favourites)

    const clickStar = async () => {
        if (myCard) {
            setIsFavorites(!isFavorites)
            console.log('sdf')
            return
        }

        if (status === 'loading') return

        if (status === 'unauthenticated') {
            router.push('/signUp')
            return
        }

        try {

            const newFavorite = await postFavoritesToogle(myId, obj.profileId)
            setIsFavorites(newFavorite)

        } catch (error) {
            console.error(error)
        }
    }

    const clickMessage = () => {

    }

    return (
        <div className="bg-[rgba(245,186,154,1)] rounded-2xl px-[20px] pt-[20px] h-[555px]">
            <div className='bg-white rounded-2xl h-[400px] w-[330px] flex flex-col justify-end'>
                <div className='flex items-center justify-between mx-[10px] mb-[10px]'>
                    <div className={cn(
                        'p-[10px] bg-[rgba(245,186,154,1)] rounded-full',
                        'hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer'
                    )} onClick={clickStar}>
                        <Star strokeWidth={1.5} fill={isFavorites ? 'yellow' : 'white'}
                            color={isFavorites ? 'yellow' : 'white'} />
                    </div>
                    <div className='text-center text-[18px]'>{obj.name}</div>
                    <div className={cn(
                        'p-[10px] bg-[rgba(245,186,154,1)] rounded-full',
                        'hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
                    )} onClick={clickMessage}>
                        <MessageCircle strokeWidth={1.5} fill="white" color="white" />
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-x-[20px] justify-center text-[18px] mt-[10px]'>
                <div className=''>{obj.age} лет</div>
                <div className=''>@{obj.userName}</div>
            </div>
            <div className={cn(
                'grid transition-[grid-template-rows,opacity] duration-300 mt-[10px] mb-[20px]',
                obj.description.length
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0',
            )}>
                <div className='overflow-hidden'>
                    <div className='bg-white p-[10px] rounded-2xl w-[330px]'>
                        <div>{obj.description}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}