'use client'

import { ChevronDown, ChevronUp, X } from "lucide-react"
import { useRef, useState } from "react"
import { useClickAway } from "react-use"
import { useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { PlaceFormSchema } from "@/lib/schemas"

type Props = {

}

export function Time({ }: Props) {
    const { setValue, formState } = useFormContext<PlaceFormSchema>()

    const [showTime, setShowTime] = useState<boolean>(false)
    const [hours, setHours] = useState<number>(0)
    const [minutes, setMinutes] = useState<number>(0)

    const ref = useRef<HTMLDivElement>(null)

    const format = (n: number) => String(n).padStart(2, '0')

    const updateTime = (h: number, m: number) => {
        const value = `${format(h)}:${format(m)}`
        setValue('time', value, { shouldValidate: true })
    }

    const incHours = () => {
        const next = (hours + 1) % 24
        setHours(next)
        updateTime(next, minutes)
    }

    const decHours = () => {
        const next = (hours - 1 + 24) % 24
        setHours(next)
        updateTime(next, minutes)
    }

    const incMinutes = () => {
        const next = (minutes + 1) % 60
        setMinutes(next)
        updateTime(hours, next)
    }

    const decMinutes = () => {
        const next = (minutes - 1 + 60) % 60
        setMinutes(next)
        updateTime(hours, next)
    }

    useClickAway(ref, () => setShowTime(false))

    return (
        <div ref={ref} className='relative w-[200px]'>
            <div className='bg-[rgba(233,235,214,1)] rounded-2xl py-[10px]'>
                <div onClick={() => setShowTime(true)}
                    className={cn(
                        ' w-[200px] flex justify-center items-center gap-x-[10px]',
                        'hover:scale-101 transition-transform duration-300 cursor-pointer'
                    )}>
                    <div className='text-[20px] font-light'>Time:</div>
                    <div className='text-[22px]'>{format(hours)}:{format(minutes)}</div>
                </div>
                {formState.errors.time &&
                    <p className="text-red-500 font-light mt-[5px] text-center">{formState.errors.time.message}</p>
                }
            </div>
            <div className={cn(
                'z-10 bg-[#a4bcbc] rounded-2xl p-[10px] flex gap-y-[20px]',
                'absolute right-[-120px] top-[-25px]',
                'transition- duration-300',
                showTime
                    ? 'opacity-100'
                    : 'opacity-0'
            )}>
                <div className="w-[40px] text-[20px] text-center flex flex-col items-center gap-y-[10px]">
                    <ChevronUp size={20} onClick={incHours}
                        className="text-gray-400 hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer" />
                    <div>{format(hours)}</div>
                    <ChevronDown size={20} onClick={decHours}
                        className="text-gray-400 hover:translate-y-[2px] transition-transform duration-300 cursor-pointer" />
                </div>

                <div className="w-[40px] text-[20px] text-center flex flex-col items-center gap-y-[10px]">
                    <ChevronUp size={20} onClick={incMinutes}
                        className="text-gray-400 hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer" />
                    <div>{format(minutes)}</div>
                    <ChevronDown size={20} onClick={decMinutes}
                        className="text-gray-400 hover:translate-y-[2px] transition-transform duration-300 cursor-pointer" />
                </div>
            </div>
        </div>
    )
}