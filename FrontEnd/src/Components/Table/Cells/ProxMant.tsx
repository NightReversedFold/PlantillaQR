import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react"
import Cell from "./Cell"

import type { objetoCelda } from "./Cell"

import type { celdaProps } from "./Cell"

type problemas = 'Kilometrajes desiguales' | 'Kilometraje expirado' | 'No existe kilometraje' | 'Kilometraje a punto de expirar' | 'Kilometraje no es un número' | null

export type proxMantObj = {
    comparar: (kilometraje: string | undefined | null) => void,
    setProblemaT: (problema: problemas) => void
    celda: objetoCelda | null
}

export const convertirANumero = (numeroAConv: string | number | undefined | null) => {
    return Number(typeof numeroAConv === 'string' ? numeroAConv.replace(/,/g, '').match(/\d+/g) : numeroAConv)
}

export default forwardRef<proxMantObj, celdaProps>(({ dato }, ref) => {
    const celda = useRef<objetoCelda | null>(null)

    const [problema, setProblema] = useState<problemas>('No existe kilometraje')

    console.log(problema)

    useEffect(() => {
        console.log(problema)
        if (problema === 'No existe kilometraje') {

            celda.current?.textColor('text-blue-500')

            return
        }

        if (problema === null) {
            celda.current?.textColor('text-green-500')
            return
        }   

    }, [problema])

    useImperativeHandle(ref, () => ({
        comparar: (km) => {

            if (dato) {
                const [kilometraje, proxMantNumero] = [convertirANumero(km), convertirANumero(dato)]

                if (kilometraje && proxMantNumero) {
                    const resta = proxMantNumero - kilometraje

                    if (resta > 800) {

                        setProblema(null)
                        console.log('PROXIMA MANTENCIOOOOON', dato)

                    } else if (resta <= 0) {
                        setProblema('Kilometraje expirado')
                        celda.current?.textColor('text-red-500')
                    } else {
                        setProblema('Kilometraje a punto de expirar')

                        celda.current?.textColor('text-yellow-500')

                    }

                } else {
                    celda.current?.contenido('No es un número.')
                    celda.current?.textColor('text-red-500')
                }
            }
        },
        celda: celda.current,
        setProblemaT: (problema: problemas) => {
            setProblema(problema)
        }
    }))

    return <Cell popOutFuncion={(popout) => {
        popout?.cambiarContenido(<>
            {dato}
            {!problema ? <p className="text-green-500">El kilometraje está a mas de 800 kilometros de la próxima mantención</p> :
                problema === 'Kilometraje a punto de expirar' ? <p className="text-yellow-500">El kilometraje a menos de 800 kilómetros de la próxima mantención</p> :
                    problema === 'Kilometraje expirado' ? <p className="text-blue-500">El kilometraje ya llegó al kilometraje de la próxima mantención.</p> :
                        problema === 'No existe kilometraje' ? <p className="text-blue-500">No hay kilometraje con el que comparar.</p> :
                            problema === 'Kilometraje no es un número' ? <p className="text-blue-500">El kilometraje no es un número.</p> :
                                problema === 'Kilometrajes desiguales' ? <p className="text-blue-500">Kilometrajes desiguales.</p> : null
            }
        </>)
    }} dato={dato} ref={celda} />
})