
import { useEffect, useRef, useState } from 'react'
import Table from '../Table/Table'
import { Socket } from 'socket.io-client'

import { useParams } from 'react-router-dom'

import { io } from 'socket.io-client'

import { createContext } from 'react'
import { backend } from '../../utility/vars'
import Info, { type popOutObj } from '../Diseño/info'
import Logo from '../Diseño/Logo'
import SideBar from '../Diseño/SideBar'
import Options from '../../assets/Options.png'
import Foter from '../Diseño/Foter'

export const contextoExcel = createContext<boolean>(false)
export const contextoPopoutPersonal = createContext<popOutObj | null>(null)

export default function Equipos() {

    const { rut } = useParams<{
        rut: string
    }>()

    const [tablas, setTablas] = useState<{
        [key: string]: Record<string, string[]>

    } | null>(null)
    const popout = useRef<popOutObj | null>(null)
    const [sideBarVisible, setSideBarVisible] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const socket = useRef<Socket | null>(null)

    const [imagenPersonal, setimagenPersonal] = useState<string | null>(null)

    const [excelActaulizado, setActualizarExcel] = useState<boolean>(false)
    const [clampTable, setClampTable] = useState<number>(1)

    useEffect(() => {

        socket.current = io(backend)

        socket.current.on('actualizarExcelPersonal', () => {
            setActualizarExcel(last => !last)
        })

        return () => {
            socket.current?.disconnect()
        }
    }, [])

    console.log()

    useEffect(() => {
        (async () => {
            try {
                const data = await fetch(`${backend}/obtenerDatos/imagen/personal/${rut}.png`)

                if (data.ok) {
                    const blob = await data.blob()

                    setimagenPersonal(blob ? URL.createObjectURL(blob) : null)

                }

            } catch (e) {

            }

        })()
    }, [rut])


    useEffect(() => {

        (async () => {
            try {
                console.log(rut)
                const data = await fetch(`${backend}/obtenerDatos/personal/${rut}`)
                const transformed = await data.json()
                console.log(data, transformed)

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
        <div className='bg-[#131516]'>
            <div className='w-[100%] pt-10 min-h-[100vh] flex justify-center items-center flex-col bg-[#131516] text-white'>
                <div className='mb-25'>
                    <Logo />
                </div>

                <img onClick={
                    () => {
                        setSideBarVisible(last => !last)

                    }
                } className='z-3 fixed top-0 left-0 w-5 h-5 ml-2 mt-2' src={Options} alt="" />
                {sideBarVisible ? <SideBar modoTablas={clampTable} setModoTablas={setClampTable} setSideBar={setSideBarVisible} /> : null}


                {tablas ? <>
                    <div onClick={() => {
                        setClampTable((last) => {
                            return last + 1 > 2 ? 1 : last + 1
                        })
                    }} className='sm:hidden max-w-50 max-h-50 bg-sky-950 p-3 text-center border-1 hover:bg-slate-800 mb-20'>Modo de tablas: {clampTable == 1 ? 'Normal' : 'Agrandadas'}</div>

                    <h1 className='text-4xl sm:text-5xl text-center mb-10'>Información del personal</h1>


                </> : null}


                <div className='w-[90%] h-[85%]  border-1 text-white p-5 flex  flex-col items-center justify-center gap-y-10'>

                    {

                        tablas ?
                            <contextoPopoutPersonal.Provider value={popout.current}>
                                <contextoExcel.Provider value={excelActaulizado}>
                                    <>
                                        {<Info ref={popout} />}

                                        {imagenPersonal ? <img src={imagenPersonal} alt="" /> : null}

                                        <h2 className='text-4xl '>Expeditor</h2>

                                        <Table formato={clampTable == 1 ? 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto_auto_auto_auto]' : clampTable == 2 ? 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto_auto_auto_auto]' : 'grid-cols-[auto]'} objetoType={typeof tablas.Persona as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Persona as any} />

                                    </>
                                </contextoExcel.Provider>
                            </contextoPopoutPersonal.Provider>
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