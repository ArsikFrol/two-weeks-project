import { cn } from "@/lib/utils"
import { FieldError } from "react-hook-form"

type Props = {
    isError?: FieldError,

    className?: string
}

export function Error({ isError, className }: Props) {
    return (
        isError && <div className={cn('text-red-500 text-[14px] mt-[5px] font-light', className)}>{isError.message}</div>
    )
}