import cron, { NodeCron } from "node-cron";
import { ScheduledTask } from "node-cron";
import read from '../ReadSheet'
import SendGmail from "../SendGmail";

let tareaEjecutandose = Promise.resolve()

type fechaType = `${string}/${string}/${string}`

const fechasAEscuchar: string[] = [
    'Fecha aprobacion vehiculo',
    'Fecha Permiso Circulacion',
]

const parseFecha = (fecha: fechaType): Date => {
    // mes, dia, año --> año, mes, dia

    const [mes, dia, anio] = fecha.split('/').map(Number)

    return new Date(anio, mes - 1, dia)
}

const tasks: ScheduledTask[] = []

function cronCall(fecha: string, callBack: () => void) {
    tasks.push(cron.schedule(fecha, callBack, {
        timezone: 'America/Santiago'
    }))
}

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

async function expirationAdvice(fechaStr: fechaType, patente: string, cabecera: string, faena: string) {
    const fecha = fechaStr.split('/').map(Number)

    if (!isNaN(fecha[0])) {
        let [mes, dia, anio] = fecha

        const fechaParsed = parseFecha(fechaStr)

        if (!isNaN(mes) && !isNaN(dia) && !isNaN(anio)) {
            console.log(dia, mes, anio)

            cronCall(`0 0 ${dia} ${mes} *`, async () => {
                if (new Date().getFullYear() === Number(anio)) {

                    tareaEjecutandose.finally(() => {
                        tareaEjecutandose = new Promise(async resolve => {
                            const correos = await obtenerCorreosDeResMala()

                            correos.forEach(async correo => {
                                await SendGmail(`Buen dia, se le manda este correo para informarle que la "${cabecera}" de la patente ${patente} llegó a su fecha de expiración.`, correo, `"${cabecera}" de la faena ${faena} llego a su fecha de expiracion.`)
                                await new Promise(resolve => setTimeout(resolve, 2000))
                            })

                            setTimeout(resolve, 1000);

                        })
                    })
                }
            }) // fecha expiracion

            fechaParsed.setDate(fechaParsed.getDate() - 4)

            let [diaM, mesM, anioM] = fechaParsed.toLocaleString().split('/').map(Number)

            cronCall(`0 0 ${diaM} ${mesM} *`, () => {
                if (new Date().getFullYear() === Number(anio)) {
                    tareaEjecutandose.finally(() => {
                        tareaEjecutandose = new Promise(async resolve => {
                            const correos = await obtenerCorreosDeResMala()

                            correos.forEach(async correo => {
                                await SendGmail(`Buen dia, se le manda este correo para informarle que faltan 4 días para que "${cabecera}" de la patente ${patente} expire.`, correo, `"${cabecera}" de la faena ${faena} a punto de expirar.`)
                                await new Promise(resolve => setTimeout(resolve, 2000))

                            })
                            setTimeout(resolve, 1000);

                        })
                    })
                }
            }) // fecha original -4 dias
        }
    }
}

async function expirationAdvicePorPatente(patente) {
    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '1FstxQjwuNJuVwrMtf3lkU1koyB-3QPwRV12l7yMCqNU')

        cabecerasS.forEach((cabecera, indx) => {
            if (fechasAEscuchar.includes(cabecera.trim())) {
                expirationAdvice(arrayExpeditorResGrabrielaMistral[indx] as fechaType, patente, cabecera, 'DGM')
            }
        })

    } catch (e) {

    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '1siFiCDXyMSMyO5EMyCjrU1JTBRVqYxz1HQJrdh3XaSc')

        cabecerasS.forEach((cabecera, indx) => {
            if (fechasAEscuchar.includes(cabecera.trim())) {
                expirationAdvice(arrayExpeditorResGrabrielaMistral[indx] as fechaType, patente, cabecera, 'DCH')
            }
        })

    } catch (e) {

    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '158kbb9f-CekfzZ0WbhdX8DlIWsPwvf-pHJ-_vM4a7Cw')

        cabecerasS.forEach((cabecera, indx) => {
            if (fechasAEscuchar.includes(cabecera.trim())) {
                expirationAdvice(arrayExpeditorResGrabrielaMistral[indx] as fechaType, patente, cabecera, 'DMH')
            }
        })

    } catch (e) {

    }

    try {
        const [arrayExpeditorResGrabrielaMistral, cabecerasS] = await obtenerPatenteDeFaena(patente, '1U-8jWwCUd_YWwVy_bcRm52WwhykT300luDvQvorg9Zs')

        cabecerasS.forEach((cabecera, indx) => {
            if (fechasAEscuchar.includes(cabecera.trim())) {
                expirationAdvice(arrayExpeditorResGrabrielaMistral[indx] as fechaType, patente, cabecera, 'DRT')
            }
        })

    } catch (e) {

    }
}

async function obtenerUltimoChecklist(patente: string): Promise<[string[] | undefined, string[]]> {
    const arrayCheckListRes = await read(patente, '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk')

    const arraysCheckListConPatente: string[][] | undefined = arrayCheckListRes!.filter(
        (subArr: string[]) => {
            return subArr.some(subStr => {
                const is = subStr.replace(/\s/g, '').toLowerCase().includes(patente.replace(/\s/g, '').toLowerCase())

                return is
            })
        }
    )

    return [arraysCheckListConPatente[arraysCheckListConPatente.length - 1], arrayCheckListRes[0]]
}

async function obtenerCorreosDeResMala(): Promise<string[]> {
    const arrayCheckListRes = await read('Base de datos', '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk')

    const cabeceraIndxCorreos = arrayCheckListRes[0].indexOf('CorreosProblemas')

    const correos = []

    arrayCheckListRes.forEach((fila, indx) => {
        if (indx != 0) {
            fila.forEach((dato, datoIndx) => {
                if (datoIndx === cabeceraIndxCorreos) {
                    correos.push(dato)
                }
            })
        }
    })

    return correos
}

const kilometrajesHistory: Record<string, {
    kilometraje: number | null,
    kilometrajeProxMantencion: number | null
}> = {}

async function comparaKilometrajes(patente: string) {
    try {
        if (!kilometrajesHistory.hasOwnProperty(patente)) {
            kilometrajesHistory[patente] = {
                kilometraje: null,
                kilometrajeProxMantencion: null
            }
        }

        const [fila, cabeceras] = await obtenerUltimoChecklist(patente)

        let kilometraje, kmProxMantencion

        cabeceras.forEach((cabecera, indx) => {
            console.log(cabecera.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡?]/g, "").replace(/\s/g, '').replace(/\r?\n/g, '').trim())

            switch (cabecera.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡?]/g, "").replace(/\s/g, '').replace(/\r?\n/g, '').trim()) {
                case 'Kilometraje':
                    kilometraje = Number(fila[indx].replace(/[^\d]/g, '').replace(/\r?\n/g, ''))
                    break
                case 'KilometrajePróximamantención':
                    kmProxMantencion = Number(fila[indx].replace(/[^\d]/g, '').replace(/\r?\n/g, ''))
                    break
            }
        })

        console.log(kilometraje, kmProxMantencion)

        if ((!isNaN(kilometraje) && !isNaN(kmProxMantencion)) && (kilometrajesHistory[patente].kilometraje != kilometraje || kilometrajesHistory[patente].kilometrajeProxMantencion != kmProxMantencion)) {
            kilometrajesHistory[patente].kilometraje = kilometraje
            kilometrajesHistory[patente].kilometrajeProxMantencion = kmProxMantencion

            const resta = (kmProxMantencion - kilometraje)

            if (resta <= 800 && resta > 0) {
                const correos = await obtenerCorreosDeResMala()

                correos.forEach(async correo => {
                    await SendGmail(`Buen dia, se le manda este correo para informarle que el kilometraje (${kilometraje}) del vehículo con la patente ${patente} está apunto de llegar a los ${kmProxMantencion} kilometros.`, correo, `Kilometraje de la patente ${patente} a punto de llegar al kilometraje de la proxima mantencion.`)

                    await new Promise(resolve => setTimeout(resolve, 2000))
                })
            } else if (resta <= 0) {
                const correos = await obtenerCorreosDeResMala()

                correos.forEach(async correo => {
                    await SendGmail(`Buen dia, se le manda este correo para informarle que el kilometraje (${kilometraje}) del vehículo con la patente ${patente} ha llegado a los ${kmProxMantencion} kilometros.`, correo, `Kilometraje de la patente ${patente} llego al kilometraje de la proxima mantencion.`)
                    await new Promise(resolve => setTimeout(resolve, 2000))
                })
            }
        }

    } catch (e) {
        console.log(e)
    }
}

export async function escucharFechas() {
    tasks.forEach((task) => {
        task.destroy()
    })

    expirationAdvicePorPatente('TDXR19')
    expirationAdvicePorPatente('TDXL15')
    expirationAdvicePorPatente('TZTZ54')

}

export async function esucharKilometrajes() {
    comparaKilometrajes('TDXR19')
    comparaKilometrajes('TDXL15')
    comparaKilometrajes('TZTZ54')
}
