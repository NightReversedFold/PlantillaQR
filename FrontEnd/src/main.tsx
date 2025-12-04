import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Error from './Components/Error.tsx';

import Equipos from './Components/Secciones/Equipos';
import Personas from './Components/Secciones/Personas';

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './styles.css'
import DBHandler from './Components/Secciones/DBHandler.tsx';
import UploadExpeditor from './Components/ComponentesDB/UploadFields/UploadExpeditor.tsx';
import UploadPersonal from './Components/ComponentesDB/UploadFields/UploadPersonal.tsx';
import UploadTaller from './Components/ComponentesDB/UploadFields/UploadTaller.tsx';

const router = createBrowserRouter([{
  path: '/',
  errorElement: <Error />
}, {
  path: 'Equipos/:patente',
  element: <Equipos />
}, {
  path: 'Personal/:rut',
  element: <Personas />
}, {
  path: 'Upload/Expeditor',
  element: <UploadExpeditor />
}, {
  path: "Upload/Personal",
  element: <UploadPersonal />

}, {
  path: "Upload/Taller",
  element: <UploadTaller />

},{
  path:"UserH",
  element:<DBHandler/>
}], {
  basename: '/PlantillaQr'

})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
