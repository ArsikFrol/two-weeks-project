'use client'

import Image from "next/image"

import { useTypedRouter } from "@/hooks/useTypedRouter"
import { cn } from "@/lib/utils"

import bg from '../../public/bg.png'
import cloud from '../../public/cloud.png'

export function About() {
    const router = useTypedRouter()

    return (
        <div className="relative h-[calc(100vh-77px)] bg-[rgba(164,188,188,1)] flex items-center justify-center overflow-hidden">
            <Image src={bg} alt='' draggable='false' className="absolute right-[-10px] top-[-80px]" />
            <Image src={cloud} alt='' draggable='false' className="absolute bottom-[100px] left-[100px]" />
            <div className='z-10 flex flex-col gap-y-[20px]'>
                <div className='relative w-[550px] h-[420px]'>
                    <div className='z-10 relative bg-[rgba(232,235,215,1)] rounded-[50px] p-[20px] text-center'>
                        <div className='text-[30px] font-light text-[rgba(59,80,139,1)]'>
                            AI will find a place,
                            the calendar will remember the date,
                            people will find each other.
                            Everything is simple.
                        </div>
                        <div className='text-[64px] text-[rgba(59,80,139,1)]'>T-A-T</div>
                    </div>
                    <div className={cn(
                        'z-0 bg-[rgba(228,170,169,1)] rounded-b-4xl text-center font-light px-[20px] pb-[20px] text-[24px] text-white',
                        'pt-[50px]',
                        'absolute bottom-[10px] left-0'
                    )}>
                        Schedule a meeting by choosing a date and time, and the AI will help you find a great location and topics for conversation.
                    </div>
                </div>
                <div className='flex items-center justify-between'>
                    <div className={cn(
                        'bg-[rgba(228,170,169,1)] rounded-2xl py-[15px] px-[40px]',
                        'border-2 border-[rgba(255,255,255,1)] text-[18px]',
                        'hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer'
                    )} onClick={() => router.push('/signUp')}>Sign up</div>
                    <div className={cn(
                        'bg-[rgba(159,179,234,1)] rounded-2xl py-[15px] px-[40px]',
                        'border-2 border-[rgba(255,255,255,1)] text-[18px]',
                        'hover:scale-101 transition-transform duration-300 cursor-pointer'
                    )} onClick={() => router.push('/choosePlace')}>Log in as a guest</div>
                    <div className={cn(
                        'bg-[rgba(232,235,215,1)] rounded-2xl py-[15px] px-[40px]',
                        'border-2 border-[rgba(255,255,255,1)] text-[18px]',
                        'hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
                    )} onClick={() => router.push('/signIn')}>Sign in</div>
                </div>
            </div>
        </div>
    )
}