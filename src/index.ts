
import { PORT } from './Utility/config'
import { actualizarArchivoPersonalPorFaena, actualizarArchivoPorFaena, actualizarTaller, newC } from './Utility/ReadAndWriteXSL';

import multer from 'multer'

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
import { escucharFechas, compararKilometrajes } from './Utility/FechasAUT/fechasPatentes';

import * as XLSX from 'xlsx'
import checarUltimosChecklist from './Utility/FechasAUT/checarUltimosChecklist';

const app = express();

app.use(cors({
    origin: '*',
    methods: ["GET", "POST", 'DELETE'],
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

        console.log(results)

        const [resExpeditor, resTaller, ultimoChecklist]: any = results
        arrayTaller = resExpeditor.status == 'fulfilled' ? resExpeditor.value : resExpeditor.reason?.message && resExpeditor.reason.message.includes('Cannot read properties of') ? `No se encontró la patente en la base de datos del taller.` : `No se pudieron obtener los datos de la patente en la base de datos del taller: Error desconocido: ${String(resExpeditor.reason)}`
        arrayExpeditor = resTaller.status == 'fulfilled' ? resTaller.value : resTaller.reason?.message && resTaller.reason.message.includes('Cannot read properties of') ? `No se encontró la patente en la base de datos de mantención.` : `No se pudieron obtener los datos de la patente en la base de datos de mantención: Error desconocido: Error desconocido: ${String(resTaller.reason)}`
        arrayChecklist = ultimoChecklist.status == 'fulfilled' ? ultimoChecklist.value : ultimoChecklist.reason?.message && ultimoChecklist.reason.message.includes('Cannot read properties of') ? `No se encontró el ultimo checklist de la patente.` : `No se pudieron obtener los datos de la patente en la base de datos del checklist: Error desconocido: Error desconocido: ${String(ultimoChecklist.reason)}`


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
        await principal(req.body)

        compararKilometrajes()

        io.emit('actualizarExcel')
    } catch (e) {
        console.log(e)
    }
    console.log(req.body)
    res.status(200).json({ success: true })
})

const upload = multer({ storage: multer.memoryStorage() })

app.post('/UploadExpeditor', upload.fields([
    { name: "DGM", maxCount: 1 },
    { name: "DCH", maxCount: 1 },
    { name: "DMH", maxCount: 1 },
    { name: "DRT", maxCount: 1 },
    { name: "DGMPersonal", maxCount: 1 },
    { name: "DCHPersonal", maxCount: 1 },
    { name: "DMHPersonal", maxCount: 1 },
    { name: "DRTPersonal", maxCount: 1 },
    { name: 'Taller', maxCount: 1 }
]), async (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    if (!files || Object.keys(files).length === 0) {
        return res.status(400).send("No se recibieron archivos");
    }

    try {
        for (const fieldName in files) {
            const file = files[fieldName]

            const resS = XLSX.read(file[0].buffer, { type: 'buffer' })

            console.log(fieldName)
            if (fieldName.includes('Personal')) {
                const shRFV = resS.Sheets['Reporte Flexible de Personas - ']

                if (shRFV) {
                    await actualizarArchivoPersonalPorFaena(fieldName.split('Personal')[0], XLSX.utils.sheet_to_json(shRFV, {
                        raw: false
                    }))
                }

                continue
            }

            if (fieldName == 'Taller') {
                const shTaller = resS.Sheets['mantencion']

                if (shTaller) {

                    await actualizarTaller(XLSX.utils.sheet_to_json(shTaller, {
                        range: 1,
                        raw: false
                    }))
                }
                continue
            }

            const shRFV = resS.Sheets['Reporte Flexible Vehiculos']

            if (shRFV) {
                await actualizarArchivoPorFaena(fieldName, XLSX.utils.sheet_to_json(shRFV, {
                    raw: false
                }))

            }

        }

        escucharFechas()

        io.emit('actualizarExcel')
        io.emit('actualizarExcelPersonal')

        return res.status(200).send('Archivos trabajados correctamente')
    } catch (e) {
        console.log(e)
        return res.status(400).send("Algo salió mal.");
    }

})

app.post('/SetUsers', async (req, res) => {
    const { patente, cargo, nombre, rut, correo } = req.body

    console.log(patente, cargo, nombre, rut, correo)

    try {
        const resx = await newC.query('INSERT INTO Usuarios (patente,cargo,nombre,rut,correo) VALUES ($1,$2,$3,$4,$5) RETURNING Indice', [
            patente, cargo, nombre, rut, correo
        ])

        console.log(resx)
        
        checarUltimosChecklist()

        res.status(200).json({ msg: 'Usuario agregado existosamente.', indice: resx.rows[0].indice })

    } catch (e) {
        console.log(e)
        res.status(400).json({ msg: 'Algo salió mal.' })
    }
})

app.get('/GetUsers', async (req, res) => {

    try {
        const resx = await newC.query('SELECT indice,patente,cargo,nombre,rut,correo FROM Usuarios')

        res.status(200).json(resx.rows)

    } catch (e) {
        console.log(e)
        res.status(400).json({ msg: 'Algo salió mal.' })
    }
})

app.delete('/DeleteUser/:indice', async (req: Request<{ indice: string }>, res) => {
    try {
        console.log(req.params.indice)
        await newC.query('DELETE FROM Usuarios WHERE Indice = $1', [req.params.indice])

        res.status(200).json({ msg: 'Usuario eliminado existosamente.' })

    } catch (e) {
        console.log(e)
        res.status(400).json({ msg: 'Algo salió mal.' })
    }
})

app.delete("/DeleteTb/:tb", async (req: Request<{
    tb: string
}>, res) => {
    const { tb } = req.params

    console.log(tb)

    try {
        await newC.query(`TRUNCATE TABLE ${tb}`)

        io.emit('actualizarExcel')

        res.status(200).json({ msg: 'Datos eliminados correctamente.' })


    } catch (e) {
        console.log(e)
        res.status(400).json({ msg: 'Algo salió mal al eliminar los datos de la tabla.' })

    }

})

escucharFechas()

compararKilometrajes()

checarUltimosChecklist()