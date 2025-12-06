import { useEffect, useState } from "react"

const SelectBox = ({ estado, opciones }: {
    estado: React.Dispatch<React.SetStateAction<string | null>>
    opciones: string[]
}) => {
    return <select onChange={(e) => {
        estado(e.currentTarget.value)
    }} className="max-w-20 h-10 p-2 border">
        {opciones.map((val) => {
            return <option value={val} key={val}>
                {val}
            </option>
        })}
    </select>
}

export default () => {
    const [patente, setPatente] = useState<string | null>(null)

    useEffect(() => {
        console.log(patente)
    }, [patente])

    return <div className="bg-[#030303] flex flex-col justify-center items-center h-[100vh] w-[100vw] text-white">
        <h1 className="text-4xl mb-10">Registros</h1>
        <div className=" border break-all text-white max-w-100 text-center flex flex-col gap-y-5 p-2">
            <h2 className="text-2xl">Filtros</h2>

            <div className="w-full flex  justify-end">
                <button className="p-2 border">
                    Decargar registros
                </button>
            </div>

            <div className="flex flex-auto gap-x-3 ">
                <SelectBox estado={setPatente} opciones={[
                    'hola1', 'hola2'
                ]} />
                <SelectBox estado={setPatente} opciones={[
                    'hola1', 'hola2'
                ]} />
                <SelectBox estado={setPatente} opciones={[
                    'hola1', 'hola2'
                ]} />
                <SelectBox estado={setPatente} opciones={[
                    'hola1', 'hola2'
                ]} />
            </div>

        </div>
    </div>
}