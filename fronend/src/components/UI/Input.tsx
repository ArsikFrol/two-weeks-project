'use client'

import { X } from "lucide-react"
import { Control, useController } from "react-hook-form"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {
    title: string,
    placeholder: string,

    width: number,
    flexCol?: boolean,

    onCliclX: () => void
    onClick?: () => void,

    control: Control<PlaceFormSchema>,
    name: keyof PlaceFormSchema
}

export function Input(
    { title, onCliclX, flexCol, placeholder, width, name, control, onClick }: Props
) {

    const [focused, setFocused] = useState<boolean>(false)

    const { field, fieldState } = useController({ name, control })
    const error = fieldState.error

    const clickX = () => {
        field.onChange('')
        onCliclX()
    }
    const onBlur = () => {
        field.onBlur()
        setFocused(false)
    }

    return (
        <div className={cn(
            "flex flex-col bg-[rgba(233,235,214,1)] rounded-2xl p-[20px]",
        )}>
            <div className={cn(
                'flex items-center',
                flexCol ? 'flex-col' : 'gap-x-[10px]'
            )}>
                <div className="text-[20px] font-light">{title}</div>
                <div className="relative" style={{ width: `${width}px` }}>
                    <input type="text" placeholder={placeholder} value={field.value as string} onChange={field.onChange} onBlur={onBlur}
                        className={cn(
                            'h-[50px] border-b border-[rgba(62,81,79,1)]/10 pr-[40px] text-[20px]',
                            'focus:outline-0'
                        )} style={{ width: `${width}px` }} onClick={onClick} onFocus={() => setFocused(true)} />
                    <X size={30} className={cn(
                        'absolute top-[10px] right-[0px]',
                        'transition-[translate,opacity] duration-300 cursor-pointer',
                        (field.value && focused)
                            ? 'opacity-100 translate-x-[-5px]'
                            : 'opacity-0 translate-x-[5px]'
                    )} onClick={clickX} />
                </div>
            </div>
            {error &&
                <p className="text-red-500 font-light mt-[5px]">{error.message}</p>
            }
        </div>
    )
}