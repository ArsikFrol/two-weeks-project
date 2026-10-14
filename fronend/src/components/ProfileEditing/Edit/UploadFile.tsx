import { cn } from "@/lib/utils"

type Props = {

}

export function UploadFile(props: Props) {

    const clickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Создать URL для превью
        const url = URL.createObjectURL(file)
        /* setPreview(url) */
    }

    return (
        <div className='bg-[rgba(120,150,153,1)] rounded-2xl p-[10px]'>
            <div className='text-[30px] font-light text-center'>change your profile photo.</div>
            <div className={cn(
                'bg-[rgba(217,217,217,1)] rounded-2xl w-full h-[50px] flex items-center justify-center',
                'font-light text-[18px] mt-[20px] hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer'
            )} onChange={clickUpload}>upload the file:</div>
        </div>
    )
}