import { Star } from 'lucide-react'

const StarItem = ({ fillPercent }: { fillPercent: number }) => {
    const id = `star-${Math.random().toString(36).slice(2)}`

    return (
        <div className='relative'>
            <Star size={25} strokeWidth={1.5} color='#D1D5DB' fill='none' />
            <div className='absolute inset-0 overflow-hidden'
                style={{ width: `${fillPercent}%` }} >
                <Star size={25} strokeWidth={1.5} color='#FACC15' fill='#FACC15' />
            </div>
        </div>
    )
}

export const RatingStars = ({ rating }: { rating: number }) => {
    return (
        <div className='flex items-center gap-x-[2px] my-[20px]'>
            {Array.from({ length: 5 }, (_, i) => {
                const fillPercent = Math.max(0, Math.min(1, rating - i)) * 100
                return <StarItem key={i} fillPercent={fillPercent} />
            })}
        </div>
    )
}