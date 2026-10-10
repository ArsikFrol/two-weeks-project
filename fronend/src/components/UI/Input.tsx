'use client'

import { X } from "lucide-react"
import { Control, useController } from "react-hook-form"

import { cn } from "@/lib/utils"
import { PlaceFormSchema } from "@/lib/schemas"
import { useState } from "react"

type Props = {
    title: string,
    placeholder: string,

    width: number,
    onClick?: () => void,

    control: Control<PlaceFormSchema>,
    name: keyof PlaceFormSchema
}

export function Input(
    { title, placeholder, width, name, control, onClick }: Props
) {

    const [focused, setFocused] = useState<boolean>(false)

    const { field, fieldState } = useController({ name, control })
    const error = fieldState.error

    const clickX = () => field.onChange('')
    const onBlur = () => {
        field.onBlur()
        setFocused(false)
    }

    return (
        <div className="flex flex-col">
            <div className="text-[20px] mb-[5px]">{title}</div>
            <div className="relative" style={{ width: `${width}px` }}>
                <input type="text" placeholder={placeholder} value={field.value} onChange={field.onChange} onBlur={onBlur}
                    className={cn(
                        'h-[50px] border border-gray-400 rounded-2xl pl-[20px] pr-[50px] text-[18px]'
                    )} style={{ width: `${width}px` }} onClick={onClick} onFocus={() => setFocused(true)} />
                {(error && name !== 'COUNTRY' && name !== 'CITY') &&
                    <p className="text-red-500 font-light mt-[5px]">{error.message}</p>
                }
                <X size={30} className={cn(
                    'absolute top-[10px] right-[10px]',
                    'transition-[translate,opacity] duration-300 cursor-pointer',
                    (field.value && focused)
                        ? 'opacity-100 translate-x-[-5px]'
                        : 'opacity-0 translate-x-[5px]'
                )} onClick={clickX} />
            </div>
        </div>
    )
}