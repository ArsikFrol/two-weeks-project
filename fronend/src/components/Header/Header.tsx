'use client'

import { useCallback } from "react"
import { usePathname } from "next/navigation"

import { ElemNav } from "./ElemNav"
import { Logo } from "./Logo"
import { TypeRoutes, useTypedRouter } from "@/hooks/useTypedRouter"
import { Profile } from "./Profile"

export type Nav = {
    id: number,
    text: string,
    link: TypeRoutes
}

const listNav: Nav[] = [
    { id: 1, text: 'Find a friend', link: '/findFriend' },
    { id: 2, text: 'Choose a place', link: '/choosePlace' },
    { id: 3, text: 'T-A-T', link: '/T-A-T' },
    { id: 4, text: 'Messanger', link: '/messager' },
]

export function Header() {
    const router = useTypedRouter()
    const pathName = usePathname()

    const page = `/${pathName.split('/')[1]}` as TypeRoutes

    const clickNav = useCallback((link: TypeRoutes) => router.push(link), [])

    return (
        <div className="flex justify-between bg-[rgba(233,235,214,1)] py-[15px]">
            <div className='w-[1540px] mx-auto flex justify-between'>
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