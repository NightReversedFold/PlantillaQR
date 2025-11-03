import { useEffect, useRef } from "react"

const UploadField = ({ faena, archivos, uploadHandler, textoAMostrar }: {
    faena?: string,
    archivos: Record<string, File>
    uploadHandler: (e: React.ChangeEvent<HTMLInputElement>, faena: string | undefined) => void,
    textoAMostrar: string
}) => {
    const val = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (val.current && Object.keys(archivos).length <= 0) {
            val.current.value = ''
        }
    }, [archivos])

    return <div className="flex flex-col text-center">
        <p>
            {textoAMostrar}
        </p>

        <input ref={val} type="file"
            accept=".xlsx"
            onChange={(e) => { uploadHandler(e, faena) }} className="w-[100%] h-15 bg-slate-700 text-center border-2 align-middle p-2" />

    </div>
}

export default UploadField