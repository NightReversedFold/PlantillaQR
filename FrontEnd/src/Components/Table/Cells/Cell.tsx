import { useImperativeHandle, forwardRef, useContext, useState, useEffect } from "react"

export type celdaProps = {
    dato?: string,
}
import { contextoExcel } from "../../Secciones/Equipos"

type bgColor = `bg-${string}`
type textColor = `text-${string}`
type contenido = string | undefined | null

export type objetoCelda = {
    bgColor: (color: bgColor) => void
    textColor: (color: textColor) => void
    contenido: (contenido: contenido) => void
}

export default forwardRef<objetoCelda, celdaProps>(({ dato }, ref) => {
    const [contenido, setContenido] = useState<contenido>(typeof dato === 'string' ? dato != '' ? dato.trim() : 'Sin dato.' : null)
    const actualizacionExcel = useContext(contextoExcel)

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
        }
    }))

    useEffect(() => {
        setContenido(typeof dato === 'string' ? dato != '' ? dato.trim() : 'Sin dato.' : null)
    }, [dato,actualizacionExcel])

    return <div className={`Value w-full ${bgColor} min-h-20 border-2 p-2 align-middle ${contenido === 'Sin dato.' ? 'text-red-400' : contenido !== 'Sin dato.' && contenido ? color : null}`} >
        {contenido}
    </div>
})