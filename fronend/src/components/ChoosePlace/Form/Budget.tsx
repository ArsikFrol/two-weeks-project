import { useFormContext } from "react-hook-form"

import { PlaceFormSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"

type Props = {

}

export function Budget({ }: Props) {
    const { register, formState } = useFormContext<PlaceFormSchema>()

    return (
        <div className="bg-[rgba(233,235,214,1)] rounded-2xl py-[10px] px-[30px] flex gap-x-[20px] w-fit">
            <div className='text-[20px] font-light flex-shrink-0'>budget: from</div>
            <div className='flex flex-col'>
                <input {...register('min', { valueAsNumber: true })} spellCheck='false' className={cn(
                    'border-b border-[rgba(62,81,79,1)]/10 w-[100px] text-[20px] text-center',
                    'focus:outline-0',
                )} placeholder='0' />
                {formState.errors.min && (
                    <p className="text-red-500 text-[12px] mt-[5px] text-center">
                        {formState.errors.min.message}
                    </p>
                )}
            </div>
            <div className='text-[20px] font-light'>to</div>
            <div className='flex flex-col'>
                <input {...register('max', { valueAsNumber: true })} spellCheck='false' className={cn(
                    'border-b border-[rgba(62,81,79,1)]/10 w-[100px] text-[20px] text-center',
                    'focus:outline-0',
                )} placeholder='1000000' />
                {formState.errors.max && (
                    <p className="text-red-500 text-[12px] mt-[5px] text-center">
                        {formState.errors.max.message}
                    </p>
                )}
            </div>
        </div>
    )
}