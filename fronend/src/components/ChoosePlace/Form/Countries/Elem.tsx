import { cn } from "@/lib/utils"
import { Country } from "@/types/country"

type Props = {
    obj: Country,

    clickCountry: (slug: string, name: string) => void
}

export function Elem({ obj, clickCountry }: Props) {
    return (
        <div className={cn(
            "text-[18px] flex justify-between items-center py-[5px]",
            'hover:scale-101 transition-transform duration-300 cursor-pointer'
        )} onClick={() => clickCountry(obj.slug, obj.name)}>
            <div className='text-white'>{obj.name}</div>
            <div className='text-white/50'>{obj.countPlaces}</div>
        </div>
    )
}