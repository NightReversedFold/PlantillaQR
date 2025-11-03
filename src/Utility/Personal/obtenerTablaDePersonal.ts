
import { obtenerPersonalPorPatente } from '../ReadAndWriteXSL'

type reduceType = Record<string, string[]>

export default async function obtenerTablaDePatenteDeTablaExpeditor(patente: string): Promise<reduceType> {
    const res = await obtenerPersonalPorPatente(patente)

    const final = res.map((el,indx)=>{

        delete res[indx]?.indice
 
        return {...el}
    })

    return final
}
