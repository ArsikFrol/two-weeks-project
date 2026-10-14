'use client'

import { DayPicker } from 'react-day-picker'
import { ru } from 'date-fns/locale'
import { format } from 'date-fns'
import { Controller, useFormContext } from 'react-hook-form'

import 'react-day-picker/dist/style.css'
import { PlaceFormSchema } from '@/lib/schemas'

export function Calendar() {

    const { control } = useFormContext<PlaceFormSchema>()


    return (
        <Controller
            control={control}
            name="date"
            render={({ field, fieldState }) => (
                <div className='bg-[rgba(239,192,177,1)] w-full h-[650px] rounded-b-2xl'>
                    <DayPicker
                        locale={ru}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        showOutsideDays
                        disabled={{ before: new Date() }}
                        className="bg-[#E8EDD8] rounded-[24px] p-[30px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-fit mx-auto mt-[100px]"
                        classNames={{
                            months: 'flex flex-col',
                            month: 'space-y-[20px]',

                            nav: 'hidden',
                            month_caption: 'flex justify-start pt-[10px]',
                            caption_label: 'text-[20px] text-[#5C4A3A] font-light text-center w-full',

                            month_grid: 'w-full border-collapse',
                            weekdays: 'flex',
                            weekday: 'text-[#5C4A3A] text-[16px] font-medium w-[50px] h-[50px] flex items-center justify-center',
                            week: 'flex w-full',

                            day: 'w-[50px] h-[50px] flex items-center justify-center',
                            day_button: 'w-[38px] h-[38px] rounded-full text-[16px] font-light cursor-pointer transition-colors hover:bg-[#3D2E24]/5',

                            selected: 'bg-[#3D2E24] rounded-2xl text-[#ffffff] hover:bg-[#3D2E24] font-normal',
                            today: 'font-bold text-[#3D2E24]',
                            disabled: 'text-[#D0D0C0] cursor-not-allowed',

                            footer: 'text-center text-[14px] text-[#5C4A3A] mt-[15px] pt-[15px] border-t border-[#5C4A3A]/20',
                        }}
                        footer={
                            field.value
                                ? (
                                    <div className="text-[20px]">
                                        Выбрано: {format(field.value, 'd MMMM yyyy', { locale: ru })}
                                    </div>
                                )
                                : fieldState.error
                                    ? <p className="text-red-500 text-[16px] text-center">{fieldState.error.message}</p>
                                    : <div className='text-[16px]'>Выберите дату</div>
                        }
                    />
                </div>
            )}
        />
    )
}