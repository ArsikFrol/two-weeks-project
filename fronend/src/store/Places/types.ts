import { Place } from "@/types/place"

export type UsePlaces = {
    listPlaces: Place[],

    setPlaces: (value: Place[]) => void
}