import { Place } from "@/types/place"
import Carousel from "./Carousel"
import { RatingStars } from "./RatingStars"

type Props = {
    obj: Place
}

export function Elem({ obj }: Props) {
    return (
        <div className="w-full bg-white rounded-2xl shadow p-[20px] flex gap-x-[40px]">
            <div className='w-[520px]'>
                <Carousel images={obj.images} />
            </div>
            <div className='w-[1020px] flex flex-col justify-between'>
                <div className=''>
                    <div className='text-[40px] font-light'>{obj.name}</div>
                    <div className='flex items-center gap-x-[10px]'>
                        <div className='text-[20px] font-light'>Адрес:</div>
                        <div className='text-[25px] font-light'>{obj.address}</div>
                    </div>
                    <RatingStars rating={obj.rating} />
                </div>
                <div className='text-[18px] font-light'>{obj.description}</div>
            </div>
        </div>
    )
}