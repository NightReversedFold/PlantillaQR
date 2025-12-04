import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react"
import type { bgColor, contenido } from "../Table/Cells/Cell"
import { contextoExcel } from "../Secciones/Equipos"

type popOutProps = {
    info?: contenido
}

export type popOutObj = {
    cambiarContenido: (cont: contenido |React.ReactNode | null) => void
    cambiarBg: (bg: bgColor) => void,
    visibilidad:(val:boolean)=>void
}

export default forwardRef<popOutObj, popOutProps>(({ info }, ref) => {

    const [visible, setVisible] = useState(false)
    const [bg, setBg] = useState<bgColor>('bg-black')
    const [contenidoV, setContenido] = useState<contenido | React.ReactNode | null>(info)

    const excelActaulizado = useContext(contextoExcel)

    useImperativeHandle(ref, () => ({

        cambiarContenido: (cont: contenido | React.ReactNode) => {
            setVisible(true)
            setContenido(cont)
        },
        cambiarBg: (bg: bgColor) => {
            setBg(bg)
        },
        visibilidad:(val)=>{
            setVisible(val)
        }
    }))

    useEffect(()=>{
        setContenido(null)
        setVisible(false)
    },[excelActaulizado])

    return <div className={`top-0 left-0 fixed  w-[100%] h-[100%]  flex justify-center items-center rounded-2xl p-2 z-150 pointer-events-none  ${visible ? 'block' : 'hidden'}`}>
        <div onClick={() => {
            setVisible(false)
        }} className={`w-full pointer-events-auto text-center y-full overflow-y-auto border-2 rounded-2xl p-2 ${bg}`}>
            {contenidoV}
        </div>
    </div >
})