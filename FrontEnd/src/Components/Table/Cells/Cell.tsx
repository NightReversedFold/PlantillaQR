import { useImperativeHandle, forwardRef, useState } from "react"

export type celdaProps = {
    dato?:string,
}

type bgColor = `bg-${string}`
type textColor = `text-${string}`

export type objetoCelda = {
    bgColor : (color:bgColor) => void
    textColor : (color:textColor) => void

}

export default forwardRef<objetoCelda,celdaProps>(({dato},ref) => {

    console.log(typeof dato,dato,dato == '','CELDA')

    const [color,setColor] = useState<textColor>('text-white')
    const [bgColor,setBgColor] = useState<bgColor | null>(null)

    useImperativeHandle(ref,()=>({
        bgColor: (color) => {
            setBgColor(color)
        },
        textColor: (color) =>{
            setColor(color)
        }
    }))

    return <div className={`Value w-full ${bgColor} min-h-20 border-2 p-2 align-middle ${typeof dato === 'string'? dato.replace(/\s/g, '') != '' ? color : 'text-red-400':color}`} >
        {typeof dato === 'string' ? dato != '' ? dato.trim() : 'Sin dato.':null}
    </div>
})