import { ClipLoaderUI } from "@/components/UI/ClipLoader";

export default function page() {
    return (
        <div className="h-[calc(100vh-77px)] bg-[rgba(164,188,188,1)] flex items-center justify-center">
            <div className='text-[40px] font-light mb-[200px]'>Страница находится в разработке</div>
            <ClipLoaderUI />
        </div>
    )
}