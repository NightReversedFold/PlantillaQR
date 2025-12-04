import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react"

import type { contenido } from "./Cell"

import type { celdaProps } from "./Cell"
import { contextoCeldaActualizada } from "../../Secciones/Equipos"
import { contextoExcel } from "../../Secciones/Personas"

export type validacion = {
    obtenerDato: () => contenido
}

export default forwardRef<validacion, celdaProps>(({ dato }, ref) => {

    const [datoTe, setDatoTe] = useState<contenido>(dato)
    const celdaActualizada = useContext(contextoCeldaActualizada)
    const actualizacionExcel = useContext(contextoExcel)

    useImperativeHandle(ref, () => ({
        obtenerDato: () => {
            return datoTe
        }
    }))

    useEffect(() => {
        setDatoTe(dato)

    }, [dato,actualizacionExcel])

    useEffect(() => {
        celdaActualizada?.[1](datoTe)
    }, [datoTe])


    return <div className={`col-span-8 Relative w-full border-2 p-2 align-middle ${dato ? 'visible' : 'hidden'}`}>
        {dato}
    </div>
})