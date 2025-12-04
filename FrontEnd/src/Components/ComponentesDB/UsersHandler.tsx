import { useEffect, useState } from "react"
import { backend } from "../../utility/vars"
import CxLogo from "../Diseño/CxLogo"

export default () => {

    const [patente, setPatente] = useState<string>('')
    const [cargo, setCargo] = useState<string>('')
    const [nombre, setNombre] = useState<string>('')
    const [rut, setRut] = useState<string>('')
    const [correo, setCorreo] = useState<string>('')

    const [err, setErr] = useState<string | null>(null)

    const [userErr, setUserErr] = useState<string | null>(null)

    const [usuarios, setUsuarios] = useState<Record<string, string>[] | null>(null)


    useEffect(() => {
        if (err) {
            setTimeout(() => {
                setErr(null)
            }, 1500);
        }
    }, [err])

    useEffect(() => {
        async function obtenerUsuarios() {
            try {
                const res = await fetch(`${backend}/GetUsers`)

                const usuarios = await res.json()

                console.log(usuarios)
                if (usuarios) {
                    setUsuarios(usuarios)
                    return
                }
            } catch (e) {
                setUserErr('Algo salió mal al tratar de obtener los usuarios.')
            }
        }

        obtenerUsuarios()
    }, [])

    useEffect(() => {
        if (userErr) {
            setTimeout(() => {
                setUserErr(null)
            }, 1500);
        }
    }, [userErr])

    return <div className="bg-[#070707] flex flex-col items-center p-2 text-center">
        <CxLogo />

        <h2 className="text-3xl mb-5">Usuarios</h2>

        <div className="w-full flex flex-col items-center">

            <h2 className="mt-5 mb-5 text-2xl">Agregar usuario</h2>

            {err ? <p>{err}</p> : <form className="flex flex-row gap-2 text-black" onSubmit={async (e) => {
                e.preventDefault()

                try {
                    const res = await fetch(`${backend}/SetUsers`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ patente: patente.trim(), cargo: cargo.trim(), nombre: nombre.trim(), rut: rut.trim(), correo: correo.trim() }),
                    });

                    const js = await res.json()

                    console.log(js)

                    setErr(js.msg);

                    if (!res.ok) { return }

                    setUsuarios(last => {
                        if (last) {
                            return [
                                ...last, {
                                    indice: js.indice, patente, cargo, nombre, rut, correo
                                }
                            ]
                        }
                        return null
                    })

                    setPatente('')
                    setCargo('')
                    setNombre('')
                    setRut('')
                    setCorreo('')

                } catch (e) {
                    console.log(e)
                }

            }}>
                <div className="w-50 h-20 border-2 bg-green-300">
                    <input value={patente} onChange={(e) => setPatente(e.currentTarget.value)} placeholder="Patente asociado" className="text-center w-full h-full" type="text" />
                </div>
                <div className="min'w-20 h-20 border-2 bg-green-300">

                    <select className="text-center w-full h-full" onChange={(e) => {
                        setCargo(e.currentTarget.value);
                    }}>
                        <option hidden value="">Seleccionar cargo</option>

                        <option className="border-2 text-white bg-green-800" value="Adm.Contratos">Adm.Contratos</option>
                        <option className="border-2 text-white bg-green-800" value="Dueño">Dueño</option>
                        <option className="border-2 text-white bg-green-800" value="Usuario">Usuario</option>
                        <option className="border-2 text-white bg-green-800" value="Taller mecanico">Taller mecanico</option>
                        <option className="border-2 text-white bg-green-800" value="SoporteDGM">SoporteDGM</option>
                        <option className="border-2 text-white bg-green-800" value="SoporteDMH">SoporteDMH</option>
                        <option className="border-2 text-white bg-green-800" value="SoporteDCH">SoporteDCH</option>
                        <option className="border-2 text-white bg-green-800" value="SoporteDRT">SoporteDRT</option>

                    </select>

                </div>
                <div className="w-20 h-20 border-2 bg-green-300">
                    <input value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} placeholder="Nombre" className="text-center w-full h-full" type="text" required />

                </div>
                <div className="w-20 h-20 border-2 bg-green-300">
                    <input value={rut} onChange={(e) => setRut(e.currentTarget.value)} placeholder="Rut" className="text-center w-full h-full" type="text" required />

                </div>
                <div className="w-20 h-20 border-2 bg-green-300">
                    <input value={correo} onChange={(e) => setCorreo(e.currentTarget.value)} placeholder="Correo" className="text-center w-full h-full" type="email" required />

                </div>

                <button className="top-1/2 max-w-25 h-20 p-2 bg-green-700" type="submit" >
                    Agregar
                </button>
            </form>}

        </div>

        <div className="flex justify-center flex-col ">
            <h2 className="text-2xl text-center mt-5">Lista de usuarios</h2>

            <div className={`overflow-auto grid grid-cols-[auto_auto_auto_auto_auto_auto_auto] mt-10  grid-rows-auto w-full text-center  p-2`}>

                {['Indice', 'Patente', 'Cargo', 'Nombre', 'Rut', 'Correo', 'Borrar fila'].map((element, indx) => {
                    return <div key={indx} className='Header border-2 p-2 bg-[#0c0c0e] w-full  '>
                        {element}
                    </div>
                })}

                {usuarios ?

                    usuarios.map((row, rowIndx) => {
                        return [...Object.values(row), ''].map((str, indx2) => {
                            if (indx2 == 6) {
                                return <button key={indx2} onClick={async () => {
                                    const res = await fetch(`${backend}/DeleteUser/${row.indice}`, {
                                        method: "DELETE"
                                    });

                                    if (!res.ok) { return }

                                    const x = usuarios.filter((_, indx) => {
                                        return indx != rowIndx
                                    })

                                    setUsuarios(x)
                                }} className="text-3xl min-h-30 text-white border-2 hover:bg-red-500">
                                    X
                                </button>
                            }

                            str = String(str).trim() ? str : 'Sin dato.'

                            return <div key={indx2} className={`Relative w-full  min-h-30 border-2 p-2 align-middle ${str === 'Sin dato.' ? 'text-red-400' : str !== 'Sin dato.' && str ? 'text-white' : null}`}>
                                {str}
                            </div>
                        })
                    })
                    :
                    <p className="text-center w-full">Cargando usuarios...</p>}


            </div>
        </div>

    </div>
}