import read from './ReadSheet'
import { mantenerDatosObjeto } from './ObjectUtil'

type reduceType = {
    [clave: string]: string
}

const clavesQueMantenerTablaExpeditor = [
    'PROXIMA MANTENCION (KMS/HRS)', 'FECHA ULT MANTECION', 'RESUMEN DE ULTIMA MANTENCION'
]

export default async function obtenerTablaDePatenteDeTallerMecanico (patente: string): Promise<reduceType>  {
    const arrayTallerRes = await read('mantencion!A1:L110', '18RdbR-6GNHhp6P3AtC5scB7WSbZz0TuGgIG1B29QRu0')

    const arrayTallerConPatente: string[] = arrayTallerRes.find(
        (subArr: string[]) => {
            return subArr.some(subStr =>{
                const is = subStr.replace(/\s/g,'').includes(patente.replace(/\s/g, ''))

                return is
            })
        }
    )

    const objetoConvertido = arrayTallerConPatente.reduce<reduceType>((acc, valor, indx) => {
        acc[arrayTallerRes[1][indx]] = valor
        return acc
    }, {})

    const objetoSinDatosInnecesarios:Record<string, any> = mantenerDatosObjeto(objetoConvertido,clavesQueMantenerTablaExpeditor)
    objetoSinDatosInnecesarios['PATENTE/SERIE'] = patente

    console.log(objetoSinDatosInnecesarios)

    return objetoSinDatosInnecesarios
}
