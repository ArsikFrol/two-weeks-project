import { cn } from "@/lib/utils"
import { City } from "@/types/city"

type Props = {
    obj: City,

    clickCity: (slug: string, name: string) => void
}

export function Elem({ obj, clickCity }: Props) {
    return (
        <div className={cn(
            "text-[18px] flex justify-between items-center py-[5px]",
            'hover:scale-101 transition-transform duration-300 cursor-pointer'
        )} onClick={() => clickCity(obj.slug, obj.name)}>
            <div className='text-white'>{obj.name}</div>
            <div className='text-white/50'>{obj.countPlaces}</div>
        </div>
    )
}