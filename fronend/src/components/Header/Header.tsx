'use client'

import { useCallback } from "react"
import { usePathname } from "next/navigation"

import { ElemNav } from "./ElemNav"
import { Logo } from "./Logo"
import { TypeRoutes, useTypedRouter } from "@/hooks/useTypedRouter"
import { Profile } from "./Profile"
import { cn } from "@/lib/utils"

export type Nav = {
    id: number,
    text: string,
    link: TypeRoutes
}

const listNav: Nav[] = [
    { id: 1, text: 'Find a friend', link: '/findFriend' },
    { id: 2, text: 'Choose a place', link: '/choosePlace' },
    { id: 3, text: 'Messanger', link: '/messager' },
]

export function Header() {
    const router = useTypedRouter()
    const pathName = usePathname()

    const page = `/${pathName.split('/')[1]}` as TypeRoutes

    const clickNav = useCallback((link: TypeRoutes) => router.push(link), [])

    return (
        <div className="flex justify-between bg-[rgba(233,235,214,1)] py-[15px]">
            <div className={cn(
                'mx-auto flex justify-between',
                '2xl:w-[1500px] xl:w-[1200px]'
            )}>
                <Logo />
                <div className='flex items-center'>
                    {
                        listNav.map((obj, i) => <ElemNav key={i} obj={obj} clickNav={clickNav} page={page} />)
                    }
                    <Profile page={page} />
                </div>
            </div>
        </div>
    )
}