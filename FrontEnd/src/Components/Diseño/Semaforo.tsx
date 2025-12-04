export default () => (
    <div className='flex flex-col gap-y-3 mb-10'>
        <div className='flex flex-row '>
            <div className='size-6 bg-blue-500'> </div>
            <p className='pl-2'>Revisar dato</p>
        </div>

        <div className='flex flex-row '>
            <div className='size-6 bg-red-500'> </div>
            <p className='pl-2'>Caducado</p>
        </div>
        <div className='flex flex-row '>
            <div className='size-6 bg-yellow-500'> </div>
            <p className='pl-2'>Apunto de caducar</p>
        </div>
        <div className='flex flex-row '>
            <div className='size-6 bg-green-600'> </div>
            <p className='pl-2'>Vigente</p>
        </div>
    </div>)