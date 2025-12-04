import { useState, useCallback, forwardRef, useImperativeHandle } from "react"
import Expira from "./Expira"

import type { celdaProps } from "./Cell"
import type { ExpiraType } from "./RVTecnica"

// type celdaFechaExpiracion = {
//     celdasRf?: celdasObj,
//     fila?: number
// }

export default forwardRef<ExpiraType, celdaProps>(({ dato }, ref) => {

    const [expirado, setExpirado] = useState(0)

    const useExpirado = useCallback((): [number, React.Dispatch<React.SetStateAction<number>>] => {
        return [expirado, setExpirado]
    }, [expirado])

    useImperativeHandle(ref, () => ({
        ObtenerExpirado: () => {
            return expirado
        }
    }))

    // useEffect(() => {
    //     //celdasRf?.current[`Acreditado_${fila}`].current?.AcreditarA(expirado)

    // }, [expirado])

    return <Expira dato={dato} customExpirado={useExpirado} />
})