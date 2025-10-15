import { useRef, useContext, useEffect, useState } from "react"
import Cell from "./Cell"

import type { objetoCelda } from "./Cell"

import type { celdaProps } from "./Cell"
import { contextoExcel } from "../../Secciones/Equipos"

export default ({ dato }: celdaProps) => {
    const celda = useRef<objetoCelda | null>(null)
    const actualizacionExcel = useContext(contextoExcel)


    const [observaciones, setObservaciones] = useState(typeof dato?.trim() === 'string' && dato?.trim() != '' ? dato : 'Sin observaciones.')

    useEffect(() => {
        if (dato) {
            setObservaciones(dato)
        }

        celda.current?.textColor(observaciones == 'Sin observaciones.' ? 'text-green-500' : 'text-yellow-500')
    }, [dato, actualizacionExcel])

    return <Cell dato={observaciones} ref={celda} />
}