import read from './ReadSheet'
import { mantenerDatosObjeto } from './ObjectUtil'

type reduceType = Record<string,string[]>

const clavesQueMantenerTablaExpeditor = [
    'PROXIMA MANTENCION (KMS/HRS)', 'FECHA ULT MANTECION', 'RESUMEN DE ULTIMA MANTENCION'
]

export default async function obtenerTablaDePatenteDeTallerMecanico (patente: string): Promise<reduceType>  {
    const arrayTallerRes  = await read('mantencion', '18RdbR-6GNHhp6P3AtC5scB7WSbZz0TuGgIG1B29QRu0')
    
    const arrayTallerConPatente: string[] | undefined = arrayTallerRes!.find(
        (subArr: string[]) => {
            return subArr.some(subStr =>{
                const is = subStr.replace(/\s/g,'').toLowerCase().includes(patente.replace(/\s/g, '').toLowerCase())

                return is
            })
        }
    )

    const objetoConvertido = arrayTallerConPatente!.reduce<reduceType>((acc, valor, indx) => {
        
        acc[arrayTallerRes![1][indx].trim()] = [valor.trim()]
        
        return acc
    }, {})

    const objetoSinDatosInnecesarios:Record<string, any> = mantenerDatosObjeto(objetoConvertido,clavesQueMantenerTablaExpeditor)
    const objetoFinal = {'PATENTE/SERIE':[patente],...objetoSinDatosInnecesarios}
    

    return objetoFinal
}
