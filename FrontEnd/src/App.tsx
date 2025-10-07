import { useEffect, useRef, useState } from 'react'
import './styles.css'


import { io, Socket } from "socket.io-client";
import Table from './Components/Table';

import type { columnsType } from './Components/Table';


const parseFecha = (fecha: string): Date => {
  // mes, dia, año --> año, mes, dia

  const [mes, dia, anio] = fecha.split('/').map(Number)

  return new Date(anio, mes - 1, dia)
}

const setElementToRed = (elment: HTMLDivElement) => {
  elment.classList.remove('text-green-500')
  elment.classList.remove('border-green-500')
  elment.classList.remove('text-white')

  elment.classList.add('text-red-400')
  elment.classList.add('border-red-400')
}

const setElementToGreen = (elment: HTMLDivElement) => {
  elment.classList.remove('text-red-400')
  elment.classList.remove('border-red-400')
  elment.classList.remove('text-white')

  elment.classList.add('text-green-500')
  elment.classList.add('border-green-500')
}


const obtenerRestaDeFechasEnDias = (fecha: Date) => {
  console.log(fecha)

  const today = new Date()

  const result = (fecha.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)

  return result
}

function App() {
  const [tablas, setTablas] = useState<{
    [key: string]: Record<string, string[]>

  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const socket = useRef<Socket | null>(null)

  const [excelActaulizado, setActualizarExcel] = useState<boolean>(false)
  const [clampTable, setClampTable] = useState<boolean>(false)

  const columnasExpeditor = useRef<columnsType>({})
  const columnasTaller = useRef<columnsType>({})
  const columnasChecklist = useRef<columnsType>({})

  const path = window.location.pathname;
  const partes = path.split('/');
  const patente = partes[2] ?? 'vacio';

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

    const res = columnasExpeditor.current?.['Fecha Expiración']
    const header = res?.querySelector<HTMLDivElement>('.Header')

    if (res) {
      res.querySelectorAll('.Value').forEach((valor, indx) => {
        if (valor.textContent) {
          const result = obtenerRestaDeFechasEnDias(parseFecha(valor.textContent.trim()))

          if (result <= 4) {
            setElementToRed(valor as HTMLDivElement)

            if (header) {
              setElementToRed(header)
            }

          } else {
            valor?.classList.remove('text-red-400')
            valor?.classList.remove('border-red-400')

            header?.classList.remove('text-red-400')
            header?.classList.remove('border-red-400')
          }

          const acreditacionPadre = columnasExpeditor.current?.['Acreditado']

          const acreditacion = acreditacionPadre?.querySelector(`.Acreditado_${indx}`)

          console.log('ACREDITACIOOOOOON', acreditacion)
          if (acreditacion) {
            if (result <= 0) {

              acreditacion.classList.add('bg-red-500')
              acreditacion.classList.remove('bg-green-500')

              acreditacion.textContent = ' '
              setElementToRed(acreditacion as HTMLDivElement)

            } else {

              acreditacion.classList.add('bg-green-500')
              acreditacion.classList.remove('bg-red-500')

              acreditacion.textContent = ' '
              setElementToGreen(acreditacion as HTMLDivElement)


            }
          }
        }

      });
    }


    const res3 = columnasExpeditor.current?.['Fecha Permiso Circulacion']
    const header3 = res3?.querySelector<HTMLDivElement>('.Header')

    res3?.querySelectorAll('.Value').forEach((valor) => {
      if (valor.textContent) {
        const result = obtenerRestaDeFechasEnDias(parseFecha(valor.textContent.trim()))

        if (result <= 4) {
          setElementToRed(valor as HTMLDivElement)

          if (header3) {
            setElementToRed(header3)
          }

        } else {
          valor?.classList.remove('text-red-400')
          valor?.classList.remove('border-red-400')

          header3?.classList.remove('text-red-400')
          header3?.classList.remove('border-red-400')
        }
      }
    })

    const res4 = columnasExpeditor.current?.['Fecha Revision Tecnica']
    const header4 = res4?.querySelector<HTMLDivElement>('.Header')

    res4?.querySelectorAll('.Value').forEach((valor) => {
      if (valor.textContent) {
        const result = obtenerRestaDeFechasEnDias(parseFecha(valor.textContent.trim()))

        if (result <= 4) {
          setElementToRed(valor as HTMLDivElement)

          if (header4) {
            setElementToRed(header4)
          }

        } else {
          valor?.classList.remove('text-red-400')
          valor?.classList.remove('border-red-400')

          header4?.classList.remove('text-red-400')
          header4?.classList.remove('border-red-400')
        }
      }
    })

    const proxMantencion = columnasTaller.current?.['PROXIMA MANTENCION (KMS/HRS)']
    const fechaProxMantencion = proxMantencion?.querySelector<HTMLDivElement>('.Value')

    const kilometraje = columnasChecklist.current?.['Kilometraje']
    const valorKilometraje = kilometraje?.querySelector<HTMLDivElement>('.Value')

    console.log(kilometraje, valorKilometraje, proxMantencion)
    if (fechaProxMantencion && valorKilometraje) {
      if (fechaProxMantencion.textContent && valorKilometraje.textContent) {
        const result = (+fechaProxMantencion.textContent.replace(/,/g, '') - +valorKilometraje.textContent.replace(/,/g, ''))
        console.log(result, 'PROXIMA MANTENCION')
        const headerProxMantencion = proxMantencion?.querySelector<HTMLDivElement>('.Header')

        if (result <= 500) {

          if (headerProxMantencion) {
            setElementToRed(headerProxMantencion)
          }

          setElementToRed(fechaProxMantencion)

        }else{
            fechaProxMantencion?.classList.remove('text-red-400')
            fechaProxMantencion?.classList.remove('border-red-400')
            
            headerProxMantencion?.classList.remove('text-red-400')
            headerProxMantencion?.classList.remove('border-red-400')
          
        }
      }

    }


  }, [tablas])

  useEffect(() => {

    (async () => {
      try {
        const data = await fetch(`${'https://plantillaqr-v2.onrender.com'}/obtenerDatos/${patente}`)
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
    <div className='w-[100%]  min-h-[120vh] flex justify-center items-center flex-col bg-[#1f1f21] text-white'>

      <div onClick={() => { setClampTable(!clampTable) }} className='sm:hidden max-w-50 max-h-50 bg-sky-950 p-3 text-center border-1 hover:bg-slate-800 mb-20'>Modo de tablas: {clampTable ? 'amplias' : 'agrandadas'}</div>

      <h1 className='text-4xl sm:text-5xl text-center mb-5'>Información del vehiculo</h1>

      <div className='w-[90%] h-[85%]  border-1 text-white p-5 flex  flex-col items-center justify-center gap-y-10'>

        {

          tablas ?
            <>
              <h2 className='text-2xl '>Expeditor</h2>
              <Table ref={columnasExpeditor} formato={!clampTable ? 'grid-cols-[auto_auto_auto_auto_auto_minmax(150px,auto)_auto]' : 'grid-cols-[auto_auto_auto_auto_auto_auto_auto]'} objetoType={typeof tablas.Expeditor as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Expeditor} />
              <h2 className='text-2xl '>Taller</h2>
              <Table ref={columnasTaller} formato={!clampTable ? 'grid-cols-[auto_auto_auto_auto]' : 'grid-cols-4'} objetoType={typeof tablas.Taller as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Taller} />

              <div className='flex flex-row'>
                <h2 className='text-2xl '>Checklist</h2>
              </div>

              <div className='w-full flex justify-center text-center h-[10%] '>
                <div className='bg-amber- w-[80%] bg-slate-500 align-middle  hover:bg-slate-700 border-1'>
                  <a className='' target='_blank' href="https://docs.google.com/forms/d/e/1FAIpQLSdBpP49VQ5nEcqrnTh-LT_qLAPmCo6nZD4YjHmRGp_jVUcyuw/viewform?usp=header">Checklist control de vehículo</a>
                </div>
              </div>

              <Table ref={columnasChecklist} formato={!clampTable ? 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_minmax(320px,auto)_minmax(150px,auto)]' : 'grid-cols-[auto_auto_auto_auto_auto_auto_auto_minmax(300px,auto)_minmax(250px,auto)]'} objetoType={typeof tablas.Checklist as 'object' | 'string'} clampTable={clampTable} tabla={tablas.Checklist} />

            </>

            : error ? <p className='text-center text-red-500 text-3xl'>
              {error}
            </p> : 'Cargando datos...'
        }

      </div>

    </div>
  )
}

export default App
