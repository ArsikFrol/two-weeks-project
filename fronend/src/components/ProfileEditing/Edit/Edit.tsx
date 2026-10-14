'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect } from "react"

import { editProfile, EditProfileZod } from "@/lib/schemas"
import { EditProfile } from "@/store/EditProfile/types"
import { cn } from "@/lib/utils"
import { UploadFile } from "./UploadFile"
import { Name } from "./Name"
import { UserName } from "./UserName"

type Props = {
    obj: EditProfile,
    setObj: (value: EditProfile) => void,

    editProfileState: EditProfile
    setEditProfile: (value: Partial<EditProfile>) => void
}

export function Edit({ obj, setObj, editProfileState, setEditProfile }: Props) {

    const { register, handleSubmit, formState, reset, watch } = useForm<EditProfileZod>({
        resolver: zodResolver(editProfile),
        mode: 'onTouched',
        defaultValues: {
            description: '',
            name: '',
            userName: ''
        },
    })

    const onSubmit = async (data: EditProfileZod) => {
        console.log('Валидные данные:', data)

        try {

            setEditProfile({
                description: watch('description'),
                name: watch('name'),
                userName: watch('userName')
            })

            reset()

        } catch (error) {
            console.log(`Ошибка: ${error}`)
        }

    }

    useEffect(() => {
        const sub = watch((value, { name }) => {
            if (!name) return

            setObj({
                ...obj,
                [name]: value[name as keyof EditProfileZod] ?? obj[name as keyof EditProfile],
            })
        })
        return () => sub.unsubscribe()
    }, [watch, setObj])

    return (
        <div className="bg-[rgba(146,173,177,1)] p-[20px] h-[calc(100vh-77px)] w-[600px]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between gap-y-[20px] h-[calc(100vh-117px)] overflow-y-auto">
                <UploadFile />
                <Name register={register} name={editProfileState.name} isError={formState.errors['name']} />
                <UserName register={register} userName={editProfileState.userName} isError={formState.errors['userName']} />
                <div className='bg-[rgba(120,150,153,1)] rounded-2xl p-[10px]'>
                    <div className='text-[30px] font-light text-center'>change description:</div>
                    <textarea {...register('description')} placeholder={editProfileState.description} rows={2}
                        className={cn(
                            'w-full border border-gray-400 rounded-2xl p-[20px] mt-[10px]',
                            'focus:outline-0 focus:shadow transition-[box-shadow] duration-300'
                        )} />
                </div>
                <button type="submit" disabled={formState.isSubmitting}
                    className={cn(
                        'bg-white/50 w-full rounded-xl h-[60px] mt-[20px] flex-shrink-0 text-[18px]',
                        formState.isValid && 'bg-white text-black hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer'
                    )}>
                    {formState.isSubmitting ? 'Отправка...' : 'Save'}
                </button>
            </form>
        </div>
    )
}