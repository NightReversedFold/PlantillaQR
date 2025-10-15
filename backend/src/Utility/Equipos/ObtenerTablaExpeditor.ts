import read from '../ReadSheet'
import { mantenerDatosObjeto } from '../ObjectUtil'

type reduceType = Record<string, string[]>


const clavesQueMantenerTablaExpeditor = [
    'Patente', 'Faena', 'Fecha aprobacion vehiculo', 'Fecha Permiso Circulacion', 'Fecha Revision Tecnica', 'Fecha Expiración'
]

async function obtenerPatenteDeFaena(patente, hoja): Promise<[string[] | undefined, string[]]> {
    const arrayExpeditorRes = await read('Reporte Flexible Vehiculos', hoja)

    const arrayExpeditorConPatente: string[] | undefined = arrayExpeditorRes!.find(
        (subArr: string[]) => {
            return subArr.some(subStr => {
                const is = subStr.replace(/\s/g, '').toLowerCase().includes(patente.replace(/\s/g, '').toLowerCase())
                return is
            })
        }
    )

    return [arrayExpeditorConPatente, arrayExpeditorRes[0]]
}

export default async function obtenerTablaDePatenteDeTablaExpeditor(patente: string): Promise<reduceType> {
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
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '1FstxQjwuNJuVwrMtf3lkU1koyB-3QPwRV12l7yMCqNU')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim())
            }
        })

        final['Faena'].push('DGM')

        console.log(final)
    } catch (e) {
        console.log(e)
    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '1siFiCDXyMSMyO5EMyCjrU1JTBRVqYxz1HQJrdh3XaSc')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim())
            }
        })

        final['Faena'].push('DCH')
        console.log(final)

    } catch {

    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '158kbb9f-CekfzZ0WbhdX8DlIWsPwvf-pHJ-_vM4a7Cw')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim())
            }
        })
        final['Faena'].push('DMH')
        console.log(final)

    } catch {

    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '1U-8jWwCUd_YWwVy_bcRm52WwhykT300luDvQvorg9Zs')

        establecerCabeceras(cabecerasS)

        cabeceras.forEach((cabecera, indx) => {
            const dato = arrayExpeditorResGrabrielaMistral[indx]

            if (dato) {
                final[cabecera].push(dato.trim())
            }
        })

        final['Faena'].push('DRT')
        console.log(final)

    } catch {

    }

    const objetoSinDatosInnecesarios: {} = mantenerDatosObjeto(final, clavesQueMantenerTablaExpeditor)
    const acomplado = { ...objetoSinDatosInnecesarios, Acreditado: Array(final['Faena'].length).fill('') }
    return acomplado
}
