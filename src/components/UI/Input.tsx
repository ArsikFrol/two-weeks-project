'use client'

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useState } from "react"

type Props = {
    title: string,
    placeholder: string,

    width: number,
    onClick?: () => void
}

export function Input (
    {title, placeholder, width, onClick}: Props
) {

    const [value, setValue] = useState<string>('')

    return(
        <div className="flex flex-col">
            <div className="text-[20px] mb-[5px]">{title}</div>
            <div className="relative" style={{width: `${width}px`}}>
                <input type="text" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)}
                    className={cn(
                        'h-[50px] border border-gray-400 rounded-2xl pl-[20px] pr-[50px] text-[18px]'
                    )} style={{width: `${width}px`}} onClick={onClick} />
                <X size={30} className={cn(
                    'absolute top-[10px] right-[10px]',
                    'transition-[translate,opacity] duration-300 cursor-pointer',
                    value  
                        ? 'opacity-100 translate-x-[-5px]'
                        : 'opacity-0 translate-x-[5px]'
                )} onClick={() => setValue('')}/>
            </div>
        </div>
    )
}