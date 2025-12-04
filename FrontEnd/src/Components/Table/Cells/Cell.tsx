import { useImperativeHandle, forwardRef, useContext, useState, useEffect } from "react"
import type { popOutObj } from "../../Diseño/info"

export type celdaProps = {
    dato?: string,
    indx?: number,
    celdasRf?:React.RefObject<celdasObj>,
    cabecera?: boolean,
    popOutFuncion?: (fun: popOutObj | null) => void
}
import { contextoCeldaActualizada, contextoExcel, contextoPopout } from "../../Secciones/Equipos"
import { contextoPopoutPersonal } from "../../Secciones/Personas"
import type { celdasObj } from "../Table"

export type bgColor = `bg-${string}`
export type textColor = `text-${string}`
export type contenido = string | undefined | null

export type objetoCelda = {
    bgColor: (color: bgColor) => void
    textColor: (color: textColor) => void
    contenido: (contenido: contenido) => void
    obtenerContenido: () => contenido,
    cambiarContenidoConFuncion: (callback: (ultValor: contenido) => string) => void
}

export default forwardRef<objetoCelda, celdaProps>(({ dato, cabecera, popOutFuncion }, ref) => {
    const [contenido, setContenido] = useState<contenido>(typeof dato === 'string' ? dato != '' ? dato.trim() : 'Sin dato.' : null)
    const actualizacionExcel = useContext(contextoExcel)

    const celdaActualizada = useContext(contextoCeldaActualizada)
    const popoutGlobal = useContext(contextoPopout)
    const popoutPersonal = useContext(contextoPopoutPersonal)
    const popout = popoutGlobal || popoutPersonal

    const [color, setColor] = useState<textColor>('text-white')
    const [bgColor, setBgColor] = useState<bgColor | null>(null)

    useImperativeHandle(ref, () => ({
        bgColor: (color) => {
            setBgColor(color)
        },
        textColor: (color) => {
            setColor(color)
        },
        contenido: (contenido) => {
            setContenido(contenido)
            celdaActualizada?.[1](contenido)

        },
        cambiarContenidoConFuncion: (callback) => {
            setContenido(ultimoValor => callback(ultimoValor))
        },
        obtenerContenido: () => {
            return contenido
        }
    }))

    useEffect(() => {

        setContenido(typeof dato === 'string' ? dato != '' && dato !== 'undefined' ? dato.trim() : 'Sin dato.' : null)

        celdaActualizada?.[1](contenido)

    }, [dato, actualizacionExcel])

    return <div onClick={() => {
        popout?.cambiarContenido(contenido)

        popOutFuncion?.(popout)

        popout?.visibilidad(true)
    }} className={`${cabecera ? 'Header border-2 p-2 bg-[#0c0c0e]' : 'min-h-30'} Relative w-full ${bgColor} border-2 p-2 align-middle ${contenido === 'Sin dato.' ? 'text-red-400' : contenido !== 'Sin dato.' && contenido ? color : null}`} >
        {contenido}
    </div>
})