import read from '../ReadSheet'
import { mantenerDatosObjeto } from '../ObjectUtil'

type reduceType = Record<string,string[]>

const clavesQueMantenerTablaChecklist = [
    'Vehículo Volcan Nevado','Fecha de envío', 'Inspeccionado por:','Fecha inspección','Kilometraje','Kilometraje Próxima mantención','Análisis del bot inspector de vehículos','Apto'
]


export default async function obtenerTablaDePatenteDeChecklist (patente: string): Promise<reduceType>  {

    const arrayCheckListRes  = await read(patente.toUpperCase().trim(), '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk')


    const arraysCheckListConPatente: string[][] | undefined = arrayCheckListRes!.filter(
        (subArr: string[]) => {
            return subArr.some(subStr =>{
                const is = subStr.replace(/\s/g,'').toLowerCase().includes(patente.replace(/\s/g, '').toLowerCase())

                return is
            }) 
        }
    )

    const arrayDeUltimaFila = arraysCheckListConPatente[arraysCheckListConPatente.length - 1]

    const objetoConvertido = arrayDeUltimaFila!.reduce<reduceType>((acc, valor, indx) => {
        
        acc[arrayCheckListRes![0][indx].trim()] = [valor.trim()]
        
        return acc
    }, {})


    const objetoSinDatosInnecesarios:Record<string, any> = mantenerDatosObjeto(objetoConvertido,clavesQueMantenerTablaChecklist)
    
    return objetoSinDatosInnecesarios
}
