import { useRef, useState, useEffect, useContext, forwardRef, useImperativeHandle } from "react"
import Cell from "./Cell"

import type { celdaProps, contenido, objetoCelda } from "./Cell"
import { contextoCeldaActualizada, contextoExcel } from "../../Secciones/Equipos"

type apt = 1 | 2 | 3

const mensajes = {
    'false': 'El conductor está apto para conducir',
    'true': 'El conductor no está apto para conducir.',
    '1': 'El kilometraje es ílogico.',
    '2': 'El kilometraje es mayor al kilometraje de la próxima mantención'
}

export type aptoTp = {

    setApto: (val: apt) => void
}

export default forwardRef<aptoTp, celdaProps>(({ dato, celdasRf }, ref) => {
    const celda = useRef<objetoCelda | null>(null)

    const actualizacionExcel = useContext(contextoExcel)
    const celdaActualizada = useContext(contextoCeldaActualizada)

    const [apto, setApto] = useState<apt>(3)

    useImperativeHandle(ref, () => ({
        setApto: (val) => {
            setApto(val)
        }
    }))

    useEffect(() => {

        setApto(dato === 'false' ? 1 : 3)
    }, [dato, actualizacionExcel])

    useEffect(() => {
        celda.current?.bgColor(`${apto === 3 ? 'bg-red-500' : apto === 2 ? 'bg-yellow-500' : 'bg-green-500'}`)

    }, [apto])

    useEffect(() => {
        const validado: contenido = celdasRf?.current[`Validacion_h_0`].current?.obtenerDato()

        if (validado) {
            setApto(2)
        } else {
            setApto(dato === 'false' ? 1 : 3)
        }
    }, [celdaActualizada?.[0], dato])


    return <Cell popOutFuncion={(popout) => {
        popout?.cambiarContenido(<>
            {<p className={`
                ${apto == 1 ? 'text-green-500' : apto === 3 ? 'text-red-500' : 'text-yellow-500'}
            `}>{apto === 2 ? 'El checklist tuvo puntos negativos, pero fue validado.' : dato && mensajes.hasOwnProperty(dato) ? mensajes[dato] : ''}</p>}

        </>)
    }} ref={celda} />
})