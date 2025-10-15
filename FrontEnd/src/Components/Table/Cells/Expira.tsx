import { useRef, useState, forwardRef, useImperativeHandle, useEffect, useContext } from "react"
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

const parseFecha = (fecha: string): Date => {
    // mes, dia, año --> año, mes, dia

    const [mes, dia, anio] = fecha.split('/').map(Number)

    return new Date(anio, mes - 1, dia)
}

const obtenerRestaDeFechasEnDias = (fecha: Date) => {

    const today = new Date()

    const result = (fecha.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)

    return result
}

export default ({ dato, customExpirado }: celdaProps & expiracionProps) => {
    const celda = useRef<objetoCelda | null>(null)

    const actualizacionExcel = useContext(contextoExcel)

    const [expirado, setExpirado] = (customExpirado ?? useState)(0)

    useEffect(() => {
        if (dato) {
            const result = obtenerRestaDeFechasEnDias(parseFecha(dato.trim()))
            setExpirado(result <= 4 && result > 0 ? 1 : result <= 0 ? 2 : 0)
        }
    }, [dato, actualizacionExcel])

    useEffect(() => {
        celda.current?.textColor(`${expirado === 2 ? 'text-red-500' : expirado === 1 ? 'text-yellow-500' : 'text-green-500'}`)
    }, [expirado])

    return <Cell dato={dato} ref={celda} />
}