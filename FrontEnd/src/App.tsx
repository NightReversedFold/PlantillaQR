import { useEffect, useState } from 'react'
import './styles.css'

function App() {
  const [tablas, setTablas] = useState<{
    [key: string]: {
      [key: string]: string
    }
  } | null>(null)

  const [error, setError] = useState<Error | null>(null)

  const path = window.location.pathname;
  const partes = path.split('/');
  const patente = partes[2] ?? 'vacio';

  console.log(patente)

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch(`http://localhost:3000/obtenerDatos/${patente}`)
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

  }, [])

  return (
    <div className='w-[100%] h-[100vh] flex justify-center items-center flex-col bg-green-100'>
      <h1 className='text-3xl sm:text-5xl text-center mb-5'>Información del vehiculo</h1>

      <div className='w-[90%] h-[85%]  bg-sky-900 text-white p-5 flex  flex-col items-center justify-center gap-y-10'>

        {

          tablas ?

            Object.keys(tablas).map((Tabla: string, indx) => {
              return typeof tablas[Tabla] == 'object' ? <div className='w-full '>
                <h2 className='text-2xl text-center w-full mb-5'>{Tabla}</h2>
                <div key={indx} style={{ fontSize: 'clamp(7px, 2vw, 18px)' }} className={` break-words text-center grid ${Tabla == 'Expeditor' ? 'grid-cols-5' : Tabla == 'Taller' ? 'grid-cols-4' : null} grid-rows-1 border-2 p-2`}>

                  {Object.keys(tablas[Tabla]).map((dato, indx2) => {
                    return <div key={indx2} className='border-2 p-2 align-middle bg-gray-400'>
                      {dato.replace(/\s/g, '') == '' ? 'Sin dato.' : dato}
                    </div>
                  })}

                  {Object.keys(tablas[Tabla]).map((dato, indx2) => {
                    let hayDato = tablas[Tabla][dato].replace(/\s/g, '') != ''

                    return <div key={indx2} className={`border-2 p-2 align-middle ${hayDato?'text-white':'text-red-400'}`}>
                      {hayDato ? tablas[Tabla][dato]:'Sin dato.'}
                    </div>
                  })}
                </div>
              </div> : typeof tablas[Tabla] == 'string' ? <p className='text-center text-red-500 text-3xl'>{tablas[Tabla]}</p > : <p className='text-center text-red-500 text-3xl'>'Error desconocido. Intenta recargar la página.'</p>

            }) : error ? <p className='text-center text-red-500 text-3xl'>
              {error}
            </p> : 'Cargando datos...'
        }
      </div>

    </div>
  )
}

export default App
