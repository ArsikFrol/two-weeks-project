import { listAtmosphere, listMeeting, listPerson } from "./constans"

export type Atmosphere = {
    slug: string,
    bgColor: string,
    colorText: string,
    text: string
}

export type AtmosphereSlug = (typeof listAtmosphere)[number]['slug'] | ''

export type Meeting = {
    slug: string,
    name: string,
    bgColor: string,
    colorText: string
}

export type MeetingSlug = (typeof listMeeting)[number]['slug'] | ''

export type Person = {
    name: string,
    slug: string,
    bgColor: string,
    colorText: string
}

export type PersonSlug = (typeof listPerson)[number]['slug'] | ''
