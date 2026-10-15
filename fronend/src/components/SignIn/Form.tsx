'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { FieldError, useForm } from "react-hook-form"
import { signIn } from "next-auth/react"

import { signInSchema, SignInlForm } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { useTypedRouter } from "@/hooks/useTypedRouter"
import { Error } from "../UI/Error"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function Form() {
    const router = useTypedRouter()

    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, formState, reset, setError } = useForm<SignInlForm>({
        resolver: zodResolver(signInSchema),
        mode: 'onTouched',
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (data: SignInlForm) => {
        console.log('Валидные данные:', data)

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false
            })

            if (result.error) {
                setError('root', {
                    message: 'Неверный email или пароль',
                })
                return
            }

            reset()
            router.push('/profile/editing')
        } catch (error) {
            console.log(`Ошибка: ${error}`)
            setError('root', {
                message: 'Что-то пошло не так. Попробуйте позже',
            })
        }

    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')}
                spellCheck='false'
                className={cn(
                    'w-full border border-gray-400 rounded-xl shadow h-[40px] pl-[15px] pr-[20px] mt-[20px]',
                    'focus:outline-0 '
                )} placeholder='ivanov.ivan@mail.ru' />
            <Error isError={formState.errors.email} />
            <div className="relative">
                <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    spellCheck='false'
                    className={cn(
                        'w-full border border-gray-400 rounded-xl shadow h-[40px] pl-[15px] pr-[40px] mt-[20px]',
                        'focus:outline-0'
                    )}
                    placeholder='pasSwor$1'
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 mt-[10px] text-gray-500"
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <Error isError={formState.errors.password} />
            <button type="submit" disabled={formState.isSubmitting}
                className={cn(
                    'bg-white/50 w-full rounded-xl h-[40px] mt-[20px]',
                    formState.isValid && 'bg-white text-black hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
                )}>
                {formState.isSubmitting ? 'Отправка...' : 'Sign in'}
            </button>
            <Error isError={formState.errors.root as FieldError | undefined} className="text-center" />
        </form>
    )
}