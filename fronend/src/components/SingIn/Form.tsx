'use client'

import { EmailForm, emailSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export function Form() {

    const { register, handleSubmit, formState, watch } = useForm<EmailForm>({
        resolver: zodResolver(emailSchema),
        mode: 'onTouched',
        defaultValues: { email: '' },
    })

    const onSubmit = async (data: EmailForm) => {
        console.log('Валидные данные:', data)

    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} >
            <input {...register('email')}
                spellCheck='false'
                className={cn(
                    'w-full border border-gray-400 rounded-xl shadow h-[40px] pl-[15px] pr-[20px] mt-[20px]',
                    'focus:outline-0 '
                )} placeholder='ivanov.ivan@mail.ru' />
            {formState.errors && <div className='text-red-500 text-[14px] mt-[5px]'>{formState.errors.email?.message}</div>}
            <button type="submit" disabled={formState.isSubmitting}
                className={cn(
                    'bg-white/50 w-full rounded-xl h-[40px] mt-[20px]',
                    formState.isValid && 'bg-white text-black hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
                )}>
                {formState.isSubmitting ? 'Отправка...' : 'Sign up with email'}
            </button>
        </form>
    )
}