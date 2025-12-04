import { useState } from "react"
import UploadField from "./UploadField"

import UploadButton from "./UploadButton"
import DeleteTbBt from "./DeleteTbBt"
import CxLogo from "../../Diseño/CxLogo"

export default () => {
    const [archivos, setArchivos] = useState<Record<string, File>>({})
    const [msg, setMsg] = useState<string | null>(null)

    const uploadHandlerPersonal = (e: React.ChangeEvent<HTMLInputElement>, faena: string | undefined) => {
        if (!faena) { return }

        const selected = e.target.files?.[0]
        console.log(selected?.name)
        if (selected && selected.name.endsWith('.xlsx')) {
            setArchivos(files => {
                return { ...files, [`${faena}Personal`]: selected }
            })
        }

    }
    return <div className="bg-[#070707]  h-[100vh] flex flex-col items-center p-2 text-white text-center" >
        <CxLogo />

        <h2 className="text-3xl mb-5">Subir archivos</h2>
        <div className="flex flex-row bg-[#070707] items-center justify-center ">
            <div className="w-[90%]  flex flex-col justify-center items-center gap-y-5 p-3">

                <h2 className="text-2xl">Personal</h2>

                <UploadField archivos={archivos} uploadHandler={uploadHandlerPersonal} textoAMostrar={`Subir excel de personal DGM`} faena="DGM" />
                <UploadField archivos={archivos} uploadHandler={uploadHandlerPersonal} textoAMostrar={`Subir excel de personal DCH`} faena="DCH" />
                <UploadField archivos={archivos} uploadHandler={uploadHandlerPersonal} textoAMostrar={`Subir excel de personal DMH`} faena="DMH" />
                <UploadField archivos={archivos} uploadHandler={uploadHandlerPersonal} textoAMostrar={`Subir excel de personal DRT`} faena="DRT" />

            </div>
        </div>

        <UploadButton archivos={archivos} msg={msg} setArchivos={setArchivos} setMsg={setMsg} />
        <DeleteTbBt tb="Personal" />

    </div>
}