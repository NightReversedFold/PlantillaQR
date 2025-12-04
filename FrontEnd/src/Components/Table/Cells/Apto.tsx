import { useRef, useState, useEffect, useContext, forwardRef, useImperativeHandle } from "react"
import Cell from "./Cell"

import type { celdaProps, contenido, objetoCelda } from "./Cell"
import { contextoCeldaActualizada, contextoExcel } from "../../Secciones/Equipos"

type apt = 1 | 2 | 3

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
            {apto === 1 ?
                < p className="text-green-500">El conductor está apto para conducir.</p > : apto === 3 ?
                    <p className="text-red-500">El conductor no está apto para conducir.</p> :
                    <p className="text-yellow-500">
                        El checklist tuvo puntos negativos, pero fue validado.
                    </p>}

        </>)
    }} ref={celda} />
})