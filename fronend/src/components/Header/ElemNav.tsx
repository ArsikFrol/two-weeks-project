import { cn } from "@/lib/utils"
import { Nav } from "./Header"
import { TypeRoutes } from "@/hooks/useTypedRouter"

type Props = {
    obj: Nav
    page: string

    clickNav: (link: TypeRoutes) => void
}

export function ElemNav({ obj, clickNav, page }: Props) {
    return (
        <div onClick={() => clickNav(obj.link)} className={cn(
            "text-[18px] px-[30px] py-[10px]",
            page === obj.link
                ? 'bg-[rgba(164,188,188,1)] rounded-2xl'
                : 'hover:translate-y-[-2px] transition-transform duration-300 cursor-pointer'
        )}>
            {obj.text}
        </div>
    )
}