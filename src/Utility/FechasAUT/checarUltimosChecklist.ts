import { ScheduledTask } from "node-cron";
import { mensajesCorreo } from "../checkListAUT/principal";
import { newC } from "../ReadAndWriteXSL";
import SendGmail from "../SendGmail";
import { cronCall } from "./fechasPatentes";

const obtenerPatentes = async () => {
    const res = await newC.query('SELECT DISTINCT patente FROM Usuarios')

    let rows: Record<'patente', string>[] = res.rows

    rows = rows.filter((el) => el.patente.trim() !== '')

    return rows
}

const tasks: ScheduledTask[] = []

export default async () => {
    tasks.forEach((task) => {
        task.destroy()
    })

    const patentes = await obtenerPatentes()

    patentes.forEach(({ patente }) => {
        console.log(patente == 'TDXR19')
        cronCall('30 10 * * *', async () => {
            try {
                const ultimoChecklist = await newC.query(`SELECT * FROM Checklist WHERE vehiculo_volcan_nevado = $1 AND fecha_inspeccion = CURRENT_DATE LIMIT 1`, [patente.toUpperCase().trim()])

                const rows = ultimoChecklist.rows

                if (rows.length <= 0) {
                    const coreros = await newC.query(`SELECT nombre,correo,cargo FROM Usuarios WHERE (cargo = 'Dueño' AND patente = $1) OR cargo = 'Adm.Contratos' OR cargo LIKE 'Soporte%'`, [patente])
                    const filaCorreos: {
                        nombre: string,
                        correo: string,
                        cargo: string,
                    }[] = coreros.rows

                    for (const { nombre, correo, cargo } of filaCorreos) {

                        switch (cargo) {
                            case 'Adm.Contratos':
                                const ms = mensajesCorreo.NoSeHizoUltimoChecklist(patente, nombre, 'Adm.Contratos')

                                SendGmail(ms.Body, correo, ms.Header)

                                break;

                            case 'Dueño':
                                const msD = mensajesCorreo.NoSeHizoUltimoChecklist(patente, nombre, 'Duenio')

                                SendGmail(msD.Body, correo, msD.Header)

                                break;
                            default:
                                const msS = mensajesCorreo.NoSeHizoUltimoChecklist(patente, nombre, 'Soporte')

                                SendGmail(msS.Body, correo, msS.Header)
                                break;

                        }

                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }

                    console.log('no ha hecho el ultimo checklist')

                } else {
                    console.log('ultimo checklist hecho')
                }

            } catch (e) {
                console.log(e)

                const { Body, Header } = mensajesCorreo.Error(`Error en cron al checar si se hizo ultimo check list ${patente}: ${e}`)

                SendGmail(Body, 'angel74977@gmail.com', Header)
            }



        }, tasks)
    })
}








