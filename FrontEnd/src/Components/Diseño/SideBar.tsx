import Logo from '../Diseño/Logo'

export default ({
    setSideBar,
    setModoTablas,
    modoTablas
}:{
    setSideBar:React.Dispatch<React.SetStateAction<boolean>>
    setModoTablas:React.Dispatch<React.SetStateAction<number>>
    modoTablas:number
}) => {

    return <div className="flex w-[100%] z-1 h-[100vh] fixed left-0 top-0 border-r-2">
        <div className="left-0 w-40 h-[100%] bg-[#202020]">
            <div className='pt-10'>
                <Logo />
            </div>

            <div className='w-full h-full mt-15'>
                <div className='w-full min-h-20 p-2 flex flex-row' >
                    <p onClick={()=>{
                         setModoTablas((last) => {
                            return last + 1 > 2 ? 1 : last + 1
                        })
                    }} className='bg-blue-500 rounded-2xl border-2 p-2 text-center' style={{fontSize: 'clamp(7px, 3vw, 18px)'}} >
                        Modo de tablas: {modoTablas == 1 ? 'Normal' : 'Agrandadas'}
                    </p>
                </div>
            </div>
        </div>
        <div onClick={(()=>{
            setSideBar(false)
        })} className="w-[100%] h-[100%] bg-black opacity-20">

        </div>
    </div>
}