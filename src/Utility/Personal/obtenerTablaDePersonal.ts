import read from '../ReadSheet'
import { mantenerDatosObjeto } from '../ObjectUtil'

type reduceType = Record<string,string[]>

const clavesQueMantenerTablaExpeditor = [
    'RUT del Personal', 'Nombre Completo del Personal','Fecha de Término de Contrato del Personal', 'Fecha Expiración Licencia Interna','Clases de la Licencia Interna','Fecha de Expiración de Documento del Personal','Fecha de Expiración de Documento de Examen del Personal','Fecha de Expiración de Documento Psicosensométrico del Personal','Fecha de Expiración de Documento de Manejo Defensiva del Personal','Fecha de Expiración de Documento de Áreas Circulares del Personal','Fecha Expiración Licencia Municipal','Fecha de Expiración Certificado de Competencias','Equipo a cargo'
]

export default async function obtenerTablaDePersonal (rut: string): Promise<reduceType>  {
    const arrayTallerRes  = await read('Reporte Flexible de Personas - ', '1PAXQUTnATpzoFP_cdwrgAPneEmXoOlbyCHx0n0KsvsE')
    
    console.log(rut,arrayTallerRes)

    const arrayTallerConPatente: string[] | undefined = arrayTallerRes!.find(
        (subArr: string[]) => {
            return subArr.some(subStr =>{
                const is = subStr.replace(/\s/g,'').toLowerCase().includes(rut.replace(/\s/g, '').toLowerCase())

                return is
            })
        }
    )
    
    const objetoConvertido = arrayTallerConPatente!.reduce<reduceType>((acc, valor, indx) => {
        
        acc[arrayTallerRes![0][indx].trim()] = [valor.trim()]
        
        return acc
    }, {})

    console.log('OBJETOCONVERTIDO',objetoConvertido)

    const objetoSinDatosInnecesarios:Record<string, any> = mantenerDatosObjeto(objetoConvertido,clavesQueMantenerTablaExpeditor)    

    console.log('OBJ SIN DATOS INNECESARIOS',objetoSinDatosInnecesarios)

    return objetoSinDatosInnecesarios
}
