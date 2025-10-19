import React, { useRef, createRef, forwardRef, useImperativeHandle } from "react";

import type { celdaProps } from "./Cells/Cell";

import Cell from "./Cells/Cell";
import Acreditacion from "./Cells/Acreditacion";
import Expira from "./Cells/Expira";
import FechaExpiracion from "./Cells/FechaExpiracion";
import Observaciones from "./Cells/Observaciones";
import Kilometraje from "./Cells/Kilometraje";
import ProxMant from "./Cells/ProxMant";
import Apto from "./Cells/Apto";
import EquipoACargo from "./Cells/EquipoACargo";

const Equivalencias: Record<string, any> = {
    Acreditado: Acreditacion,
    FechaPermisoCirculacion: Expira,
    FechaRevisionTecnica: Expira,
    FechaExpiración: FechaExpiracion,
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
    'Equipoacargo':EquipoACargo
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

    useImperativeHandle(ref, () => celdasObj.current)

    return objetoType === 'object' ? <div className='w-full flex flex-col justify-center items-center text-center'>

        <div style={clampTable == 2 ? { fontSize: 'clamp(7px, 2vw, 18px)' } : undefined} className={`overflow-auto w-full text-center grid ${formato} grid-rows-auto border-2 p-2`}>

            {Object.keys(tabla).map((dato, indx2) => {
                return <div key={indx2} className=" relative flex flex-col ">
                    <div className='Header border-2 p-2 bg-[#0c0c0e] w-full min-h-55 '>
                        {dato.replace(/\s/g, '') == '' ? 'Sin dato.' : dato.trim()}
                    </div>

                    {
                        tabla[dato] instanceof Array ? tabla[dato].map((datoFila, i) => {
                            console.log(dato,datoFila)
                            let Celda: React.ComponentType<any> | null = null

                            const datoWs = dato.replace(/\s+/g, '')

                            const key = `${datoWs}_${i}`
                            celdasObj.current[key] = createRef<celdaProps>()

                            Celda = Equivalencias[datoWs] || EquivalenciasPersonal[datoWs] || Cell

                            return Celda ? <Celda key={i} dato={datoFila ?? ''} ref={celdasObj.current[key]} celdasRf={celdasObj} fila={i} /> : null

                        }) : null
                    }


                </div>

            })}


        </div>

    </div> : objetoType === 'string' ? <p className='text-center text-red-500 text-3xl'> {JSON.stringify(tabla)} </p> : <p className='text-center text-red-500 text-3xl'>Error desconocido. Intenta recargar la página.</p>

})
