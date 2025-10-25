
import { PORT, CORS_url } from './Utility/config'

import express from 'express';
import { Request, Response } from 'express';

import tablaExpeditor from './Utility/Equipos/ObtenerTablaExpeditor'
import obtenerTablaDePatenteDeTallerMecanico from './Utility/Equipos/ObtenerTablaTallerMecanico';
import obtenerTablaDeUltimaInspeccion from './Utility/Equipos/ObtenerTablaUltimaInspeccion';

import obtenerTablaDePersonal from './Utility/Personal/obtenerTablaDePersonal'

import ObtenerImagenDrive from './Utility/ObtenerImagenDrive';

import { Server } from "socket.io";

import cors from "cors"

import { UrlImagen, UrlPatente } from './types/Url';
import { UrlPersonal } from './types/Url';
import principal, { type InspeccionBody } from './Utility/checkListAUT/principal';
import { escucharFechas, esucharKilometrajes } from './Utility/FechasAUT/fechasPatentes';

const app = express();

app.use(cors({
    origin: '*',
    methods: ["GET", "POST"],
}))

app.use(express.json());

app.get('/obtenerDatos/equipos/:patente', async (req: Request<UrlPatente>, res: Response) => {
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


        const [resExpeditor, resTaller, ultimoChecklist]: any = results
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

})

app.get('/obtenerDatos/imagen/:tipo/:imagen', async (req: Request<UrlImagen>, res: Response) => {
    try {
        const nombre = req.params.imagen
        const tipo = req.params.tipo

        const [file, drive] = await ObtenerImagenDrive(nombre, tipo == 'equipos' ? '1onYq8Mk4hx8bFZDbQCujHs-RJKtIIJp6' : '1qdDGvflU0cREkGkygNQGOZvM9sgzoms7')

        if (!file) return res.status(404).send("Archivo no encontrado")

        const response = await drive.files.get(
            { fileId: file.id, alt: "media" },
            { responseType: "stream" }
        )

        res.setHeader("Content-Type", file.mimeType)
        response.data.pipe(res)
    } catch (err) {
        console.log(err)
        res.status(500).send("Error al obtener la imagen")
    }

})

app.get('/obtenerDatos/personal/:rut', async (req: Request<UrlPersonal>, res: Response) => {
    const rut = req.params.rut

    let arrayPersonal: string[] | string

    try {
        let results = await Promise.allSettled([
            obtenerTablaDePersonal(rut),
        ])

        const [resExpeditor]: any = results
        arrayPersonal = resExpeditor.status == 'fulfilled' ? resExpeditor.value : resExpeditor.reason?.message && resExpeditor.reason.message.includes('Cannot read properties of') ? `No se encontró la patente en la base de datos del personal.` : `No se pudieron obtener los datos de la patente en la base de datos del personal: Error desconocido: ${String(resExpeditor.reason)}`

        let oneGood = results.some(subArr => {
            return subArr.status == 'fulfilled'
        })

        if (!oneGood) {
            throw new Error(`No se pudo obtener ningun dato del personal.`)
        }

        res.json({
            Persona: arrayPersonal,
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ error: e instanceof Error ? e.message : e });
    }

});

const io = new Server(app.listen(PORT, () => {
    console.log(`Servidor corriendo en PORT ${PORT}`);
}), {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    },
});

app.post('/automatizacion', async (req: Request<InspeccionBody>, res: Response) => {
    try {
        principal(req.body)
    } catch (e) {
        console.log(e)
    }
    console.log(req.body)
    res.status(200).json({ success: true })
})

app.post('/excelActualizado', (req: Request<UrlPatente>, res: Response) => {
    io.emit('actualizarExcel')
    console.log('actualizando excel')

    escucharFechas()
    esucharKilometrajes()

    res.status(200).json({ success: true })
})

app.post('/excelActualizadoPersonal', (req: Request<UrlPatente>, res: Response) => {
    io.emit('actualizarExcelPersonal')

    res.status(200).json({ success: true })
})

escucharFechas()

esucharKilometrajes()