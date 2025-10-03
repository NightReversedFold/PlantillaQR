import read from '../Utility/ReadSheet'
import { mantenerDatosObjeto } from './ObjectUtil'

type reduceType = {
    [clave: string]: string
}

const clavesQueMantenerTablaExpeditor = [
    'Patente', 'Fecha aprobacion vehiculo', 'Fecha Permiso Circulacion', 'Fecha Expiración', 'Fecha Revision Tecnica'
]

export default async function obtenerTablaDePatenteDeTablaExpeditor(patente: string): Promise<reduceType> {
    const arrayExpeditorRes = await read('Reporte Flexible Vehiculos!A1:M23', '1FstxQjwuNJuVwrMtf3lkU1koyB-3QPwRV12l7yMCqNU')

    const arrayExpeditorConPatente: string[] | undefined = arrayExpeditorRes!.find(
        (subArr: string[]) => {
            return subArr.some(subStr => {
                const is = subStr.replace(/\s/g, '').includes(patente.replace(/\s/g, ''))
                return is
            })
        }
    )

    const objetoConvertido = arrayExpeditorConPatente!.reduce<reduceType>((acc, valor, indx) => {
        acc[arrayExpeditorRes![0][indx]] = valor
        return acc
    }, {})

    const objetoSinDatosInnecesarios: {} = mantenerDatosObjeto(objetoConvertido, clavesQueMantenerTablaExpeditor)

    return objetoSinDatosInnecesarios
}
