import { create } from "zustand";

import { UsePlaces } from "./types";
import { Place } from "@/types/place";

export const usePlaces = create<UsePlaces>((set) => ({
    listPlaces: [],

    setPlaces: (value: Place[]) => set({ listPlaces: value })
}))