import read from "../ReadSheet";

import OpenAI from "openai";

import { OPENAI_API_KEY } from "../config";
import AppendSheet from "../AppendSheet";
import SendGmail from "../SendGmail";

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

    return isNaN(posibleNumero) ? limpio : posibleNumero
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

        console.log(proxMant, km)

        return km && proxMant && km > 0 && proxMant > 0 && proxMant >= km + 1
    }

    async function obtenerGerente() {
        const filaPatente = await read('Base de datos', '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk')

        const fila = filaPatente.find((arr) => {
            return arr.includes(nuevoObjeto.Principales.Patente.toUpperCase()) && arr.includes('gerente')
        })

        if (fila) {
            const convertido = {}

            filaPatente[0].forEach((cabecera, indx) => {
                if (!fila[indx]) {
                    convertido[cabecera.replace(/\n/g, '').trim()] = posibleNumero(fila[indx].replace(/\n/g, '').trim())
                }

            })

            return convertido
        }

        throw new Error('Gerente no encontrado')
    }

    async function obtenerInspeccionador() {
        const filaPatente = await read('Base de datos', '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk')

        const fila = filaPatente.find((arr) => {
            return arr.find((str) => {
                return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡?]/g, "").replace(/\s/g, '').trim() == String(nuevoObjeto.Principales["Inspeccionado por RUT"]).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡?]/g, "").replace(/\s/g, '').trim()
            })
        })

        if (fila) {
            const convertido = {}

            filaPatente[0].forEach((cabecera, indx) => {
                convertido[cabecera.replace(/\n/g, '').trim()] = posibleNumero(fila[indx].replace(/\n/g, '').trim())
            })

            return convertido
        }

        throw new Error('Inspeccionador no encontrado')
    }

    async function ultimaInspeccion() {
        const filaPatente = await read(nuevoObjeto.Principales.Patente.toUpperCase(), '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk')

        const fila = filaPatente[filaPatente.length - 1]

        if (fila) {
            const convertido = {}

            filaPatente[0].forEach((cabecera, indx) => {
                convertido[cabecera.replace(/\n/g, '').trim()] = posibleNumero(fila[indx].replace(/\n/g, '').trim())
            })

            return convertido
        }
    }

    async function proxMantencionTaller() {
        const filaPatente = await read('mantencion', '18RdbR-6GNHhp6P3AtC5scB7WSbZz0TuGgIG1B29QRu0')

        const fila = filaPatente.find((arr) => {
            return arr.find((str) => {
                return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡?]/g, "").replace(/\s+/g, '').toUpperCase() == nuevoObjeto.Principales.Patente.toUpperCase()
            })
        })

        if (fila) {
            const convertido = {}

            filaPatente[1].forEach((cabecera, indx) => {
                convertido[cabecera.replace(/\n/g, '').trim()] = posibleNumero(fila[indx].replace(/\n/g, '').trim())
            })

            return convertido
        }
    }

    function Taller() {
        return new Promise(async (resolve, reject) => {
            const filaPatente = await read('Base de datos', '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk')

            const fila = filaPatente.find((arr) => {
                return arr.includes(nuevoObjeto.Principales.Patente.toUpperCase()) && arr.includes('TALLER MECANICO')
            })

            if (fila) {
                const convertido = {}

                filaPatente[0].forEach((cabecera, indx) => {
                    convertido[cabecera.replace(/\n/g, '').trim()] = posibleNumero(fila[indx].replace(/\n/g, '').trim())
                })

                resolve(convertido)
                return
            }
            reject('Fila taller no encontrada')
        })

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

    async function insertarRegistroValido(valores: string[]) {
        AppendSheet(nuevoObjeto.Principales.Patente.toUpperCase(), '1qioLO-5d3mkYL60IxGGnO8_0-trync-RSNKhT3IFhuk', valores)
    }

    try {

        if (checarKilometraje()) {
            const gerente: Record<string, string> = await obtenerGerente()

            await obtenerInspeccionador()

            const ultimaInspeccionFila = await ultimaInspeccion()

            const taller = Taller()

            taller.then(async (filaTaller: any) => {
                const proxMantecionT = await proxMantencionTaller()

                console.log(proxMantecionT)
                if (nuevoObjeto.Principales.Kilometraje >= nuevoObjeto.Principales["Kilometraje Próxima mantención"]) {
                    SendGmail(`Buen dia ${filaTaller.Nombre} se envía este correo para informarle que el kilometraje puesto en el checklist de la patente ${nuevoObjeto.Principales.Patente.toUpperCase()} es mayor que el kilometraje de la próxima mantención.`, filaTaller.Correo, `Inspeccion de vehiculo no apto patente: ${nuevoObjeto.Principales.Patente.toUpperCase()}`)
                }

                const transformed = typeof proxMantecionT['PROXIMA MANTENCION (KMS/HRS)'] === 'string' ? Number(proxMantecionT['PROXIMA MANTENCION (KMS/HRS)'].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡?]/g, "").replace(/\s+/g, '').trim()) : typeof proxMantecionT['PROXIMA MANTENCION (KMS/HRS)']

                if (nuevoObjeto.Principales["Kilometraje Próxima mantención"] !== transformed) {
                    SendGmail(`Buen dia ${filaTaller.Nombre} se le envía este correo para informarle que los kilometrajes de la patente ${nuevoObjeto.Principales.Patente.toUpperCase()} de la próxima mantención del checklist y de la base de datos del taller son distintos`, filaTaller.Correo, `Inspeccion de vehiculo no apto patente: ${nuevoObjeto.Principales.Patente.toUpperCase()}`)
                }

            })

            if (!ultimaInspeccionFila.hasOwnProperty('Kilometraje') || nuevoObjeto.Principales.Kilometraje >= ultimaInspeccionFila['Kilometraje'] + 10) {
                const respuestaMala = hayRespuestaMala()

                const resBot = await botInspector()
                const resBotJSON = JSON.parse(resBot.choices[0].message.content)

                console.log(resBot, nuevoObjeto, nuevoObjeto.Fecha, respuestaMala)

                const newRow = [
                    nuevoObjeto.Fecha as string,
                    nuevoObjeto.Principales.Patente.toUpperCase() as string,
                    nuevoObjeto.Principales["Inspeccionado por RUT"] as string,
                    nuevoObjeto.Principales["Fecha inspección"] as string,
                    nuevoObjeto.Principales.Kilometraje as any,
                    JSON.stringify(nuevoObjeto.Principales["Kilometraje Próxima mantención"]),
                    nuevoObjeto.Principales["OBSERVACIONES:"] as string,
                    multiplesAText(),
                    `
                       ${resBotJSON.Recomendaciones}
                       ${resBotJSON.Descripcion}

                      `,
                    JSON.stringify(respuestaMala)
                ]

                insertarRegistroValido(newRow)

                console.log(resBotJSON)

                if (respuestaMala || resBotJSON.Escala < 3) {
                    SendGmail(`Buen dia ${gerente.Nombre} se envía este correo para informarle que su vehículo ${nuevoObjeto.Principales.Patente} no pasó la inspección. Este es el análisis de nuestro sistema de control de equipos Volcan Nevado 2025:\n ${resBotJSON.Recomendaciones.trim()}\n${resBotJSON.Descripcion.trim()}`, gerente.Correo, `Inspeccion de vehiculo no apto patente: ${nuevoObjeto.Principales.Patente.toUpperCase()}`)

                    const tallerF: any = await taller

                    SendGmail(`Buen dia ${tallerF.Nombre} se envía este correo para informarle que el vehículo ${nuevoObjeto.Principales.Patente} no pasó la inspección. Este es el análisis de nuestro sistema de control de equipos Volcan Nevado 2025:\n ${resBotJSON.Recomendaciones.trim()}\n${resBotJSON.Descripcion.trim()}`, tallerF.Correo, `Inspeccion de vehiculo no apto patente: ${nuevoObjeto.Principales.Patente.toUpperCase()}`)

                }

            } else {
                throw new Error('Kilometraje ilógico')
            }

        } else {
            throw new Error('Kilometraje fallido')
        }
    } catch (e) {
        console.log(e)

    }

}