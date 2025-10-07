
import { PORT, CORS_url } from './Utility/config'

import express from 'express';
import { Request, Response } from 'express';

import tablaExpeditor from './Utility/ObtenerTablaExpeditor'
import obtenerTablaDePatenteDeTallerMecanico from './Utility/ObtenerTablaTallerMecanico';
import obtenerTablaDeUltimaInspeccion from './Utility/ObtenerTablaUltimaInspeccion';

import { Server } from "socket.io";

import cors from "cors"

import { UrlPatente } from './types/Url';

const app = express();

app.use(cors())

app.use(express.json());

app.get('/obtenerDatos/:patente', async (req: Request<UrlPatente>, res: Response) => {
    const patente = req.params.patente

    let arrayExpeditor: string[] | string
    let arrayTaller: string[] | string
    let arrayChecklist: string[] | string

    try {
        let results = await Promise.allSettled([
            obtenerTablaDePatenteDeTallerMecanico(patente),
            tablaExpeditor(patente),
            obtenerTablaDeUltimaInspeccion(patente)
        ])


        const [resExpeditor, resTaller,ultimoChecklist]: any = results
        arrayTaller = resExpeditor.status == 'fulfilled' ? resExpeditor.value : resExpeditor.reason?.message && resExpeditor.reason.message.includes('Cannot read properties of') ? `No se encontró la patente en la base de datos del taller.` : `No se pudieron obtener los datos de la patente en la base de datos del taller: Error desconocido: ${String(resExpeditor.reason)}`
        arrayExpeditor = resTaller.status == 'fulfilled' ? resTaller.value : resTaller.reason?.message && resTaller.reason.message.includes('Cannot read properties of') ? `No se encontró la patente en la base de datos de mantención.` : `No se pudieron obtener los datos de la patente en la base de datos de mantención: Error desconocido: Error desconocido: ${String(resTaller.reason)}`
        arrayChecklist = ultimoChecklist.status == 'fulfilled' ? ultimoChecklist.value : ultimoChecklist.reason?.message && ultimoChecklist.reason.message.includes('Cannot read properties of') ? `No se encontró el ultimo checklist de la patente.` : `No se pudieron obtener los datos de la patente en la base de datos del checklist: Error desconocido: Error desconocido: ${String(ultimoChecklist.reason)}`

        console.log(results)

        let oneGood = results.some(subArr => {
            return subArr.status == 'fulfilled'
        })

        if (!oneGood) {
            throw new Error(`No se pudo obtener ningun dato del equipo.`)
        }

        res.json({
            Taller: arrayTaller,
            Expeditor: arrayExpeditor,
            Checklist: arrayChecklist
        })
    }
    catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : e });
    }

});

const io = new Server(app.listen(PORT, () => {
    console.log(`Servidor corriendo en PORT ${PORT}`);
}), {
    cors: {
        origin: CORS_url, 
        methods: ["GET", "POST"],
    },
});

app.post('/excelActualizado', (req: Request<UrlPatente>, res: Response) => {
    io.emit('actualizarExcel')

    res.status(200).json({ success: true })
})

