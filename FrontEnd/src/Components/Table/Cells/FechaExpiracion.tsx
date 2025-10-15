import { useState, useEffect, useCallback } from "react"
import Expira from "./Expira"
import type { celdasObj } from "../Table"

import type { celdaProps } from "./Cell"

type celdaFechaExpiracion = {
    celdasRf?: celdasObj,
    fila?: number
}

export default ({ dato, celdasRf, fila }: celdaFechaExpiracion & celdaProps) => {

    const [expirado, setExpirado] = useState(0)

    const useExpirado = useCallback((): [number, React.Dispatch<React.SetStateAction<number>>] => {
        return [expirado, setExpirado]
    }, [expirado])

    useEffect(() => {

        celdasRf?.current[`Acreditado_${fila}`].current?.AcreditarA(!(expirado == 2))

    }, [expirado])

    return <Expira dato={dato} customExpirado={useExpirado} />
}