import { useRef, useContext, useEffect, useState } from "react"
import Cell from "./Cell"

import type { objetoCelda } from "./Cell"

import type { celdaProps } from "./Cell"
import { contextoExcel } from "../../Secciones/Equipos"

export default ({ dato }: celdaProps) => {
    const celda = useRef<objetoCelda | null>(null)
    const actualizacionExcel = useContext(contextoExcel)

    const [horaEnvio, setHoraEnvio] = useState(dato ? dato.split('.')[0] : 'Sin hora de envio.')

    useEffect(() => {
        console.log(dato,'HORA DE ENVIO')
        setHoraEnvio(dato ? dato.split('.')[0] : 'Sin hora de envio.')

    }, [dato, actualizacionExcel])

    useEffect(() => {
        celda.current?.textColor(horaEnvio == 'Sin hora de envio.' ? 'text-yellow-500' : 'text-white')
    }, [horaEnvio])

    return <Cell dato={horaEnvio} ref={celda} />
}