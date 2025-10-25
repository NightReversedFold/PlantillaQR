import React, { useRef, createRef, forwardRef, useImperativeHandle, useEffect, useState } from "react";

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

const Equivalencias: Record<string, any> = {
    Acreditado: Acreditacion,
    FechaRevisionTecnica: RvTecnica,
    'FechaPermisoCirculacion': PMCirculacion,
    Expiración: Expira,
    KilometrajePróximamantención: ProxMant,
    'PROXIMAMANTENCION(KMS/HRS)': ProxMant,
    Observaciones,
    Kilometraje,
    Apto
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
    'Equipoacargo': EquipoACargo
}

type tablaProps = {
    formato: string;
    objetoType: 'object' | 'string';
    clampTable: number;
    tabla: Record<string, string[]>;
}

export type celdasObj = Record<string, any>

export default forwardRef<celdasObj, tablaProps>(({ formato, objetoType, clampTable, tabla }, ref) => {

    const celdasObj = useRef<celdasObj>({})

    const [filas, setFilas] = useState<string[][] | null>(null)

    useEffect(() => {
        if (objetoType == 'object') {
            const newArr: string[][] = []

            Object.keys(tabla).forEach((el) => {
                newArr.push([el, ...tabla[el]])
                //tabla[el].unshift(el)
            })

            const rows: string[][] = []

            newArr.forEach((subArr) => {


                subArr.forEach((str, indx2) => {
                    if (!rows.hasOwnProperty(indx2)) {
                        rows.push([])
                    }
                    rows[indx2].push(str)

                })

            })

            setFilas(rows)
        }
    }, [tabla])


    useImperativeHandle(ref, () => celdasObj.current)

    return filas ? <div className='w-full flex flex-col justify-center items-center text-center'>

        <div style={clampTable == 2 ? { fontSize: 'clamp(7px, 2vw, 18px)' } : undefined} className={`overflow-auto  grid ${formato} grid-rows-auto flex flex-col w-full text-center border-2 p-2`}>

            {
                //  <div className=" relative flex flex-row ">
                //  {
                filas[0].map((headerStr, indx) => {
                    return <div key={indx} className='Header border-2 p-2 bg-[#0c0c0e] w-full  '>
                        {headerStr.replace(/\s/g, '') == '' ? 'Sin dato.' : headerStr.trim()}
                    </div>
                })
                //    }
                //  </div>
            }
            {


                filas.map((row, indx) => {
                    if (indx != 0) {
                        return row.map((rowStr, rowindx) => {
                            let Celda: React.ComponentType<any> | null = null

                            const datoWs = filas[0][rowindx].replace(/\s+/g, '')

                            const key = `${datoWs}_${indx}`
                            celdasObj.current[key] = createRef<celdaProps>()

                            Celda = Equivalencias[datoWs] || EquivalenciasPersonal[datoWs] || Cell

                            return Celda ? <Celda key={rowindx} dato={rowStr ?? ''} ref={celdasObj.current[key]} celdasRf={celdasObj} fila={indx} /> : null

                        })
                    }
                })

            }

        </div>

    </div> : objetoType === 'string' ? <p className='text-center text-red-500 text-3xl'> {JSON.stringify(tabla)} </p> : <p className='text-center text-red-500 text-3xl'>Error desconocido. Intenta recargar la página.</p>

})
