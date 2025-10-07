import { useRef, forwardRef, useImperativeHandle, } from "react";

type tablaProps = {
    formato: string;
    objetoType: 'object' | 'string';
    clampTable: boolean;
    tabla: Record<string, string[]>;
}

export type columnsType = Record<string, HTMLDivElement | null>

export default forwardRef<columnsType, tablaProps>(({ formato, objetoType, clampTable, tabla }, ref) => {

    const columns = useRef<columnsType>({})

    useImperativeHandle(ref, () => columns.current);

    return objetoType === 'object' ? <div className='w-full flex flex-col justify-center items-center text-center'>

        <div style={clampTable ? { fontSize: 'clamp(7px, 2vw, 18px)' } : undefined} className={`overflow-auto w-full text-center grid ${formato} grid-rows-auto border-2 p-2`}>

            {Object.keys(tabla).map((dato, indx2) => {
                return <div key={indx2} className=" relative flex flex-col  " ref={(el) => { columns.current[dato] = el }}>
                    <div className='Header border-2 p-2 bg-[#0c0c0e] w-full h-25'>
                        {dato.replace(/\s/g, '') == '' ? 'Sin dato.' : dato.trim()}
                    </div>

                    {
                        tabla[dato] instanceof Array ? tabla[dato].map((datoFila, i) => {
                            return <div key={i} className={`Value ${dato.replace(/\s+/g, '')}_${i} w-full min-h-20 border-2 p-2 align-middle ${datoFila.replace(/\s/g, '') != '' ? 'text-white' : 'text-red-400'}`} >
                                {datoFila.replace(/\s/g, '') != '' ? datoFila.trim() : 'Sin dato.'}
                            </div>
                        }) : null
                    }
                </div>

            })}


        </div>

    </div> : objetoType === 'string' ? <p className='text-center text-red-500 text-3xl'> {tabla} </p> : <p className='text-center text-red-500 text-3xl'>Error desconocido. Intenta recargar la página.</p>

}
)