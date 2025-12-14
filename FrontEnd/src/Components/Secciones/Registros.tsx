import { memo, useEffect, useReducer, useState } from "react"
import { backend } from "../../utility/vars"

const SelectBox = ({ modificador, filtroId, propiedad, valorPorDefecto, opciones }: {
    modificador: React.ActionDispatch<[action: filtrosAct]>
    filtroId: string
    opciones: string[]
    valorPorDefecto: string | null | undefined
    propiedad: filtroPropiedades
}) => {

    return <div className="flex flex-col">
        <select value={valorPorDefecto || ''} onChange={(e) => {
            modificador({
                accion: 'modify',
                propiedad,
                id: filtroId,
                nuevoValor: e.currentTarget.value
            })
        }} className="max-w-auto h-10 p-2 border">
            <option value={''} selected />

            {opciones.map((val) => {
                return <option value={val} key={val} className="bg-black">
                    {val}
                </option>
            })}
        </select>

    </div>
}

type filtro = {
    patente?: string,
    cargo?: string,
    nombre?: string,
    rut?: string,
    evento?: string,
    fecha_inicio?: string,
    fecha_final?: string
}

type filtroPropiedades = 'patente' | 'cargo' | 'nombre' | 'rut' | 'evento' | 'fecha_inicio' | 'fecha_final'

interface filtrosAdd {
    accion: 'add'
    id: string
}

interface filtrosDelete {
    accion: 'delete'
    id: string
}

interface filtrosModify {
    accion: 'modify'
    id: string
    propiedad: filtroPropiedades
    nuevoValor: string
}

type filtrosAct = filtrosAdd | filtrosDelete | filtrosModify

const handleFiltros = (state: Record<string, filtro>, action: filtrosAct) => {
    switch (action.accion) {
        case 'add':
            return action?.id ? {
                ...state, [action.id]: {
                    patente: '',
                    cargo: '',
                    nombre: '',
                    rut: '',
                    evento: '',
                    fecha_inicio: '',
                    fecha_final: ''
                }
            } : state

            break;
        case 'delete':
            if (!action?.id) { return state }

            const withoutFl = { ...state }
            delete withoutFl[action.id]

            return withoutFl

            break;
        case 'modify':
            if (!action?.id || !action.propiedad) { return state }
            const toMod = { ...state }
            const filtro = toMod[action.id]

            filtro[action.propiedad] = action.nuevoValor
            return toMod

    }
}

export default () => {
    const [cabeceras, setCabeceras] = useState<{
        patente: string[]
        cargo: string[]
        nombre: string[]
        rut: string[]
        evento: string[]

    } | null>(null)

    const [msg, setMsg] = useState<string | null>(null)

    const [filtros, dispatchFiltros] = useReducer(handleFiltros, {})

    const Filtro = memo(({ newId }: { newId: string }) => {
        if (!cabeceras) { return }

        return <>
            {Object.entries(cabeceras).map(([cab, cabecerasArr], indx) => {
                return <SelectBox valorPorDefecto={
                    filtros.hasOwnProperty(newId) ? filtros[newId][cab as filtroPropiedades] : null
                } propiedad={cab as filtroPropiedades} filtroId={newId} modificador={dispatchFiltros} key={indx} opciones={cabecerasArr} />
            })}

            <input value={
                filtros.hasOwnProperty(newId) ? filtros[newId]['fecha_inicio'] : ''
            } onChange={(e) => {
                dispatchFiltros({
                    accion: 'modify',
                    propiedad: 'fecha_inicio',
                    id: newId,
                    nuevoValor: e.currentTarget.value
                })
            }} className="bg-white text-black border-black border" type="date" min="2025-11-01" ></input>

            <input value={
                filtros.hasOwnProperty(newId) ? filtros[newId]['fecha_final'] : ''
            } onChange={(e) => {
                dispatchFiltros({
                    accion: 'modify',
                    propiedad: 'fecha_final',
                    id: newId,
                    nuevoValor: e.currentTarget.value
                })
            }} className="bg-white text-black border-black border" type="date" min="2025-11-01"></input>

            <button onClick={() => {
                dispatchFiltros(
                    { accion: 'delete', id: newId }
                )
            }} className="hover:bg-red-600 max-w-auto h-10 p-2 border">
                Eliminar
            </button>
        </>
    })

    useEffect(() => {
        async function obtenerCabeceras() {
            try {
                const cabeceras = await fetch(`${backend}/registros/cabecerasUnicasDeDBUsuarios`)
                const js = await cabeceras.json()

                console.log(js)
                if (js) {
                    setCabeceras(js)
                }
            } catch (e) {
                setMsg('Algo salió mal al intentar obtener las opciones de los registros; intentando de nuevo...')

                setTimeout(() => {
                    obtenerCabeceras()
                }, 1000);

            }
        }

        obtenerCabeceras()
    }, [])

    useEffect(() => {
        if (cabeceras) {
            console.log(cabeceras)
            setMsg(null)
        }
    }, [cabeceras])

    useEffect(() => {
        console.log(filtros)
    }, [filtros])

    return <div className="bg-[#030303] flex flex-col justify-center items-center h-[100vh] w-[100vw] text-white">
        {cabeceras ? <>
            <h1 className="text-4xl mb-10">Registros</h1>
            <div className=" border break-all text-white max-w-auto text-center flex flex-col gap-y-5 p-2">
                <h2 className="text-3xl">Filtros</h2>

                <div className="w-full flex justify-end gap-x-5">
                    <button onClick={() => {

                        const newId = crypto.randomUUID().split('-')[0]

                        dispatchFiltros({ accion: 'add', id: newId })

                    }} className="p-2 border cursor-auto">
                        Agregar filtro
                    </button>
                    <button onClick={async () => {
                        const res = await fetch(`${backend}/registros/descargarTXT`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ filtros })
                        });

                        const js = await res.json();

                        const blob = new Blob([js.txt], { type: "text/plain;charset=utf-8" });
                        const url = URL.createObjectURL(blob);

                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "registros.txt";
                        a.click();

                        URL.revokeObjectURL(url);
                    }} className="p-2 border">
                        Descargar registros
                    </button>
                </div>

                <div className="grid grid-cols-8 gap-x-3 ">
                    {Object.keys({ ...cabeceras, 'fecha de inicio': [], 'fecha final': [], '': [] }).map((cabecera) => {
                        return <h2 className="text-2xl mb-2">{cabecera}</h2>
                    })}

                    {Object.entries(filtros).map(([idFiltro], indx) => {
                        return <Filtro key={indx} newId={idFiltro} />
                    })}
                </div>

            </div>
        </> : msg ? <p className="text-2xl">{msg}</p> : null
        }
    </div >
}