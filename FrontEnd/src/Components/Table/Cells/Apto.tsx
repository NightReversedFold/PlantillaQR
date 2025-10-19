import { useRef, useState, useEffect, useContext } from "react"
import Cell from "./Cell"

import type { celdaProps, objetoCelda } from "./Cell"
import { contextoExcel } from "../../Secciones/Equipos"


export default ({ dato }: celdaProps) => {
    const celda = useRef<objetoCelda | null>(null)

    const actualizacionExcel = useContext(contextoExcel)

    const [apto, setApto] = useState(false)

    useEffect(() => {
        console.log(dato)
        setApto((dato?.toLowerCase() == 'false'))
    }, [dato, actualizacionExcel])

    useEffect(() => {
        celda.current?.bgColor(`${apto ? 'bg-green-500' : 'bg-red-500'}`)

    }, [apto])

    return <Cell popOutFuncion={(popout) => {
        popout?.cambiarContenido(<>
            {apto ?
                <p className="text-green-500">El conductor está apto para conducir.</p> :
                <p className="text-red-500">El conductor no está apto para conducir.</p>}
                
        </>)
    }} ref={celda} />
}