import read from '../ReadSheet'
import { mantenerDatosObjeto } from '../ObjectUtil'

type reduceType = Record<string, string[]>

const clavesQueMantenerTablaExpeditor = [
    'RUT del Personal','Faena', 'Nombre Completo del Personal', 'Fecha de Término de Contrato del Personal', 'Fecha Expiración Licencia Interna', 'Clases de la Licencia Interna', 'Fecha de Expiración de Documento del Personal', 'Fecha de Expiración de Documento de Examen del Personal', 'Fecha de Expiración de Documento Psicosensométrico del Personal', 'Fecha de Expiración de Documento de Manejo Defensiva del Personal', 'Fecha de Expiración de Documento de Áreas Circulares del Personal', 'Fecha Expiración Licencia Municipal', 'Fecha de Expiración Certificado de Competencias', 'Equipo a cargo'
]

async function obtenerPersona(rut, hoja): Promise<[string[] | undefined, string[]]> {
    const arrayExpeditorRes = await read('Reporte Flexible de Personas - ', hoja)

    const arrayExpeditorConPatente: string[] | undefined = arrayExpeditorRes!.find(
        (subArr: string[]) => {
            return subArr.some(subStr => {
                const is = subStr.replace(/\s/g, '').toLowerCase().includes(rut.replace(/\s/g, '').toLowerCase())
                return is
            })
        }
    )

    return [arrayExpeditorConPatente, arrayExpeditorRes[0]]
}

export default async function obtenerTablaDePersonal(rut: string): Promise<reduceType> {
    const final = { Faena: [] }

    let cabeceras: string[] | undefined

    function establecerCabeceras(cabecerasS) {
        if (!cabeceras) {
            cabeceras = cabecerasS

            cabeceras.forEach(cabecera => {
                final[cabecera] = []
            })
        }
    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPersona(rut, '1PAXQUTnATpzoFP_cdwrgAPneEmXoOlbyCHx0n0KsvsE')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim()|| '')
            }
        })

        final['Faena'].push('DGM')

        console.log(final)
    } catch (e) {
        console.log(e)
    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPersona(rut, '1g5xh0ZML8hwy0G-nqRB_z0Jja16UEdUKIB2B9UN5DYM')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim()|| '')
            }
        })

        final['Faena'].push('DCH')
        console.log(final)

    } catch {

    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPersona(rut, '1OS0P6IM-CUV-0VW5kpfrMdA_QYUBHDiARDFJ3hywvos')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim()|| '')
            }
        })
        final['Faena'].push('DMH')
        console.log(final)

    } catch {

    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPersona(rut, '13Am_ypk5IT6qTxKP2Grp9Mc9merTJZ9CEmuVXhrLFhQ')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim() || '')
            }
        })

        final['Faena'].push('DRT')
        console.log(final)

    } catch {

    }

    const objetoSinDatosInnecesarios: {} = mantenerDatosObjeto(final, clavesQueMantenerTablaExpeditor)
    const acomplado = { ...objetoSinDatosInnecesarios}

    if (!acomplado['Equipo a cargo']  || !acomplado['Equipo a cargo'][0]){
        acomplado['Equipo a cargo'] =  Array(final['Faena'].length).fill('')
    }

    return acomplado
}
