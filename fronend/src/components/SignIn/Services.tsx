'use client'

import Image from "next/image"
import { signIn } from "next-auth/react"

import { cn } from "@/lib/utils"
import google from '../../../public/google.png'
import git from '../../../public/git.png'

export function Services() {
    return (
        <div className='flex flex-col gap-y-[10px]'>
            <div className={cn(
                'relative flex items-center gap-x-[20px] bg-white py-[10px] px-[20px] rounded-2xl',
                'hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
            )} onClick={() => signIn('google', { callbackUrl: '' })}>
                <Image src={google} alt='' draggable='false' className="absolute left-[20px] top-[10px] w-[20px] h-[20px]" />
                <div className='w-full text-center'>Google</div>
            </div>
            <div className={cn(
                'relative flex items-center gap-x-[20px] bg-[#F6F8FA] py-[10px] px-[20px] rounded-2xl',
                'hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
            )} onClick={() => signIn('github', { callbackUrl: '' })}>
                <Image src={git} alt='' draggable='false' className="absolute left-[20px] top-[10px] w-[20px] h-[20px]" />
                <div className='text-[#24292F] w-full text-center'>GitHub</div>
            </div>
        </div>
    )
}