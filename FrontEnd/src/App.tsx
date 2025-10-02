import { useEffect, useState } from 'react'
import './styles.css'

function App() {
  const [tablas, setTablas] = useState<{
    [key: string]: {
      [key: string]: string
    }
  } | null>(null)

  const [error, setError] = useState<string | null>(null)

  const path = window.location.pathname;
  const partes = path.split('/');
  const patente = partes[2] ?? 'vacio';

  console.log(patente)

  console.log(import.meta.env.VITE_BACKEND_URL)

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch(`${'https://plantillaqr-v2.onrender.com'}/obtenerDatos/${patente}`)
        const transformed = await data.json()

        console.log(transformed,'xd')

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
    <div className='w-[100%] min-h-[120vh] flex justify-center items-center flex-col bg-green-100'>
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

        <div className='w-full flex justify-center text-center hover:bg-slate-700  h-[10%] '>
          <div className='bg-amber- w-[80%] bg-slate-500 align-middle '>
            <a className='' target='_blank' href="https://docs.google.com/forms/d/e/1FAIpQLSdT5pZGXZr9oN59QETtl6DlRNxviv3vo09M2B3RLgy0auycRg/viewform?usp=sharing&ouid=114554944640707248727">Checklist control de vehículo</a>
          </div>
        </div>
      </div>

    </div>
  )
}

export default App
