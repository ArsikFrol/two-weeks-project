import { cn } from "@/lib/utils"
import { Atmosphere, AtmosphereSlug } from "../types"

type Props = {
    obj: Atmosphere,
    activeAtmosphere: AtmosphereSlug,

    clickAtmosphere: (slug: AtmosphereSlug) => void
}

export function Elem({ obj, activeAtmosphere, clickAtmosphere }: Props) {
    return (
        <div className={cn(
            'py-[10px] px-[20px] rounded-2xl w-fit',
            'hover:scale-101 transition-[transform,text,font,border] duration-300 cursor-pointer',
            activeAtmosphere === obj.slug
                ? 'shadow border border-gray-400 text-[20px] font-medium'
                : 'text-[18px]'
        )} style={{
            background: obj.bgColor,
            color: obj.colorText
        }} onClick={() => clickAtmosphere(obj.slug as AtmosphereSlug)}>{obj.text}</div>
    )
}