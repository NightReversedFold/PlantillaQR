
import { useState } from "react"
import UploadField from "./UploadField"

import UploadButton from "./UploadButton"
import DeleteTbBt from "./DeleteTbBt"
import CxLogo from "../../Diseño/CxLogo"

export default () => {
    const [archivos, setArchivos] = useState<Record<string, File>>({})
    const [msg, setMsg] = useState<string | null>(null)



    const uploadHanlderTaller = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        console.log(selected?.name)
        if (selected && selected.name.endsWith('.xlsx')) {
            setArchivos(files => {
                return { ...files, 'Taller': selected }
            })
        }

    }

    return <div className="bg-[#070707] h-[100vh] flex flex-col items-center justify-center p-2 text-white text-center" >
        <CxLogo />

        <h2 className="text-3xl mb-5">Subir archivos</h2>
        <div className="flex flex-row bg-[#070707] items-center justify-center ">
            <div className="w-[90%]  flex flex-col justify-center items-center gap-y-5 p-3">

                <div className="w-[90%] flex flex-col justify-center items-center gap-y-5 p-3">
                    <h2 className="text-2xl">Taller</h2>

                    <UploadField archivos={archivos} uploadHandler={uploadHanlderTaller} textoAMostrar="Subir excel taller" />
                </div>

            </div>
        </div>

        <UploadButton archivos={archivos} msg={msg} setArchivos={setArchivos} setMsg={setMsg} />
        <DeleteTbBt tb="Taller" />

    </div>
}