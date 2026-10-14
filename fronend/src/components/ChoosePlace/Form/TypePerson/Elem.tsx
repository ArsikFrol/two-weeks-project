import { cn } from "@/lib/utils"
import { Person, PersonSlug } from "../types"

type Props = {
    obj: Person,
    activePerson: PersonSlug,

    clickPerson: (slug: PersonSlug) => void
}

export function Elem({ obj, activePerson, clickPerson }: Props) {
    return (
        <div className={cn(
            'py-[10px] px-[20px] rounded-2xl w-fit',
            'hover:scale-101 transition-[transform,text,font,border] duration-300 cursor-pointer',
            activePerson === obj.slug
                ? 'shadow border border-gray-400 text-[20px] font-medium'
                : 'text-[18px]'
        )} style={{
            background: obj.bgColor,
            color: obj.colorText
        }} onClick={() => clickPerson(obj.slug as PersonSlug)}>{obj.name}</div>
    )
}