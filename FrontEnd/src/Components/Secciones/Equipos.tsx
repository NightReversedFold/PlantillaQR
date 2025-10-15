
import { useEffect, useRef, useState } from 'react'
import Table from '../Table/Table'
import { Socket } from 'socket.io-client'

import { useParams } from 'react-router-dom'

import { io } from 'socket.io-client'

import { createContext } from 'react'

import Semaforo from '../Diseño/Semaforo'

export const contextoExcel = createContext<boolean>(false)

export default function Equipos() {

    const [imagenEquipo, setImagenEquipo] = useState<string | null>(null)

    const { patente } = useParams<{
        patente: string
    }>()

    console.log()

    const [tablas, setTablas] = useState<{
        [key: string]: Record<string, string[]>

    } | null>(null)

    const [error, setError] = useState<string | null>(null)
    const socket = useRef<Socket | null>(null)

    const [excelActaulizado, setActualizarExcel] = useState<boolean>(false)
    const [clampTable, setClampTable] = useState<number>(1)


    useEffect(() => {
        (async () => {
            try {
                const data = await fetch(`${'https://plantillaqr-v2.onrender.com'}/obtenerDatos/imagen/${patente}.png`)

                if (data.ok) {
                    const blob = await data.blob()

                    setImagenEquipo(blob ? URL.createObjectURL(blob) : null)

                }

            } catch (e) {

            }

        })()
    }, [])

    useEffect(() => {

        socket.current = io('https://plantillaqr-v2.onrender.com')

        socket.current.on('actualizarExcel', () => {
            setActualizarExcel(last => !last)
        })

        return () => {
            socket.current?.disconnect()
        }
    }, [])

    useEffect(() => {

        (async () => {
            try {
                const data = await fetch(`${'https://plantillaqr-v2.onrender.com'}/obtenerDatos/equipos/${patente}`)
                const transformed = await data.json()


                if (!data.ok) {
                    setError(transformed.error || 'Error desconocido. Intenta recargar la página.')

                    return
                }

                console.log(transformed)
                setTablas(transformed)

            } catch (e) {

            }
        })()

    }, [excelActaulizado])


    return (
        <div className='w-[100%] pt-10  min-h-[120vh] flex justify-center items-center flex-col bg-[#1f1f21] text-white'>

            {tablas ?
                <>
                    <div onClick={() => {
                        setClampTable((last) => {
                            return last + 1 > 3 ? 1 : last + 1
                        })
                    }} className='sm:hidden max-w-50 max-h-50 bg-sky-950 p-3 text-center border-1 hover:bg-slate-800 mb-20'>Modo de tablas: {clampTable == 1 ? 'Normal' : clampTable == 2 ? 'Agrandadas' : 'Columnas'}</div>

                    <h1 className='text-4xl sm:text-5xl text-center mb-10'>Información del vehículo</h1>

                    <Semaforo />
                </>
                : null}



            <div className='w-[90%] h-[85%]  border-1 text-white p-5 flex  flex-col items-center justify-center gap-y-10'>

                {

                    tablas ?
                        <contextoExcel.Provider value={excelActaulizado}>
                            <>
                                {imagenEquipo ? <img src={imagenEquipo} alt="" /> : null}

                                <h2 className='text-2xl '>Expeditor</h2>

                                <Table formato={clampTable == 1 ? 'grid-cols-[auto_auto_auto_auto_auto_minmax(150px,auto)_auto_auto_auto]' : clampTable == 2 ? 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto]' : 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto]'} objetoType={typeof tablas.Expeditor as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Expeditor} />

                                <h2 className='text-2xl '>Taller</h2>
                                <Table formato={clampTable == 1 ? 'grid-cols-[auto_auto_auto_auto]' : clampTable == 2 ? 'grid-cols-4' : 'grid-cols-1'} objetoType={typeof tablas.Taller as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Taller} />


                                <div className='flex flex-row'>
                                    <h2 className='text-2xl '>Checklist</h2>
                                </div>

                                <div className='w-full flex justify-center text-center h-[10%] '>
                                    <div className='bg-amber- w-[80%] bg-slate-500 align-middle  hover:bg-slate-700 border-1'>
                                        <a className='' target='_blank' href="https://docs.google.com/forms/d/e/1FAIpQLSdBpP49VQ5nEcqrnTh-LT_qLAPmCo6nZD4YjHmRGp_jVUcyuw/viewform?usp=header">Checklist control de vehículo</a>
                                    </div>
                                </div>

                                <Table formato={clampTable == 1 ? 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_minmax(320px,auto)_minmax(150px,auto)]' : clampTable == 2 ? 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_minmax(300px,auto)_minmax(250px,auto)]' : 'grid-cols-[auto]'} objetoType={typeof tablas.Checklist as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Checklist} />


                            </>
                        </contextoExcel.Provider>

                        : error ? <p className='text-center text-red-500 text-3xl'>
                            {error}
                        </p> : 'Cargando datos...'
                }

            </div>

        </div>
    )
}