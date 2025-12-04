import { useRef, useState, forwardRef, useImperativeHandle, useEffect, useContext } from "react"
import Cell from "./Cell"

import type { objetoCelda } from "./Cell"
import type { celdasObj } from "../Table"
import { contextoCeldaActualizada } from "../../Secciones/Equipos"

type objAcreditado = {
    AcreditarA: (valor: number) => void
    ObtenerNmAcreditacion: () => number
}

export default forwardRef<objAcreditado>(({
    celdasRf,
    fila
}: {
    celdasRf?: celdasObj,
    fila?: number
}, ref) => {
    const celda = useRef<objetoCelda | null>(null)

    const [acreditado, setAcreditado] = useState(0)

    const celdaActualizada = useContext(contextoCeldaActualizada)

    useImperativeHandle(ref, () => ({
        AcreditarA: (valor: number) => {
            setAcreditado(valor)
        },
        ObtenerNmAcreditacion: () => {
            return acreditado
        }
    }))

    useEffect(() => {
        //  celda.current?.bgColor(`${acreditado === 2 ? 'bg-red-500' : acreditado === 1 ? 'bg-yellow-500' : 'bg-green-500'}`)
        const FRExpiracion: number = celdasRf?.current[`FechaRevisionTecnica_${fila}`].current?.ObtenerExpirado()
        const FPexpiracion: number = celdasRf?.current[`FechaPermisoCirculacion_${fila}`].current?.ObtenerExpirado()

        if (!isNaN(FRExpiracion) && !isNaN(FPexpiracion)) {
            console.log(FRExpiracion,FPexpiracion)
            if (FRExpiracion == 2 || FPexpiracion == 2) {
                console.log('ÉXPIRADOOOOOOO')
                setAcreditado(2)
                return
            }

            if (FRExpiracion == 1 || FPexpiracion == 1) {
                setAcreditado(1)

                return
            }

            setAcreditado(0)
        }

    }, [celdaActualizada?.[0]])

    useEffect(() => {
        celda.current?.bgColor(`${acreditado === 2 ? 'bg-red-500' : acreditado === 1 ? 'bg-yellow-500' : 'bg-green-500'}`)
    }, [acreditado])

    return <Cell popOutFuncion={(popout) => {
        popout?.cambiarContenido(<>
            {acreditado === 2 ?
                <p className="text-red-500">Expirado.</p> :
                acreditado === 1 ? <p className="text-yellow-500">A punto de expirar.</p>
                    : <p className="text-green-500">Vigentes.</p>}
        </>)
    }} ref={celda} />
})