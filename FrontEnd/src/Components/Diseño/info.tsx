import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react"
import type { bgColor, contenido } from "../Table/Cells/Cell"
import { contextoExcel } from "../Secciones/Equipos"

type popOutProps = {
    info?: contenido
}

type pos = {
    x: number,
    y: number
}

export type popOutObj = {
    cambiarPosicion: (pos: pos) => void
    cambiarContenido: (cont: contenido |React.ReactNode | null) => void
    cambiarBg: (bg: bgColor) => void
}

export default forwardRef<popOutObj, popOutProps>(({ info }, ref) => {

    const [visible, setVisible] = useState(false)
    const [bg, setBg] = useState<bgColor>('bg-black')
    const [contenidoV, setContenido] = useState<contenido | React.ReactNode | null>(info)
    const [pos, setPos] = useState<pos>({
        x: 0,
        y: 0
    })

    const excelActaulizado = useContext(contextoExcel)

    useImperativeHandle(ref, () => ({
        cambiarPosicion: (pos: pos) => {
            setVisible(true)
            //setPos(pos)
        },

        cambiarContenido: (cont: contenido | React.ReactNode) => {
            setContenido(cont)
        },
        cambiarBg: (bg: bgColor) => {
            setBg(bg)
        }
    }))

    useEffect(()=>{
        setContenido(null)
        setVisible(false)
    },[excelActaulizado])

    return <div className={`fixed  w-[100%] h-[100%]  flex justify-center items-center rounded-2xl p-2 z-150 pointer-events-none  ${visible ? 'block' : 'hidden'}`} style={
        {
            top: pos.y,
            left: pos.x,
        }
    }>
        <div onClick={() => {
            setVisible(false)
        }} className={`w-full pointer-events-auto text-center y-full overflow-y-auto border-2 rounded-2xl p-2 ${bg}`}>
            {contenidoV}
        </div>
    </div >
})