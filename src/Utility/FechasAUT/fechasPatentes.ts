import cron from "node-cron";
import { ScheduledTask } from "node-cron";
import SendGmail from "../SendGmail";
import { newC } from "../ReadAndWriteXSL";
import { mensajesCorreo } from "../checkListAUT/principal";

let tareaEjecutandose = Promise.resolve()

type fechaType = `${string}/${string}/${string}`

const fechasAEscuchar: string[] = [
    'fecha_revision_tecnica',
    'fecha_permiso_circulacion',
    'fecha_expiracion_licencia_interna',
    'fecha_expiracion_de_documento_del_personal',
    'fecha_expiracion_de_documento_de_examen_del_personal',
    'fecha_expiracion_de_documento_psicosensometrico_del_personal',
    'fecha_expiracion_de_documento_de_manejo_defensiva_del_personal',
    'fecha_expiracion_de_documento_de_areas_circulares_del_personal',
    'fecha_expiracion_licencia_municipal',
    'fecha_de_expiracion_certificado_de_competencias'
]

const tasks: ScheduledTask[] = []

export function cronCall(fecha: string, callBack: () => void, tasksx: ScheduledTask[]) {
    tasksx.push(cron.schedule(fecha, callBack, {
        timezone: 'America/Santiago'
    }))
}

async function obtenerCorreosParaAviso() {
    const res = await newC.query('SELECT nombre,correo FROM Usuarios WHERE cargo = $1 OR cargo = $2', ['Adm.Contratos', 'SoporteDGM'])

    return res.rows
}

async function obtenerCorreosParaAvisoKilometrajes() {
    const res = await newC.query('SELECT nombre,correo FROM Usuarios WHERE cargo = $1 OR cargo = $2', ['Taller mecanico', 'SoporteDGM'])

    return res.rows
}

async function expirationAdvice(fechaStr: Date, patente: string, cabecera: string, faena: string) {
    const fecha = new Date(fechaStr)

    if (fecha && isNaN(fecha.getTime())) return

    //if (!(fechaStr instanceof Date)) { return }

    let diaM = fechaStr.getDate()
    let mesM = fechaStr.getMonth() + 1
    let anioM = fechaStr.getFullYear()

    cronCall(`0 0 ${diaM} ${mesM} *`, async () => {
        try {
            if (new Date().getFullYear() === Number(anioM)) {

                tareaEjecutandose.finally(() => {
                    tareaEjecutandose = new Promise(async resolve => {
                        const correos = await obtenerCorreosParaAviso()

                        for (const correoF of correos) {
                            const { nombre, correo } = correoF

                            await SendGmail(`Buen dia ${nombre}, se le manda este correo para informarle que la "${cabecera}" de la patente ${patente} llegó a su fecha de expiración.`, correo, `"${cabecera}" de la faena ${faena} llego a su fecha de expiracion.`)
                            await new Promise(resolvex => setTimeout(resolvex, 2000))
                        }

                        setTimeout(resolve, 1000);

                    })
                })
            }
        } catch (e) {
            const { Body, Header } = mensajesCorreo.Error(`Error en fecha cron call expiracion ${fechaStr}: ${e}`)

            SendGmail(Body, 'angel74977@gmail.com', Header)
        }


    }, tasks) // fecha expiracion

    fechaStr.setDate(fechaStr.getDate() - 4)

    diaM = fechaStr.getDate()
    mesM = fechaStr.getMonth() + 1
    anioM = fechaStr.getFullYear()

    cronCall(`0 0 ${diaM} ${mesM} *`, () => {
        try {
            if (new Date().getFullYear() === Number(anioM)) {
                tareaEjecutandose.finally(() => {
                    tareaEjecutandose = new Promise(async resolve => {
                        const correos = await obtenerCorreosParaAviso()

                        for (const correoF of correos) {
                            const { nombre, correo } = correoF

                            await SendGmail(`Buen dia ${nombre}, se le manda este correo para informarle que faltan 4 días para que "${cabecera}" de la patente ${patente} expire.`, correo, `"${cabecera}" de la faena ${faena} a punto de expirar.`)
                            await new Promise(resolvex => setTimeout(resolvex, 2000))
                        }

                        setTimeout(resolve, 1000);

                    })
                })
            }
        } catch (e) {
            const { Body, Header } = mensajesCorreo.Error(`Error en fecha cron call -4 dias ${fechaStr}: ${e}`)

            SendGmail(Body, 'angel74977@gmail.com', Header)
        }

    }, tasks) // fecha original -4 dias


}

export async function compararKilometrajes() {

    try {
        const correos = await obtenerCorreosParaAvisoKilometrajes()

        const checklists = await newC.query(`SELECT DISTINCT ON (t1.vehiculo_volcan_nevado)
                                                    t1.vehiculo_volcan_nevado,
                                                    t1.kilometraje,
                                                    t1.kilometraje_proxima_mantencion
                                                FROM Checklist t1
                                                INNER JOIN Usuarios t2 ON t2.patente = t1.vehiculo_volcan_nevado
                                                ORDER BY t1.vehiculo_volcan_nevado,t1.indice DESC`)

        for (const fila of checklists.rows) {
            const { vehiculo_volcan_nevado, kilometraje_proxima_mantencion, kilometraje } = fila

            const resta = kilometraje_proxima_mantencion - kilometraje

            if (resta <= 800 && resta > 0) {
                for (const correoF of correos) {
                    const { nombre, correo } = correoF

                    await SendGmail(`Buen dia ${nombre}, se le manda este correo para informarle que el kilometraje (${kilometraje}) del vehículo con la patente ${vehiculo_volcan_nevado} está apunto de llegar a los ${kilometraje_proxima_mantencion} kilometros.`, correo, `Kilometraje de la patente ${vehiculo_volcan_nevado} a punto de llegar al kilometraje de la proxima mantencion.`)
                    await new Promise(resolve => setTimeout(resolve, 2000))

                }

                continue
            }

            if (resta <= 0) {
                for (const correoF of correos) {
                    const { nombre, correo } = correoF

                    await SendGmail(`Buen dia ${nombre}, se le manda este correo para informarle que el kilometraje (${kilometraje}) del vehículo con la patente ${vehiculo_volcan_nevado} ha llegado a los ${kilometraje_proxima_mantencion} kilometros.`, correo, `Kilometraje de la patente ${vehiculo_volcan_nevado} llego al kilometraje de la proxima mantencion.`)
                    await new Promise(resolve => setTimeout(resolve, 2000))

                }
            }
        }

    } catch (e) {
        const { Body, Header } = mensajesCorreo.Error(e)

        SendGmail(Body, 'angel74977@gmail.com', Header)
    }
}

export async function escucharFechas() {
    tasks.forEach((task) => {
        task.destroy()
    })

    try {
        const expeditor = await newC.query(`SELECT *
                                      FROM Expeditor t1
                                      WHERE EXISTS(
                                        SELECT 1
                                        FROM Usuarios t2
                                        WHERE t2.patente = t1.patente
                                      ); `)

        expeditor.rows.forEach(fila => {

            fechasAEscuchar.forEach(nombreFecha => {
                if (fila.hasOwnProperty(nombreFecha)) {
                    expirationAdvice(fila[nombreFecha], fila.patente, nombreFecha, fila.faena)
                }
            });
        })

        // const personal = await newC.query('SELECT * FROM Personal')

        // personal.rows.forEach(fila => {
        //     fechasAEscuchar.forEach(nombreFecha => {
        //         if (fila.hasOwnProperty(nombreFecha)) {
        //             expirationAdvice(fila[nombreFecha], fila.patente, nombreFecha, fila.faena)
        //         }
        //     });
        // })

    } catch (e) {
        const { Body, Header } = mensajesCorreo.Error(e)

        SendGmail(Body, 'angel74977@gmail.com', Header)
    }

}

