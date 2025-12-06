import { useRef, useState, useEffect, useContext } from "react"
import Cell from "./Cell"
import type { SetStateAction, Dispatch } from "react"

import type { celdaProps, objetoCelda } from "./Cell"
import { contextoExcel } from "../../Secciones/Equipos"

export type objExpiracion = {
    obtenerExpiracion: () => boolean
}

type expiracionProps = {
    customExpirado?: () => [number, Dispatch<SetStateAction<number>>]
}

const obtenerOffsetChile = (fecha = new Date()) => {
    const formato = Intl.DateTimeFormat("en-US", {
        timeZone: "America/Santiago",
        timeZoneName: "short"
    })

    const partes = formato.formatToParts(fecha)
    const zona = partes.find(p => p.type === "timeZoneName")?.value 
    const match = zona?.match(/GMT([+-]\d+)/)
    return match ? Number(match[1]) : -3
}


const parseFecha = (fechaStr: string): Date => {
    const [dia, mes, anio] = fechaStr.split('/').map(Number)

    const offsetChile = obtenerOffsetChile(new Date(anio, mes - 1, dia))
    const horaUTC = 0 - offsetChile

    return new Date(Date.UTC(anio, mes - 1, dia, horaUTC))
}

const obtenerFechaHoyChile = () => {
    const ahora = new Date()
    const offsetChile = obtenerOffsetChile(ahora)

    const fechaChile = new Date(
        ahora.getTime() + (offsetChile * 60 * 60 * 1000) * -1 + (ahora.getTimezoneOffset() * 60000)
    )

    fechaChile.setHours(0, 0, 0, 0)

    return fechaChile
}


const obtenerRestaDeFechasEnDias = (fecha: Date) => {
    const today = obtenerFechaHoyChile()
    const diff = fecha.getTime() - today.getTime()
    return diff / (1000 * 60 * 60 * 24)
}

export default ({ dato, customExpirado }: celdaProps & expiracionProps) => {

    const celda = useRef<objetoCelda | null>(null)
    const actualizacionExcel = useContext(contextoExcel)

    const [expirado, setExpirado] = (customExpirado ?? useState)(0)

    useEffect(() => {
        if (dato) {
            const fecha = parseFecha(dato.trim())
            const result = obtenerRestaDeFechasEnDias(fecha)

            setExpirado(
                result <= 8 && result > 0
                    ? 1      // a punto de expirar
                    : result <= 0
                        ? 2  // expirado
                        : 0  // vigente
            )
        }
    }, [dato, actualizacionExcel])

    useEffect(() => {
        celda.current?.textColor(
            expirado === 2
                ? 'text-red-500'
                : expirado === 1
                    ? 'text-yellow-500'
                    : 'text-green-500'
        )
    }, [expirado])

    return (
        <Cell
            popOutFuncion={(popout) => {
                popout?.cambiarContenido(
                    <>
                        {celda.current?.obtenerContenido()}
                        {expirado === 2 ? (
                            <p className="text-red-500">Expirado</p>
                        ) : expirado === 1 ? (
                            <p className="text-yellow-500">A punto de expirar.</p>
                        ) : (
                            <p className="text-green-500">Vigente.</p>
                        )}
                    </>
                )
            }}
            dato={dato}
            ref={celda}
        />
    )
}
