'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from "@/lib/utils"
import { ListCard } from './ListCard'
import { ProfileCard } from '@/types/profileCard'

const list: ProfileCard[] = [
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: false
    },
    {
        photoProfile: '',
        description: 'Пишу интерфейсы, которые не бесят. React, Next.js, TypeScript.',
        name: 'Арсений',
        userName: 'arsikFrol',
        age: 18,
        profileId: '',
        favourites: true
    }
]

export function FindFriend() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'center',
        loop: false,
        dragFree: false,
        containScroll: false,
        startIndex: 10
    })

    const [currentIndex, setCurrentIndex] = useState(10)
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    useEffect(() => {
        if (!emblaApi) return

        const onSelect = () => {
            setCurrentIndex(emblaApi.selectedScrollSnap())
            setCanScrollPrev(emblaApi.canScrollPrev())
            setCanScrollNext(emblaApi.canScrollNext())
        }

        onSelect()
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)

        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('reInit', onSelect)
        }
    }, [emblaApi])

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    return (
        <div className="relative bg-[rgba(164,188,188,1)] h-[calc(100vh-77px)] flex items-center">
            <div className='w-[1580px] mx-auto'>
                <div className="overflow-hidden" ref={emblaRef}>
                    <ListCard currentIndex={currentIndex} list={list} />
                </div>
                <div onClick={scrollPrev} className={cn(
                    'absolute left-[50px] top-1/2 -translate-y-1/2',
                    'w-[40px] h-[40px] rounded-full bg-white shadow',
                    'flex items-center justify-center',
                    'hover:bg-gray-100 transition-colors cursor-pointer',
                    !canScrollPrev && 'opacity-50 cursor-not-allowed',
                )}>
                    <ChevronLeft size={20} />
                </div>
                <div onClick={scrollNext} className={cn(
                    'absolute right-[50px] top-1/2 -translate-y-1/2',
                    'w-[40px] h-[40px] rounded-full bg-white shadow',
                    'flex items-center justify-center',
                    'hover:bg-gray-100 transition-colors cursor-pointer',
                    !canScrollNext && 'opacity-50 cursor-not-allowed',
                )}>
                    <ChevronRight size={20} />
                </div>
            </div>
        </div>
    )
}