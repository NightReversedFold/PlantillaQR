import { useState, useEffect, useContext } from "react"

import type { celdaProps, contenido } from "./Cell"
import { contextoCeldaActualizada } from "../../Secciones/Equipos"


export default ({ celdasRf }: celdaProps) => {

    const celdaActualizada = useContext(contextoCeldaActualizada)

    const [validado, setValidado] = useState<contenido | null>(null)

    useEffect(() => {
        const validado: contenido = celdasRf?.current[`Validacion_h_0`].current?.obtenerDato()

        setValidado(validado)
    }, [celdaActualizada?.[0]])

    return <div className={`${validado ? 'visible' : 'hidden'} text-2xl Header row-start-3 col-span-8 border-2 p-2 bg-[#0c0c0e] Relative w-full border-2 p-2 align-middle`}>
        {'Validado por:'}
    </div>
}