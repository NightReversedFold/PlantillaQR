import { newC } from "../ReadAndWriteXSL"

type reduceType = Record<string, string[]>


export default async function obtenerTablaDePatenteDeChecklist(patente: string): Promise<reduceType> {
    const res = await newC.query(`SELECT * FROM Checklist WHERE vehiculo_volcan_nevado = $1 ORDER BY fecha_de_envio DESC LIMIT 1`, [patente])

    delete res.rows[0]?.observaciones
    delete res.rows[0]?.indice

    if (res.rows[0]?.hasOwnProperty('apto')) {
        res.rows[0].apto = String(res.rows[0].apto)
    }

    return res.rows
}
