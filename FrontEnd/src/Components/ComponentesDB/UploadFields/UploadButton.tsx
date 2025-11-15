import axios from "axios";
import type { archivos, msg, setArchivos, setMsg } from "./UploadTypes";
import { backend } from "../../../utility/vars";
import { useEffect } from "react";

export default ({ msg, setMsg, archivos, setArchivos }: {
    msg: msg,
    setMsg: setMsg,
    setArchivos: setArchivos,
    archivos: archivos,
}) => {

    useEffect(() => {
        if (msg) {
            setTimeout(() => {
                setMsg(null)
            }, 1500);
        }
    }, [msg])

    return msg ? <p>{msg}</p> : < button className="w-1/2 mx-5 border-2 h-10 bg-green-500 mt-10" onClick={async () => {
        setMsg('Cargando...')

        if (Object.keys(archivos).length <= 0) { setMsg('Tiene que haber al menos un archivo para subir.'); return }

        const form = new FormData()

        Object.entries(archivos).forEach(([fieldName, file]) => {
            if (!file) return

            console.log(fieldName)

            form.append(fieldName, file)
        })

        try {
            const res = await axios.post(`${backend}/UploadExpeditor`, form, {
                headers: { "Content-Type": 'multipart/form-data' }
            })

            setMsg(res.data)
        } catch (e) {
            console.log(e)
            setMsg('Error al subir los archivos.')
        } finally {
            setArchivos({})
        }
    }}>
        Subir archivos
    </button>

}