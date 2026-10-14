'use client'

import useEmblaCarousel from "embla-carousel-react"
import Image, { StaticImageData } from "next/image"
import Autoplay from "embla-carousel-autoplay"

import place from '../../../../public/place.jpg'

type Props = {
    images: StaticImageData[] | string[],
    interval?: number
}

export default function Carousel({ images, interval = 3000 }: Props) {

    const [emblaRef] = useEmblaCarousel(
        { loop: true },
        [Autoplay({
            delay: interval,
            stopOnInteraction: false
        })]
    )

    return (
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
                {images.map((img, i) => (
                    <div key={i} className="flex-[0_0_100%] min-w-0">
                        <Image src={place} alt="" draggable="false" className="w-[500px] h-[300px] object-cover rounded-2xl" />
                    </div>
                ))}
            </div>
        </div>
    )
}