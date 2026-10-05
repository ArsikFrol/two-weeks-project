import { cn } from "@/lib/utils"
import { MeetingHuman, TypeMeetingHuman } from "./MeetingBeWith"

type Props = {
    obj: MeetingHuman,
    activeHuman: TypeMeetingHuman,
    clickHuman: (type: TypeMeetingHuman) => void
}

export function Elem({ obj, activeHuman, clickHuman }: Props) {
    return (
        <div className={cn(
            'py-[10px] px-[20px] rounded-2xl',
            'hover:scale-101 transition-[transform,text,font,border] duration-300 cursor-pointer',
            activeHuman === obj.type
                ? 'shadow border border-gray-400 text-[20px] font-medium'
                : 'text-[18px]'
        )} style={{
            background: obj.bgColor,
            color: obj.colorText
        }}
            onClick={() => clickHuman(obj.type as TypeMeetingHuman)}>
            {obj.name}
        </div>
    )
}