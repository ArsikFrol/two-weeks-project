'use client'

import { signOut, useSession } from "next-auth/react"
import { useRef, useState } from "react"
import { ChevronDown, LogOut } from "lucide-react"
import { useClickAway } from "react-use"

import { TypeRoutes, useTypedRouter } from "@/hooks/useTypedRouter"
import { cn } from "@/lib/utils"

type Props = {
    page: TypeRoutes
}

type ElemMenu = {
    link: TypeRoutes,
    text: string
}

const menu: ElemMenu[] = [
    { link: '/profile/settings', text: 'Настройки' },
    { link: '/profile/editing', text: 'Редактирование' },
    { link: '/', text: 'Выйти' }
]

export function Profile({ page }: Props) {
    const [showMenu, setShowMenu] = useState<boolean>(false)

    const router = useTypedRouter()
    const { data: session, status } = useSession()

    const ref = useRef<HTMLDivElement>(null)

    const clickElem = (link: TypeRoutes) => {
        setShowMenu(false)
        if (status === 'loading') return
        if (link === '/') {
            signOut()
            router.push('/')
            return
        } else router.push(link)
    }

    useClickAway(ref, () => setShowMenu(false))

    return (
        <div ref={ref} className={cn(
            'relative',
            session
                ? ''
                : 'hidden'
        )}>
            <div onClick={() => setShowMenu(true)} className={cn(
                "px-[30px] py-[10px] flex items-center gap-x-[10px]",
                'hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer',
                page === '/profile' && 'bg-[rgba(164,188,188,1)] rounded-2xl'
            )}>
                <div className='text-[18px] '>Profile</div>
                <ChevronDown size={20} className={cn(
                    'transition-transform duration-300',
                    showMenu && 'rotate-180'
                )} />
            </div>
            <div className={cn(
                'z-10 absolute top-[50px] right-0 w-[200px] drop-shadow-2xl',
                'grid transition-[grid-template-rows,opacity] duration-300',
                showMenu
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            )}>
                <div className='overflow-hidden'>
                    <div className='bg-[rgba(164,188,188,1)] rounded-2xl flex flex-col'>
                        {menu.map((obj, i) => (
                            <div key={i} className={cn(
                                'text-[18px] font-light py-[10px] pl-[20px]',
                                'flex items-center justify-between',
                                'hover:bg-[rgba(148,172,172,1)] transition-colors duration-300 cursor-pointer',
                                i === 0 && 'rounded-t-2xl',
                                i === menu.length - 1 && 'rounded-b-2xl',
                            )} onClick={() => clickElem(obj.link)}>
                                <div>{obj.text}</div>
                                <LogOut className={cn(
                                    'mr-[20px]',
                                    i !== menu.length - 1 && 'hidden'
                                )} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}