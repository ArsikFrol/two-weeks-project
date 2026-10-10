import { cn } from "@/lib/utils"
import { Meeting, TypeMeeting } from "./TypeMeeting"

type Props = {
    clickMeeting: (type: TypeMeeting) => void,
    activeMeeting: TypeMeeting,
    obj: Meeting
}

export function Elem({ activeMeeting, clickMeeting, obj }: Props) {
    return (
        <div className={cn(
            'py-[10px] px-[20px] rounded-2xl',
            'hover:scale-101 transition-[transform,text,font,border] duration-300 cursor-pointer',
            activeMeeting === obj.type
                ? 'shadow border border-gray-400 text-[20px] font-medium'
                : 'text-[18px]'
        )} style={{
            background: obj.bgColor,
            color: obj.colorText
        }}
            onClick={() => clickMeeting(obj.type as TypeMeeting)}>
            {obj.name}
        </div>
    )
}