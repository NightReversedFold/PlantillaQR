import React, { useRef, createRef, forwardRef, useImperativeHandle, useEffect, useState, type PropsWithChildren } from "react";

import type { celdaProps } from "./Cells/Cell";

import Cell from "./Cells/Cell";
import Acreditacion from "./Cells/Acreditacion";
import Expira from "./Cells/Expira";
import RvTecnica from "./Cells/RVTecnica";
import PMCirculacion from "./Cells/PermisoCirculacion";

import Observaciones from "./Cells/Observaciones";
import Kilometraje from "./Cells/Kilometraje";
import ProxMant from "./Cells/ProxMant";
import Apto from "./Cells/Apto";
import EquipoACargo from "./Cells/EquipoACargo";
import HoraDeEnvio from "./Cells/HoraDeEnvio";
import Validado from "./Cells/Validado";
import Validacion from "./Cells/Validacion";

const Equivalencias: Record<string, any> = {
    Acreditado: Acreditacion,
    FechaRevisionTecnica: RvTecnica,
    HoradelEnvío: HoraDeEnvio,
    'FechaPermisoCirculacion': PMCirculacion,
    Expiración: Expira,
    KilometrajePróximamantención: ProxMant,
    'ProximaMantencion': ProxMant,
    Observaciones,
    Kilometraje,
    Apto,
    Validacion_h: Validacion
}

const EquivalenciasCabeceras: Record<string, any> = {
    Validacion_h: Validado
}

const EquivalenciasPersonal: Record<string, any> = {
    'FechadeTérminodeContratodelPersonal': Expira,
    'FechaExpiraciónLicenciaInterna': Expira,
    'FechadeExpiracióndeDocumentodelPersonal': Expira,
    'FechadeExpiracióndeDocumentodeExamendelPersonal': Expira,
    'FechadeExpiracióndeDocumentoPsicosensométricodelPersonal': Expira,
    'FechadeExpiracióndeDocumentodeManejoDefensivadelPersonal': Expira,
    'FechadeExpiracióndeDocumentodeÁreasCircularesdelPersonal': Expira,
    'FechaExpiraciónLicenciaMunicipal': Expira,
    'FechadeExpiraciónCertificadodeCompetencias': Expira,
    'Equipoacargo': EquipoACargo,
    'Validacion': Validacion
}

const equivalentKeys = {
    fecha_aprobacion_vehiculo: 'Fecha Aprobacion Vehiculo',
    fecha_permiso_circulacion: 'Fecha Permiso Circulacion',
    fecha_revision_tecnica: 'Fecha Revision Tecnica',
    patente: 'Patente',
    faena: 'Faena',
    marca: 'Marca',
    validado: 'Validacion_h',
    proxima_mantencion: 'Proxima Mantencion',
    fecha_ultima_mantencion: 'Fecha Ultima Mantencion',
    resumen_ultima_mantencion: 'Resumen Ultima Mantencion',

    rut_del_personal: 'Rut Del Personal',
    nombre_completo_del_personal: 'Nombre Completo Del Personal',
    fecha_de_termino_de_contrato_del_personal: 'Fecha de Término de Contrato del Personal',
    fecha_expiracion_licencia_interna: 'Fecha Expiración Licencia Interna',
    clases_de_la_licencia_interna: 'Clases de la Licencia Interna',
    fecha_expiracion_de_documento_del_personal: 'Fecha de Expiración de Documento del Personal',
    fecha_expiracion_de_documento_de_examen_del_personal: 'Fecha de Expiración de Documento de Examen del Personal',
    fecha_expiracion_de_documento_psicosensometrico_del_personal: 'Fecha de Expiración de Documento Psicosensométrico del Personal',
    fecha_expiracion_de_documento_de_manejo_defensiva_del_personal: 'Fecha de Expiración de Documento de Manejo Defensiva del Personal',
    fecha_expiracion_de_documento_de_areas_circulares_del_personal: 'Fecha de Expiración de Documento de Áreas Circulares del Personal',
    fecha_expiracion_licencia_municipal: 'Fecha Expiración Licencia Municipal',
    fecha_de_expiracion_certificado_de_competencias: 'Fecha de Expiración Certificado de Competencias',
    equipo_a_cargo: 'Equipo a Cargo',

    vehiculo_volcan_nevado: 'Vehiculo Volcan Nevado',
    hora_de_envio: 'Hora del Envío',
    inspeccionado_por: 'Inspeccionado Por:',
    fecha_inspeccion: 'Fecha Inspección',
    kilometraje: 'Kilometraje',
    cargo: 'Cargo del Personal',
    kilometraje_proxima_mantencion: 'Kilometraje Próxima mantención',
    analisis_del_bot_inspector_de_vehiculos: 'Análisis del bot inspector de vehículos:',
    apto: 'Apto'
}

type tablaProps = PropsWithChildren<{
    formato: string;
    objetoType: 'object' | 'string';
    clampTable: number;
    tabla: Record<string, string[]>[];
}>

export type celdasObj = Record<string, any>

export default forwardRef<celdasObj, tablaProps>(({ formato, objetoType, clampTable, tabla, children }, ref) => {

    const celdasObj = useRef<celdasObj>({})

    const [filas, setFilas] = useState<Record<string, string>[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log('xdfdsfsdfsd')
        if (objetoType == 'object') {
            //const newArr: string[][] = []

            // Object.keys(tabla).forEach((el) => {
            //     newArr.push([el, ...tabla[el]])
            //     //tabla[el].unshift(el)
            // })

            // const rows: string[][] = []

            // newArr.forEach((subArr) => {


            //     subArr.forEach((str, indx2) => {
            //         if (!rows.hasOwnProperty(indx2)) {
            //             rows.push([])
            //         }
            //         rows[indx2].push(str)

            //     })

            // })
            console.log(tabla)

            if (tabla && tabla instanceof Array && tabla.length > 0) {
                setFilas(tabla as any)
            }

        } else {
            setFilas(null)
        }

    }, [tabla])


    useEffect(() => {
        if (!filas) {
            setError('No se encontró la fila en la base datos.')
        } else {
            setError(null)
        }
    }, [filas])

    useImperativeHandle(ref, () => celdasObj.current)

    return filas ? <div className='w-full flex flex-col justify-center items-center text-center'>

        <div style={clampTable == 2 ? { fontSize: 'clamp(7px, 2vw, 18px)' } : undefined} className={`overflow-auto grid ${formato} grid-rows-auto flex flex-col w-full text-center border-2 p-2`}>

            {
                //  <div className=" relative flex flex-row ">
                //  {   
                Object.keys(filas[0]).map((headerStr, rowindx) => {
                    if (equivalentKeys.hasOwnProperty(headerStr)) {
                        headerStr = (equivalentKeys as any)[headerStr]
                    }

                    let Celda: React.ComponentType<any> | null = null


                    Celda = EquivalenciasCabeceras[headerStr.replace(/\s+/g, '')] || Cell

                    return Celda ? <Celda key={rowindx} indx={rowindx} dato={headerStr.replace(/\s/g, '') == '' ? 'Sin dato.' : headerStr.trim()} celdasRf={celdasObj} fila={rowindx} cabecera={true} /> : null
                })
                //    }
                //  </div>
            }
            {
                filas.map((row, indx) => {
                    return Object.values(row).map((rowStr, rowindx) => {

                        if (rowStr && typeof rowStr !== 'number' && !isNaN(Date.parse(rowStr))) {
                            const [anio, mes, dia] = rowStr.split('T')[0].replace(/-/g, '/').split('/')

                            rowStr = `${dia}/${mes}/${anio}`
                        }

                        const keyEquivalence = equivalentKeys.hasOwnProperty(Object.keys(filas[0])[rowindx]) ? (equivalentKeys as any)[Object.keys(filas[0])[rowindx]] : Object.keys(filas[0])[rowindx]

                        let Celda: React.ComponentType<any> | null = null

                        let datoWs = keyEquivalence.replace(/\s+/g, '')

                        const key = `${datoWs}_${indx}`
                        celdasObj.current[key] = createRef<celdaProps>()

                        console.log(key,rowStr)
                        Celda = Equivalencias[datoWs] || EquivalenciasPersonal[datoWs] || Cell

                        return Celda ? <Celda key={rowindx} indx={rowindx} dato={rowStr ? String(rowStr) : ''} ref={celdasObj.current[key]} celdasRf={celdasObj} fila={indx} /> : null

                    })
                })
            }

            {children}
        </div>

    </div> : error ? <p className='text-center text-red-500 text-3xl'> {JSON.stringify(error)} </p> : <p className='text-center text-red-500 text-3xl'>Error desconocido. Intenta recargar la página.</p>

})
