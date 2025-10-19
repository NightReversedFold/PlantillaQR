
function mantenerDatosObjeto<T extends Record<string, any>>(obj: T, claves: string[]): Partial<T> {
    const newObj = {}

    claves.forEach((dato) => {
        newObj[dato] = obj[dato || ''] || ['']
    })

    return newObj
}

export { mantenerDatosObjeto }