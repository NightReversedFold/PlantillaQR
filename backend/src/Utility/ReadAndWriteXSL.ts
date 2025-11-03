import { Pool } from 'pg'

export const newC = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_5tCDE9sObpoQ@ep-snowy-voice-acxia8ys-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', // la URL del dashboard
    ssl: { rejectUnauthorized: false },
    options: '-c timezone=America/Santiago'
})


type fechaStyle = `${string}/${string}/${string}`

type excelJ = unknown[]


const convertirASQLDateValido = (fecha: fechaStyle) => {
    if (!fecha) return null

    const [mes, dia, anio] = fecha.split('/')

    if (isNaN(Number(mes)) || isNaN(Number(dia)) || isNaN(Number(anio))) { return null }

    return `'${anio.padStart(4, '20')}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}'`
}

const filasPersonalAQuery = (faena, excel: excelJ) => {
    const rows = []

    excel.forEach((fila: Record<string, string>) => {

        const rut = fila['RUT del Personal']
        const cargo = fila['Cargo del Personal']
        const nmp = fila['Nombre Completo del Personal']
        const cli = fila['Clases de la Licencia Interna']
        const fedd = convertirASQLDateValido(fila['Fecha de Expiración de Documento del Personal'] as fechaStyle)
        const fedep = convertirASQLDateValido(fila['Fecha de Expiración de Documento de Examen del Personal'] as fechaStyle)
        const fdpp = convertirASQLDateValido(fila['Fecha de Expiración de Documento Psicosensométrico del Personal'] as fechaStyle)
        const fedmdp = convertirASQLDateValido(fila['Fecha de Expiración de Documento de Manejo Defensiva del Personal'] as fechaStyle)
        const fedacp = convertirASQLDateValido(fila['Fecha de Expiración de Documento de Áreas Circulares del Personal'] as fechaStyle)
        const felm = convertirASQLDateValido(fila['Fecha Expiración Licencia Municipal'] as fechaStyle)
        const fecc = convertirASQLDateValido(fila['Fecha de Expiración Certificado de Competencias'] as fechaStyle)

        rows.push(`('${rut}','${faena}','${nmp}','${cargo}','${cli}',${fedd},${fedep},${fdpp},${fedmdp},${fedacp},${felm},${fecc})`)

    })

    return rows
}

const filasExpeditorAQuery = (faena, excel: excelJ) => {
    const rows = []

    excel.forEach((fila: Record<string, string>) => {

        rows.push(`('${fila.Patente}','${faena}','${fila.Marca}','${fila.Modelo}',${convertirASQLDateValido(fila['Fecha aprobacion vehiculo'] as fechaStyle)},${convertirASQLDateValido(fila['Fecha Permiso Circulacion'] as fechaStyle)},${convertirASQLDateValido(fila['Fecha Revision Tecnica'] as fechaStyle)})`)
    })

    return rows
}

const filasTallerAQuery = (excel: excelJ) => {

    const rows = []

    excel.forEach((fila: Record<string, string>) => {
        console.log(fila)
        if (fila.hasOwnProperty('PATENTE/SERIE') && fila['PATENTE/SERIE'].length <= 10) {
            const fixed = fila['PATENTE/SERIE'].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡?]/g, "").replace(/\s/g, '').trim()

            rows.push(`('${fixed}',${Number(String(fila['PROXIMA MANTENCION (KMS/HRS)']).replace(/\D/g, ""))},${convertirASQLDateValido(fila['FECHA ULT MANTECION'] as fechaStyle)},'${fila['RESUMEN DE ULTIMA MANTENCION']}')`)

        }
    })

    return rows
}

export async function actualizarArchivoPorFaena(faena: string, excel: excelJ) {
    const res = filasExpeditorAQuery(faena, excel)

    await newC.query('DELETE FROM Expeditor WHERE faena = $1', [faena])

    await newC.query(`INSERT INTO Expeditor (patente,faena,marca,modelo,fecha_aprobacion_vehiculo,fecha_permiso_circulacion,fecha_revision_tecnica)
                    VALUES ${res.join(', ')}`)

}

export async function actualizarArchivoPersonalPorFaena(faena: string, excel: excelJ) {
    const res = filasPersonalAQuery(faena, excel)
    console.log(res)

    await newC.query('DELETE FROM Personal WHERE faena = $1', [faena])

    await newC.query(`INSERT INTO Personal (rut_del_personal,faena,nombre_completo_del_personal,cargo,clases_de_la_licencia_interna,fecha_expiracion_de_documento_del_personal,fecha_expiracion_de_documento_de_examen_del_personal,fecha_expiracion_de_documento_psicosensometrico_del_Personal,fecha_expiracion_de_documento_de_manejo_defensiva_del_personal,fecha_expiracion_de_documento_de_areas_circulares_del_personal,fecha_expiracion_licencia_municipal,fecha_de_expiracion_certificado_de_competencias)
                    VALUES ${res.join(', ')}`)

}

export async function actualizarTaller(excel: excelJ) {

    const res = filasTallerAQuery(excel)

    console.log(res)

    const fecha = new Date();
    const fechaFormateada = fecha.toISOString().split('T')[0]

    await newC.query('DELETE FROM Taller WHERE fecha = $1', [fechaFormateada])

    await newC.query(`INSERT INTO Taller (patente,proxima_mantencion,fecha_ultima_mantencion,resumen_ultima_mantencion)
	                      VALUES ${res.join(', ')}
    `)
}

export async function obtenerTablaTaller(patente: string) {
    const res = await newC.query(`SELECT * FROM Taller WHERE patente = $1 ORDER BY fecha DESC LIMIT 1`, [patente])

    return res.rows
}
export async function obtenerPatente(patente: string) {
    const res = await newC.query('SELECT patente,faena,marca,modelo,fecha_aprobacion_vehiculo,fecha_permiso_circulacion,fecha_revision_tecnica FROM Expeditor Where patente = $1', [patente])

    return res.rows
}

export async function obtenerPersonalPorPatente(rut: string) {
    const res = await newC.query('SELECT rut_del_personal,faena,nombre_completo_del_personal,cargo,clases_de_la_licencia_interna,fecha_expiracion_de_documento_del_personal,fecha_expiracion_de_documento_de_examen_del_personal,fecha_expiracion_de_documento_psicosensometrico_del_Personal,fecha_expiracion_de_documento_de_manejo_defensiva_del_personal,fecha_expiracion_de_documento_de_areas_circulares_del_personal,fecha_expiracion_licencia_municipal,fecha_de_expiracion_certificado_de_competencias FROM Personal Where rut_del_personal = $1', [rut])

    return res.rows
}