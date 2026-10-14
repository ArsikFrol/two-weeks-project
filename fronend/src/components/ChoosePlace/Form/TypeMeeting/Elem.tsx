import { cn } from "@/lib/utils"
import { Meeting, MeetingSlug } from "../types"

type Props = {
    obj: Meeting,
    activeMeeting: MeetingSlug

    clickMeeting: (slug: MeetingSlug) => void
}

export function Elem({ obj, activeMeeting, clickMeeting }: Props) {
    return (
        <div className={cn(
            'py-[10px] px-[20px] rounded-2xl w-fit',
            'hover:scale-101 transition-[transform,text,font,border] duration-300 cursor-pointer',
            activeMeeting === obj.slug
                ? 'shadow border border-gray-400 text-[20px] font-medium'
                : 'text-[18px]'
        )} style={{
            background: obj.bgColor,
            color: obj.colorText
        }} onClick={() => clickMeeting(obj.slug as MeetingSlug)}>{obj.name}</div>
    )
}