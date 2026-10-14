'use client'

import { useTypedRouter } from "@/hooks/useTypedRouter"

export function About() {
    const router = useTypedRouter()

    return (
        <div className="min-h-screen bg-[rgba(164,188,188,1)] flex items-center justify-center">
            <div className='flex items-center gap-x-[100px]'>
                <div className='w-[200px] h-[50px] bg-white rounded-2xl flex items-center justify-center'
                    onClick={() => router.push('/signUp')}>Зарегаться</div>
                <div className='w-[200px] h-[50px] bg-white rounded-2xl flex items-center justify-center'
                    onClick={() => router.push('/signIn')}>Войти</div>
            </div>
        </div>
    )
}