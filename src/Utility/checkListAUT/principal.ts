
import OpenAI from "openai";

import { OPENAI_API_KEY } from "../config";
import SendGmail from "../SendGmail";

import { newC } from "../ReadAndWriteXSL";
import obtenerTablaDePatenteDeChecklist from "../Equipos/ObtenerTablaUltimaInspeccion";
import obtenerTablaDePatenteDeTallerMecanico from "../Equipos/ObtenerTablaTallerMecanico";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

export type Multiples = {
    'NIVEL DE ENERGIA *': string | null;
    'ESTADO DE CONCENTRACIÓN *': string | null;
    'CALIDAD DE SUEÑO *': string | null;
    'ESTADO DE ALERTA *': string | null;
    'CAPACIDAD DE CONDUCCIÓN *': string | null;
    'LUCES BAJAS *': string | null;
    'LUCES ALTAS *': string | null;
    'LUZ INTERMITENTE IZQ./DER. *': string | null;
    'LUZ TABLERO *': string | null;
    'LUCES TRASERAS *': string | null;
    'BOCINA RETROCESO *': string | null;
    'FRENO DE PIE (PEDAL) *': string | null;
    'FRENO DE MANO (PALANCA) *': string | null;
    'NEUMATICOS DELANTEROS *': string | null;
    'NEUMATICOS TRASEROS *': string | null;
    'NEUMATICO DE REPUESTO *': string | null;
    'RUIDOS AL FRENAR *': string | null;
    'FUGAS DE ACEITE *': string | null;
    'LIMPIA PARABRISAS (PLUMILLAS)': string | null;
    'PARABRISAS FRONTAL Y TRASERO': string | null;
    'VENTANAS (FUNCIONAMIENTO)': string | null;
    'ESPEJOS RETROVISORES (TRES) *': string | null;
    'GATA (CAMBIO NEUMATICO)': string | null;
    'TRABA PERNOS': string | null;
    'CUÑAS': string | null;
    'TRIANGULO': string | null;
    'LLAVE RUEDAS': string | null;
    'EXTINTOR': string | null;
    'BOTIQUIN (PRIMEROS AUXILIOS)': string | null;
    'AIRE ACONDICIONADO': string | null;
    'RADIO MUSICA / PARLANTES': string | null;
    'ASIENTOS': string | null;
    'CINTURONES DE SEGURIDAD': string | null;
    'BOCINA *': string | null;
    'ALARMA RETROCESO *': string | null;
};

export type Principales = {
    'Patente': string;
    'Inspeccionado por RUT': string;
    'Fecha inspección': string;
    'Kilometraje': number;
    'Kilometraje Próxima mantención': number;
    'OBSERVACIONES:': string;
};

export type InspeccionBody = {
    Multiples: Multiples;
    Principales: Principales;
    Fecha: string;
};

const posibleNumero = (nm: string) => {
    const limpio = nm.trim()
    const posibleNumero = Number(nm.trim())

    return isNaN(posibleNumero) ? limpio ?? null : posibleNumero
}

export const mensajesCorreo = {
    'KilometrajeMayorQueProxMant': (filaTallerNombre: string, patente: string) => {
        return {
            Body: `Buen dia ${filaTallerNombre} se envía este correo para informarle que el kilometraje puesto en el checklist de la patente ${patente} es mayor que el kilometraje de la próxima mantención.`,
            Header: `Inspeccion de vehiculo no apto patente: ${patente}`
        }
    },
    'ProxMantDistintos': (filaTallerNombre: string, patente: string) => {
        return {
            Body: `Buen dia ${filaTallerNombre} se le envía este correo para informarle que los kilometrajes de la patente ${patente} de la próxima mantención del checklist y de la base de datos del taller son distintos`,
            Header: `Inspeccion de vehiculo no apto patente: ${patente}`
        }
    },

    'RespuestaMala': (nombre: string, patente: string, recomendacionesBot: string, descripcionBot: string, tipo: 'gerente' | 'taller' | 'soporte' | 'usuario') => {
        return {
            Body: `Buen dia ${nombre} se envía este correo para informarle que ${tipo == 'gerente' ? 'su' : 'el'} vehículo ${patente} no pasó la inspección. Este es el análisis de nuestro sistema de control de equipos Volcan Nevado 2025:\n ${recomendacionesBot}\n${descripcionBot}`,
            Header: `Inspeccion de vehiculo no apto patente: ${patente}`

        }
    },

    'NoSeHizoUltimoChecklist': (patente: string, nombre: string, personal: 'Duenio' | 'Soporte' | 'Adm.Contratos') => {
        return {
            Body: personal === 'Duenio' ?
                `Buen dia ${nombre}: Se le pide por favor que haga el chequeo del vehículo ${patente}, usar código QR del equipo.` :
                personal === 'Adm.Contratos' ?
                    `Buen dia ${nombre}: Se le envía este correo para informarle que no se ha realizado el checklist de la patente ${patente} del dia de hoy.` :
                    personal === 'Soporte' ?
                        `Buen dia ${nombre}: Se le envía este correo para informarle que no se ha realizado el checklist de la patente ${patente} del dia de hoy.` : null
            ,
            Header: `Realizar formulario del vehiculo`
        }
    },

    'Error': (error) => {
        return {
            Body: 'Hubo un error: ' + String(error),
            Header: 'Error'
        }
    }
}

export default async (datos: InspeccionBody) => {
    function normalizar() {
        let nuevoObjeto: any = {}

        for (const inspBody in datos) {
            if (typeof datos[inspBody] === 'string') { nuevoObjeto[inspBody] = datos[inspBody]; continue }

            nuevoObjeto[inspBody] = {}

            for (const datoInspBody in datos[inspBody]) {
                if (!datos[inspBody][datoInspBody]) continue

                nuevoObjeto[inspBody][datoInspBody.trim().replace(/\[|\]/g, '')] = posibleNumero(datos[inspBody][datoInspBody])
            }
        }

        //nuevoObjeto.Principales['Kilometraje'] = Number(nuevoObjeto.Principales['Kilometraje'].replace(/[^a-zA-Z0-9 ]/g, ''))

        return nuevoObjeto
    }

    const nuevoObjeto: InspeccionBody = normalizar()

    function checarKilometraje() {
        const proxMant = nuevoObjeto.Principales["Kilometraje Próxima mantención"]
        const km = nuevoObjeto.Principales.Kilometraje


        return km && proxMant && km > 0 && proxMant > 0 && proxMant >= km + 1
    }

    async function obtenerGerente() {
        const gerente = await newC.query('SELECT * FROM Usuarios WHERE cargo = $1', ['Adm.Contratos'])

        if (gerente && gerente.rows[0]) {
            return gerente.rows[0]
        }

        throw new Error('Gerente no encontrado')
    }

    async function obtenerInspeccionador() {
        console.log(String(nuevoObjeto.Principales["Inspeccionado por RUT"]), 'INSPECCIONADOOOOOOOOOR')

        const inspeccionador = await newC.query(`SELECT * FROM Usuarios WHERE regexp_replace(rut, '[^0-9]', '', 'g') = $1 AND cargo in ('Adm.Contratos','Usuario','Dueño')`, [String(nuevoObjeto.Principales["Inspeccionado por RUT"]).replace(/\D/g, '')])

        if (inspeccionador && inspeccionador.rows[0]) {
            return inspeccionador.rows[0]
        }

        throw new Error('inspeccionador no encontrado')

    }

    async function ultimaInspeccion() {
        const fila = await obtenerTablaDePatenteDeChecklist(nuevoObjeto.Principales.Patente.toUpperCase())

        return fila[0]
    }

    async function obtenerSoporteDGM() {
        const coreros = await newC.query(`SELECT nombre,correo FROM Usuarios WHERE cargo = 'SoporteDGM'`)

        return coreros.rows
    }

    async function proxMantencionTaller() {
        const fila = await obtenerTablaDePatenteDeTallerMecanico(nuevoObjeto.Principales.Patente.toUpperCase())

        return fila[0]
    }

    async function Taller() {
        const taller = await newC.query(`SELECT * FROM Usuarios WHERE cargo = $1`, ['Taller mecanico'])

        if (taller && taller.rows[0]) {
            return taller.rows[0]
        }

        throw new Error('taller no encontrado')
    }


    function hayRespuestaMala() {
        const sinRespuestas = Object.values(nuevoObjeto.Multiples).length == 0;

        if (sinRespuestas) return true

        if (!Object.keys(nuevoObjeto.Multiples).some(pregunta => {
            return pregunta.includes('*')
        })) { return true }


        if (Object.keys(nuevoObjeto.Multiples).some(pregunta => {
            return pregunta.includes('*') && (nuevoObjeto.Multiples[pregunta] === 'MALO' || !nuevoObjeto.Multiples[pregunta] || nuevoObjeto.Multiples[pregunta] == null || nuevoObjeto.Multiples[pregunta] == 'null')
        })) { return true }

        return false
    }

    function multiplesAText() {
        let objetoATexto = ''

        Object.keys(nuevoObjeto.Multiples).forEach(pregunta => {
            objetoATexto = objetoATexto + `${pregunta.replace(/[\[\]]/g, "").replace('*', '').trim()} : ${nuevoObjeto.Multiples[pregunta].trim()}\n`

        })

        return objetoATexto
    }

    async function botInspector() {
        return await client.chat.completions.create({
            response_format: { type: "json_object" },
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Tendrás la función de un inspector de vehículos. Recibirás datos de la inspección de un vehículo y del estado del conductor algo similar a este formato: Propiedad : estado; con posibles observaciones. Los datos tendrán el kilometraje y los estados generales del vehículo además de informacion del estado del conductor; y en base a esos datos quiero me des una escala de tipo Likert, y me entregues una descripción de los puntos mas importantes de un análisis de esos datos de no mas de 50-70 palabras, al igual que recomendaciones (posibles mejoras) en base a los datos y las observaciones si es que las hay, y teniendo en cuenta el kilometraje de la próxima revisión, igualmente no mas de 50-70 palabras. Ten muy en cuenta el estado del conductor y NO des recomendaciones de compra de productos ni cosas que inciten a comprar cosas, no des ningun tipo de recomendacón de comprar cosas aunque algo esté mal. Siempre en el siguiente formato JSON:  {Escala:0,Recomendaciones:'',Descripcion:''}"
                },
                {
                    role: "user",
                    content: `
                                 Kilometraje: ${nuevoObjeto.Principales.Kilometraje}
                                 Kilometraje para próxima mantención: ${nuevoObjeto.Principales["Kilometraje Próxima mantención"]}
                                 Observaciones: ${nuevoObjeto.Principales["OBSERVACIONES:"]}
                                 Propiedades: ${multiplesAText()}  
                             `
                }
            ]
        })

    }

    async function insertarRegistroValido(valores: any[]) {
        newC.query(`INSERT INTO Checklist (vehiculo_volcan_nevado,inspeccionado_por,fecha_inspeccion,kilometraje,kilometraje_proxima_mantencion,observaciones,analisis_del_bot_inspector_de_vehiculos,apto) 
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, valores)
    }

    try {

        if (checarKilometraje()) {
            const gerente: Record<string, string> = await obtenerGerente()

            const inspeccionador = await obtenerInspeccionador()

            const ultimaInspeccionFila = await ultimaInspeccion()

            const taller = Taller()

            const kilometrajeLogico = !ultimaInspeccionFila || nuevoObjeto.Principales.Kilometraje >= ultimaInspeccionFila['kilometraje']

            taller.then(async (filaTaller: any) => {
                if (!kilometrajeLogico) { return }

                const proxMantecionT = await proxMantencionTaller()

                console.log(proxMantecionT, 'PRXO MANTENCION TALLER')

                if (!proxMantecionT) { throw new Error('No se encontraron datos del taller en la base de datos.') }

                if (nuevoObjeto.Principales.Kilometraje > nuevoObjeto.Principales["Kilometraje Próxima mantención"]) {
                    const { Body, Header } = mensajesCorreo.KilometrajeMayorQueProxMant(filaTaller.nombre, nuevoObjeto.Principales.Patente.toUpperCase())
                    SendGmail(Body, filaTaller.correo, Header)
                }

                if (nuevoObjeto.Principales["Kilometraje Próxima mantención"] !== proxMantecionT['proxima_mantencion']) {

                    const { Body, Header } = mensajesCorreo.ProxMantDistintos(filaTaller.nombre, nuevoObjeto.Principales.Patente.toUpperCase())
                    SendGmail(Body, filaTaller.correo, Header)

                }

            }).catch(e => {
                console.log(e)
            })


            if (kilometrajeLogico) {
                const respuestaMala = hayRespuestaMala()

                const resBot = await botInspector()
                const resBotJSON = JSON.parse(resBot.choices[0].message.content)

                const newRow = [
                    nuevoObjeto.Principales.Patente.toUpperCase(),
                    nuevoObjeto.Principales["Inspeccionado por RUT"],
                    nuevoObjeto.Principales["Fecha inspección"],
                    nuevoObjeto.Principales.Kilometraje,
                    nuevoObjeto.Principales["Kilometraje Próxima mantención"],
                    nuevoObjeto.Principales["OBSERVACIONES:"],
                    `${resBotJSON.Recomendaciones} ${resBotJSON.Descripcion}`,
                    respuestaMala
                ]

                insertarRegistroValido(newRow)

                if (respuestaMala || resBotJSON.Escala < 3) {

                    try {
                        const correosDGM = await obtenerSoporteDGM()

                        for (const { nombre, correo } of correosDGM) {
                            let res = mensajesCorreo.RespuestaMala(nombre, nuevoObjeto.Principales.Patente.toUpperCase(), resBotJSON.Recomendaciones.trim(), resBotJSON.Descripcion.trim(), 'soporte')
                            SendGmail(res.Body, correo, res.Header)
                        }

                    } catch (e) {
                        const { Body, Header } = mensajesCorreo.Error(`Error correosDGM: ${e}, Error correosDGM`)

                        SendGmail(Body, 'angel74977@gmail.com', Header)
                    }

                    try {
                        let usuarioRs = mensajesCorreo.RespuestaMala(inspeccionador.nombre, nuevoObjeto.Principales.Patente.toUpperCase(), resBotJSON.Recomendaciones.trim(), resBotJSON.Descripcion.trim(), 'usuario')
                        SendGmail(usuarioRs.Body, inspeccionador.correo, usuarioRs.Header)
                    } catch (e) {
                        const { Body, Header } = mensajesCorreo.Error(`Error correo inspeccionador: ${e}, Error correo inspeccionador`)

                        SendGmail(Body, 'angel74977@gmail.com', Header)
                    }


                    let res = mensajesCorreo.RespuestaMala(gerente.nombre, nuevoObjeto.Principales.Patente.toUpperCase(), resBotJSON.Recomendaciones.trim(), resBotJSON.Descripcion.trim(), 'gerente')
                    SendGmail(res.Body, gerente.correo, res.Header)

                    const tallerF: any = await taller

                    let { Body, Header } = mensajesCorreo.RespuestaMala(tallerF.nombre, nuevoObjeto.Principales.Patente.toUpperCase(), resBotJSON.Recomendaciones.trim(), resBotJSON.Descripcion.trim(), 'taller')
                    SendGmail(Body, tallerF.correo, Header)

                }

            } else {
                const { Body, Header } = mensajesCorreo.Error(`Kilometraje ilogico, kilometraje checklist: ${nuevoObjeto.Principales.Kilometraje}, ultima inspeccion kiloemtraje: ${ultimaInspeccionFila['kilometraje']}`)

                SendGmail(Body, 'angel74977@gmail.com', Header)

                throw new Error('Kilometraje ilógico ')
            }

        } else {
            const { Body, Header } = mensajesCorreo.Error(`Kilometraje ilogico, km proxima mantencion: ${nuevoObjeto.Principales["Kilometraje Próxima mantención"]}, kilometraje checklist: ${nuevoObjeto.Principales.Kilometraje}`)

            SendGmail(Body, 'angel74977@gmail.com', Header)

            throw new Error('Kilometraje fallido')
        }
    } catch (e) {
        console.log(e)
        const { Body, Header } = mensajesCorreo.Error(e)

        SendGmail(Body, 'angel74977@gmail.com', Header)

    }

}