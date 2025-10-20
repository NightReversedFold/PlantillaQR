import { useRef, useContext, useEffect } from "react"
import Cell from "./Cell"

import type { objetoCelda } from "./Cell"

import type { proxMantObj } from "./ProxMant"

import type { celdaProps } from "./Cell"

import type { celdasObj } from "../Table"

import { convertirANumero } from "./ProxMant"

import { contextoCeldaActualizada, contextoObtenerTablas } from "../../Secciones/Equipos"

export default ({ dato, celdasRf }: celdaProps & {
    celdasRf?: celdasObj,
}) => {
    const celda = useRef<objetoCelda | null>(null)
    const estado = useContext(contextoObtenerTablas)

    const celdaActualizada = useContext(contextoCeldaActualizada)

    useEffect(() => {
        console.log('ACTUALIZACION EXCEL', estado?.[0].current.Taller.current)

        const proxMant: proxMantObj | null = estado?.[0].current.Taller.current?.['PROXIMAMANTENCION(KMS/HRS)_1']?.current
        const proxMant2: proxMantObj | null = celdasRf?.current?.['KilometrajePróximamantención_1']?.current

        const [km1, km2] = [proxMant?.celda?.obtenerContenido(), proxMant2?.celda?.obtenerContenido()]

        if (convertirANumero(km1) !== convertirANumero(km2)) {
            console.log('KILOMETRAJES NO COINCIDEN')
            proxMant?.setProblemaT('Kilometrajes desiguales')
            proxMant2?.setProblemaT('Kilometrajes desiguales')

            proxMant?.celda?.textColor('text-blue-500')
            proxMant2?.celda?.textColor('text-blue-500')

            // proxMant2?.celda?.cambiarContenidoConFuncion((last) => {
            //     if (last?.includes('(No coincide con taller)')) return last

            //     return `${last} (No coincide con taller)`
            // })
            // proxMant?.celda?.cambiarContenidoConFuncion((last) => {
            //     if (last?.includes('(No coincide con último checklist)')) return last

            //     return `${last} (No coincide con último checklist)`
            // })

        } else {

            proxMant2?.celda?.cambiarContenidoConFuncion((last) => {
            //   if (last?.includes('(No coincide con taller)')) return last
            
                return `${last?.match(/\d+/g)}`
            })
            proxMant?.celda?.cambiarContenidoConFuncion((last) => {
                return `${last?.match(/\d+/g)}`
            })

            proxMant?.comparar(dato)
            proxMant2?.comparar(dato)
        }

        return ()=>{
            proxMant?.setProblemaT('No existe kilometraje')
        }

    }, [celdaActualizada?.[0]])

    return <Cell dato={dato} ref={celda} />
}