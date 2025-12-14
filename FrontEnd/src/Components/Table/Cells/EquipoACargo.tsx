import { useRef, useState, useEffect } from "react"
import Cell from "./Cell"

import type { celdaProps, objetoCelda } from "./Cell"

export default ({ dato }: celdaProps) => {
    const celda = useRef<objetoCelda | null>(null)

    const [equipoACargo, setEquipoACargo] = useState<string | null>(null)

    useEffect(() => {
        console.log(equipoACargo, dato)
        if (!dato?.trim() || dato?.trim() == '') {
            setEquipoACargo(null)
        } else {

            setEquipoACargo(dato)
        }
    }, [dato])

    useEffect(() => {
        if (equipoACargo) {
            celda.current?.contenido(equipoACargo)
           // celda.current?.bgColor('bg-green')

        } else {
            celda.current?.contenido('Sin equipo a cargo.')
            //celda.current?.bgColor('bg-white')

        }

    }, [equipoACargo])

    return <Cell popOutFuncion={(popout) => {
        popout?.cambiarContenido(<>
            {equipoACargo ?
                <p className="text-green-500">Equipo a cargo: {equipoACargo}.</p> :
                <p className="text-yellow-500">Sin equipo a cargo.</p>}
        </>)
    }} ref={celda} />
}