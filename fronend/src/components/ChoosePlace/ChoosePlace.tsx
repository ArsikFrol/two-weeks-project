'use client'

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { placeFormSchema, PlaceFormSchema } from "@/lib/schemas";
import { Form } from "./Form/Form";
import { Modal } from "./Modal/Modal";
import { Calendar } from "./Calendar";


export function ChoosePlace() {

    const [data, setData] = useState<PlaceFormSchema>()
    const [showModal, setShowModal] = useState<boolean>(false)

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
            meeting: '',
        },
    })

    return (
        <>
            <FormProvider {...methods}>
                <div className="w-[1580px] mx-auto grid grid-cols-2 gap-x-[50px]">
                    <Form setData={setData} setShowModal={setShowModal} />
                    <Calendar />
                </div>
            </FormProvider>
            {showModal &&
                <Modal data={data!} setShowModal={setShowModal} />
            }
        </>
    )
}