
import { PORT, CORS_url } from './Utility/config'

import express from 'express';
import { Request, Response } from 'express';

import tablaExpeditor from './Utility/ObtenerTablaExpeditor'
import obtenerTablaDePatenteDeTallerMecanico from './Utility/ObtenerTablaTallerMecanico';

import cors from "cors"

import { UrlPatente } from './types/Url';
import { stringify } from 'node:querystring';

const app = express();

app.use(cors())

app.use(express.json());

app.get('/obtenerDatos/:patente', async (req: Request<UrlPatente>, res: Response) => {
    const patente = req.params.patente

    let arrayExpeditor: string[] | string
    let arrayTaller: string[] | string

    try {
        let results = await Promise.allSettled([
            obtenerTablaDePatenteDeTallerMecanico(patente),
            tablaExpeditor(patente)
        ])

        console.log(results,'lol que mal')

        const [resExpeditor, resTaller]: any = results

        arrayExpeditor = resExpeditor.status == 'fulfilled' ? resExpeditor.value : resExpeditor.reason?.message && resExpeditor.reason.message.includes('Cannot read properties of') ? `No se encontró la patente en la base de datos de mantención.` : `No se pudieron obtener los datos de la patente en la base de datos de mantención: Error desconocido: ${String(resExpeditor.reason)}`
        arrayTaller = resTaller.status == 'fulfilled' ? resTaller.value : resTaller.reason?.message && resTaller.reason.message.includes('Cannot read properties of') ? `No se encontró la patente en la base de datos del taller.` : `No se pudieron obtener los datos de la patente en la base de datos del taller: Error desconocido: ${String(resTaller.reason)}`

        console.log(results)

        let oneGood = results.some(subArr => {
            return subArr.status == 'fulfilled'
        })

        if (!oneGood) {
            throw new Error(`No se pudo obtener ningun dato del equipo.`)
        }
        
        res.json({
            Taller: arrayExpeditor,
            Expeditor: arrayTaller
        })
    }
    catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : e });
    }

});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en PORT`);
});