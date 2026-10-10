import Image from "next/image";
import { Form } from "./Form";

import google from '../../../public/google.png'
import { cn } from "@/lib/utils";

export function SingIn() {
    return (
        <div className='w-[830px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
            <div className="flex items-center gap-x-[50px]">
                <div className='text-white text-[30px] w-[380px]'>
                    AI will find a place,
                    the calendar will remember the date,
                    people will find each other.
                    Everything is simple.
                    T-A-T
                </div>
                <div className='bg-[rgba(232,235,215,1)] rounded-4xl p-[20px] w-[400px]'>
                    <div className='text-[18px] font-medium text-center'>Create an account</div>
                    <div className='text-gray-700 text-center'>Enter your email to sign up for this app</div>
                    <Form />
                    <div className='flex items-center gap-x-[10px] my-[20px]'>
                        <div className='h-[1px] w-full bg-gray-300'></div>
                        <div className='flex-shrink-0 text-[14px] text-gray-500'>or continue with</div>
                        <div className='h-[1px] w-full bg-gray-300'></div>
                    </div>
                    <div className={cn(
                        'relative flex items-center gap-x-[20px] bg-gray-400 py-[10px] px-[20px] rounded-2xl',
                        'hover:translate-y-[2px] transition-transform duration-300 cursor-pointer'
                    )}>
                        <Image src={google} alt='' draggable='false' className="absolute left-[20px] top-[10px] w-[20px] h-[20px]" />
                        <div className='text-white w-full text-center'>Google</div>
                    </div>
                    <div className='text-[14px] text-center mt-[20px]'>
                        By clicking continue, you agree to our Terms of Service and Privacy Policy
                    </div>
                </div>
            </div>
        </div>
    )
}