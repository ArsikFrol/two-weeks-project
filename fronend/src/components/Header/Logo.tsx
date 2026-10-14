'use client'

import { useTypedRouter } from "@/hooks/useTypedRouter"
import { cn } from "@/lib/utils"

export function Logo() {
    const router = useTypedRouter()

    const clickLogo = () => router.push('/')

    return (
        <div onClick={clickLogo} className={cn(
            "group inline-flex shrink-0 items-center gap-3 rounded-lg cursor-pointer",
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#765d99]'
        )}>
            <span className={cn(
                "grid h-10 w-10 place-items-center rounded-[13px] bg-[#7770a9]",
                'text-[11px] font-black tracking-[-0.08em] text-white shadow-[4px_4px_0_#91d4d0] transition-transform group-hover:-rotate-6'
            )}>
                Т·А·Т
            </span>
            <span className={cn(
                "bg-[linear-gradient(180deg,#a66d88_0%,#79689b_52%,#58a9a5_100%)]",
                'bg-clip-text text-[21px] font-black tracking-[-0.075em] text-transparent sm:text-[23px]'
            )}>
                ТЕТ-А-ТЕТ
            </span>
        </div>
    )
}