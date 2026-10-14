import Image from "next/image";

import { Form } from "./Form";
import { Services } from "./Services";

import bg from '../../../public/bg.png'
import cloud from '../../../public/cloud.png'
import { cn } from "@/lib/utils";

export function SignIn() {
    return (
        <div className='relative w-full h-[calc(100vh-77px)] overflow-hidden'>
            <Image src={bg} alt='' draggable='false' className="absolute right-[-10px] top-[-80px]" />
            <Image src={cloud} alt='' draggable='false' className="absolute bottom-[80px] left-[60px]" />
            <div className='w-[1050px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <div className="flex items-center gap-x-[50px]">
                    <div className='relative w-[550px] h-[420px]'>
                        <div className='z-10 relative bg-[rgba(232,235,215,1)] rounded-[50px] p-[20px] text-center'>
                            <div className='text-[30px] font-light text-[rgba(59,80,139,1)]'>
                                AI will find a place,
                                the calendar will remember the date,
                                people will find each other.
                                Everything is simple.
                            </div>
                            <div className='text-[64px] text-[rgba(59,80,139,1)]'>T-A-T</div>
                        </div>
                        <div className={cn(
                            'z-0 bg-[rgba(228,170,169,1)] rounded-b-2xl text-center font-light px-[20px] pb-[20px] text-[24px] text-white',
                            'pt-[50px]',
                            'absolute bottom-[0px] left-0'
                        )}>
                            Schedule a meeting by choosing a date and time, and the AI will help you find a great location and topics for conversation.
                        </div>
                    </div>
                    <div className='bg-[rgba(232,235,215,1)] rounded-4xl p-[20px] w-[400px]'>
                        <div className='text-[18px] font-medium text-center'>Sign in to the account</div>
                        <div className='text-gray-700 text-center'>Enter your email to sign up for this app</div>
                        <Form />
                        <div className='flex items-center gap-x-[10px] my-[20px]'>
                            <div className='h-[1px] w-full bg-gray-300'></div>
                            <div className='flex-shrink-0 text-[14px] text-gray-500'>or continue with</div>
                            <div className='h-[1px] w-full bg-gray-300'></div>
                        </div>
                        <Services />
                        <div className='text-[14px] text-center mt-[20px]'>
                            By clicking continue, you agree to our Terms of Service and Privacy Policy
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}