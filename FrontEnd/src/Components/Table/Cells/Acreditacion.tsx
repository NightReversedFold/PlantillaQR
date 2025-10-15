import { useRef, useState,forwardRef, useImperativeHandle, useEffect } from "react"
import Cell from "./Cell"

import type {objetoCelda } from "./Cell"

type objAcreditado = {
    AcreditarA: (valor:boolean)=>void
}

export default forwardRef<objAcreditado>((_,ref) => {
    const celda = useRef<objetoCelda | null>(null)

    const [acreditado,setAcreditado] = useState(false)

    useImperativeHandle(ref,()=>({
        AcreditarA:(valor:boolean)=>{
            setAcreditado(valor)
        }
    }))

    useEffect(()=>{
        celda.current?.bgColor(`${acreditado? 'bg-green-500':'bg-red-500'}`)
    },[acreditado])

    return <Cell ref={celda} />
})