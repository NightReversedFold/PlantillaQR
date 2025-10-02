
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config(); 
}
const PORT = process.env.PORT;

import express from 'express';
import { Request, Response } from 'express';

import tablaExpeditor from './Utility/ObtenerTablaExpeditor'
import obtenerTablaDePatenteDeTallerMecanico from './Utility/ObtenerTablaTallerMecanico';

import cors from "cors"

import { UrlPatente } from './types/Url';

const app = express();

app.use(cors({
    origin: process.env.REACT_APP_API_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

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

        console.log(results)

        const [resExpeditor, resTaller]: any = results

        arrayExpeditor = resExpeditor.status == 'fulfilled' ? resExpeditor.value : `Hubo un problema al tratar de obtener los datos del reporte flexible. ${resExpeditor.reason}`
        arrayTaller = resTaller.status == 'fulfilled' ? resTaller.value : `Hubo un problema al tratar de obtener los datos de la mantención. ${resTaller.reason}`

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