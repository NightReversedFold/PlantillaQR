import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react"
import Cell from "./Cell"

import type { objetoCelda } from "./Cell"

type objAcreditado = {
    AcreditarA: (valor: number) => void
}

export default forwardRef<objAcreditado>((_, ref) => {
    const celda = useRef<objetoCelda | null>(null)

    const [acreditado, setAcreditado] = useState(1)

    useImperativeHandle(ref, () => ({
        AcreditarA: (valor: number) => {
            setAcreditado(valor)
        }
    }))

    useEffect(() => {
        celda.current?.bgColor(`${acreditado === 2 ? 'bg-red-500' : acreditado === 1 ? 'bg-yellow-500' : 'bg-green-500'}`)
    }, [acreditado])

    return <Cell popOutFuncion={(popout) => {
        popout?.cambiarContenido(<>
            {acreditado === 2 ? 
            <p className="text-red-500">Expirado.</p> : 
            acreditado === 1 ? <p className="text-yellow-500">A punto de expirar.</p>
             : <p className="text-green-500">Vigente.</p>}
        </>)
    }} ref={celda} />
})