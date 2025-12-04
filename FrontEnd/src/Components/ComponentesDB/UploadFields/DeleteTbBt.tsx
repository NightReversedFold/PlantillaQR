import { useEffect, useState } from "react";
import { backend } from "../../../utility/vars";
import type { msg } from "./UploadTypes";

export default ({tb}:{
    tb:string
}) => {

    const [msg, setMsg] = useState<msg>(null)

    useEffect(() => {
        setTimeout(() => {
            if (msg) {
                setMsg(null)
            }
        }, 1500);
    }, [msg])

    return msg ? <p>{msg}</p> : <div onClick={async () => {
        const res = await fetch(`${backend}/DeleteTb/${tb}`, {
            method: "DELETE"
        });

        const r = await res.json()

        console.log(r)

        setMsg(r.msg)

    }} className="w-1/2 mx-5 border-2 h-10 bg-red-500 mt-10">
        Borrar datos de la tabla
    </div>
}