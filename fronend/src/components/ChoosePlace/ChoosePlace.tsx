'use client'

import { placeFormSchema, PlaceFormSchema } from "@/lib/schemas";
import { Calendar } from "./Calendar/Calendar";
import { Form } from "./Form/Form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


export function ChoosePlace() {

    const methods = useForm<PlaceFormSchema>({
        resolver: zodResolver(placeFormSchema),
        mode: 'onTouched',
        defaultValues: {
            firstName: '',
            lastName: '',
            country: '',
            city: '',
            min: 0,
            max: 1000,
            date: undefined,
            time: '',
            atmosphere: '',
            person: '',
            metting: '',
        },
    })

    return (
        <FormProvider {...methods}>
            <div className="w-[1580px] mx-auto grid grid-cols-2 gap-x-[50px]">
                <Form />
                <Calendar />
            </div>
        </FormProvider>
    )
}