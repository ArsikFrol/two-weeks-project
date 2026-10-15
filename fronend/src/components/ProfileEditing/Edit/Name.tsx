import { FieldError, UseFormRegister } from "react-hook-form"

import { EditProfileZod } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { Error } from "@/components/UI/Error"

type Props = {
    register: UseFormRegister<EditProfileZod>,
    isError?: FieldError,
    name: string
}

export function Name({ register, isError, name }: Props) {
    return (
        <div className='bg-[rgba(120,150,153,1)] rounded-2xl p-[10px]'>
            <div className='text-[30px] font-light text-center'>change your name:</div>
            <div className='flex flex-col gap-y-[5px] bg-[rgba(217,217,217,1)] rounded-2xl px-[15px] py-[10px] mt-[10px]'>
                <div className='flex items-center gap-x-[10px]'>
                    <div className='font-light text-[18px]'>Name:</div>
                    <input {...register('name')} spellCheck='false' className={cn(
                        'border-b border-gray-400 text-[18px] text-gray-800 w-full h-[35px]',
                        'focus:outline-0',
                    )} placeholder={name} />
                </div>
                <Error isError={isError} />
            </div>
        </div>
    )
}