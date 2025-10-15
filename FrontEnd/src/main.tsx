import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Error from './Components/Error.tsx';

import Equipos from './Components/Secciones/Equipos';
import Personas from './Components/Secciones/Personas';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([{
  path: '/',
  errorElement: <Error />
}, {
  path: 'Equipos/:patente',
  element: <Equipos />
}, {
  path: 'Personal/:rut',
  element: <Personas />
}], {
  basename: '/PlantillaQr'

})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
