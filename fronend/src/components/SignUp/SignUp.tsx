import Image from "next/image";
import { Services } from "../SignIn/Services";
import { Form } from "./Form";
import { cn } from "@/lib/utils";

import bubbles1 from '../../../public/bubbles1.png'

export function SignUp() {
    return (
        <div className="bg-[rgba(164,188,188,1)] h-[calc(100vh-77px)] flex items-center justify-center overflow-hidden">
            <div className={cn(
                'relative bg-[rgba(232,235,215,1)] rounded-4xl p-[20px] w-[400px]'
            )}>
                <div className='text-[18px] font-medium text-center'>Sign up to the account</div>
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
                <Image src={bubbles1} alt='' draggable='false' className="absolute right-[-200px] top-0" />
                <Image src={bubbles1} alt='' draggable='false' className="absolute left-[-250px] bottom-[100px] rotate-45" />
                <Image src={bubbles1} alt='' draggable='false' className="absolute right-[-250px] bottom-[0px] rotate-90" />
            </div>
        </div>
    )
}