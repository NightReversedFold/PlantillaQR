import { newC } from "../ReadAndWriteXSL"

type reduceType = Record<string, string[]>


export default async function obtenerTablaDePatenteDeChecklist(patente: string): Promise<reduceType> {
    const res = await newC.query(`SELECT vehiculo_volcan_nevado,inspeccionado_por,hora_de_envio,fecha_inspeccion,kilometraje,kilometraje_proxima_mantencion,analisis_del_bot_inspector_de_vehiculos,apto FROM Checklist WHERE vehiculo_volcan_nevado = $1 ORDER BY indice DESC LIMIT 1`, [patente])

    const nombreByRut = await newC.query(`SELECT nombre FROM usuarios WHERE regexp_replace(rut, '[^0-9]', '', 'g') = regexp_replace($1,'[^0-9]','','g')`, [res.rows[0].inspeccionado_por])

    delete res.rows[0]?.observaciones
    delete res.rows[0]?.indice

    if (nombreByRut.rows[0]) {
        res.rows[0].inspeccionado_por = nombreByRut.rows[0].nombre
    }

    if (res.rows[0]?.hasOwnProperty('apto')) {
        res.rows[0].apto = String(res.rows[0].apto)
    }

    return res.rows
}
