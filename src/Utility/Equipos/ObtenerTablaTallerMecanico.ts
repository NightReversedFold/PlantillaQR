
import { obtenerPatente, obtenerTablaTaller } from '../ReadAndWriteXSL'

type reduceType = Record<string, string[]>

export default async function obtenerTablaDePatenteDeTallerMecanico(patente: string): Promise<reduceType> {
    const res = await obtenerTablaTaller(patente)

    delete res[0].fecha
    delete res[0]?.indice


    return res
}
