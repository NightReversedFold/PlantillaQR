
import React, { createRef, useEffect, useRef, useState } from 'react'
import Table, { type celdasObj } from '../Table/Table'
import { Socket } from 'socket.io-client'

import { useParams } from 'react-router-dom'

import { io } from 'socket.io-client'

import { createContext } from 'react'

import { backend } from '../../utility/vars'
import type { contenido } from '../Table/Cells/Cell'
import Info, { type popOutObj } from '../../Components/Diseño/info'
import Logo from '../Diseño/Logo'
import SideBar from '../Diseño/SideBar'

import Options from '../../assets/Options.png'
import Foter from '../Diseño/Foter'

type tablaCIDC = Record<string, React.RefObject<celdasObj | null>>


type tablasEstado = {
    [key: string]: Record<string, string[]>

} | null

const checkListLinks = {
    'TDXR19': 'https://docs.google.com/forms/d/e/1FAIpQLSdBpP49VQ5nEcqrnTh-LT_qLAPmCo6nZD4YjHmRGp_jVUcyuw/viewform?usp=header',
    'TDXL15': 'https://docs.google.com/forms/d/e/1FAIpQLScZlm_dLPHfrOO3IoUO5n2jbXQgkZVweuBtWeNgbPN8EoJ2YQ/viewform?usp=header',
    'TZTZ54': 'https://docs.google.com/forms/d/e/1FAIpQLScZlm_dLPHfrOO3IoUO5n2jbXQgkZVweuBtWeNgbPN8EoJ2YQ/viewform?usp=header'
}

export const contextoExcel = createContext<boolean>(false)
export const contextoObtenerTablas = createContext<[React.RefObject<tablaCIDC>, tablasEstado] | null>(null)
export const contextoCeldaActualizada = createContext<[contenido, React.Dispatch<React.SetStateAction<contenido>>] | null>(null)
export const contextoPopout = createContext<popOutObj | null>(null)

export default function Equipos() {

    const [imagenEquipo, setImagenEquipo] = useState<string | null>(null)

    const { patente } = useParams<{
        patente: string
    }>()

    const [tablas, setTablas] = useState<tablasEstado | null>(null)
    const [sideBarVisible, setSideBarVisible] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const socket = useRef<Socket | null>(null)

    const [celdaActualizada, setCeldaActualizada] = useState<contenido | null>()

    const [excelActaulizado, setActualizarExcel] = useState<boolean>(false)
    const [clampTable, setClampTable] = useState<number>(1)

    const popout = useRef<popOutObj | null>(null)

    const tablasConInstanciasDeCeldas = useRef<tablaCIDC>({
        Taller: createRef<celdasObj>(),
        Expeditor: createRef<celdasObj>(),
        Checklist: createRef<celdasObj>()
    })

    useEffect(() => {
        (async () => {
            try {
                const data = await fetch(`${backend}/obtenerDatos/imagen/equipos/${patente}.png`)

                if (data.ok) {
                    const blob = await data.blob()

                    setImagenEquipo(blob ? URL.createObjectURL(blob) : null)

                }

            } catch (e) {

            }

        })()
    }, [patente])

    useEffect(() => {

        socket.current = io(backend)

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
                const data = await fetch(`${backend}/obtenerDatos/equipos/${patente}`)
                const transformed = await data.json()

                console.log(transformed)

                if (!data.ok) {
                    setError(transformed.error || 'Error desconocido. Intenta recargar la página.')

                    return
                }

                setTablas(transformed)

            } catch (e) {

            }
        })()


    }, [excelActaulizado])

    return (
        <div className='bg-[#131516]'>
            <div className='w-[100%] pt-10 min-h-[120vh] flex justify-center items-center flex-col bg-[#131516] text-white'>
                <div className='mb-25'>
                    <Logo />
                </div>

                <img onClick={
                    () => {
                        setSideBarVisible(last => !last)

                    }
                } className='z-3 fixed top-0 left-0 w-5 h-5 ml-2 mt-2' src={Options} alt="" />

                {sideBarVisible ? <SideBar modoTablas={clampTable} setModoTablas={setClampTable} setSideBar={setSideBarVisible} /> : null}

                {tablas ?
                    <>

                        <h1 className={` text-4xl sm:text-5xl text-center mb-10`}>Información del vehículo</h1>

                    </>
                    : null}

                <div className='w-[90%] h-[85%]  border-1 text-white p-5 flex  flex-col items-center justify-center gap-y-10'>

                    {

                        tablas ?
                            <contextoPopout.Provider value={popout.current}>
                                <contextoCeldaActualizada.Provider value={[celdaActualizada, setCeldaActualizada]}>
                                    <contextoObtenerTablas.Provider value={[tablasConInstanciasDeCeldas, tablas]}>
                                        <contextoExcel.Provider value={excelActaulizado}>
                                            <>
                                                {<Info ref={popout} />}
                                                {imagenEquipo ? <img src={imagenEquipo} alt="" /> : null}

                                                <h2 className='text-4xl underline'>Expeditor</h2>

                                                <Table ref={tablasConInstanciasDeCeldas.current.Expeditor} formato={clampTable == 1 ? 'grid-cols-[auto_auto_auto_auto_auto_minmax(150px,auto)_auto_auto]' : clampTable == 2 ? 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto]' : 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto]'} objetoType={typeof tablas.Expeditor as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Expeditor as any} />

                                                <h2 className='text-4xl underline'>Taller</h2>
                                                <Table ref={tablasConInstanciasDeCeldas.current.Taller} formato={clampTable == 1 ? 'grid-cols-[auto_auto_auto_auto]' : clampTable == 2 ? 'grid-cols-4' : 'grid-cols-1'} objetoType={typeof tablas.Taller as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Taller as any} />

                                                <div className='flex flex-row'>
                                                    <h2 className='text-4xl underline'>Checklist</h2>
                                                </div>

                                                <div className='w-full flex justify-center text-center h-[10%] '>
                                                    <div className='bg-amber- w-[80%] bg-slate-500 align-middle  hover:bg-slate-700 border-1'>

                                                        {patente && patente.toUpperCase().trim() in checkListLinks ? <a className='' target='_blank' href={checkListLinks[patente as 'TDXR19']}>Checklist control de vehículo</a> : null}
                                                    </div>
                                                </div>

                                                <Table ref={tablasConInstanciasDeCeldas.current.Checklist} formato={clampTable == 1 ? 'grid-cols-[auto_auto_auto_auto_auto_auto_minmax(500px,500px)_auto]' : clampTable == 2 ? 'grid-cols-[auto_auto_auto_auto__auto_auto_minmax(500px,500px)_auto]' : 'grid-cols-[auto]'} objetoType={typeof tablas.Checklist as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Checklist as any} >

                                                </Table>


                                            </>
                                        </contextoExcel.Provider>
                                    </contextoObtenerTablas.Provider>

                                </contextoCeldaActualizada.Provider>

                            </contextoPopout.Provider>
                            : error ? <p className='text-center text-red-500 text-3xl'>
                                {error}
                            </p> : 'Cargando datos...'
                    }

                </div>

            </div>
            <Foter />

        </div>
    )
}