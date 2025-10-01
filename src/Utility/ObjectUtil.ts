
function mantenerDatosObjeto<T extends Record<string, any>>(obj: T, claves: string[]): Partial<T> {
    return Object.keys(obj).reduce<{
        [clave: string]: string
    }>((acc, currentValue) => {
        if (claves.includes(currentValue)) {
            acc[currentValue] = obj[currentValue]

        }
        return acc

    }, {}) as Partial<T>
}

export {mantenerDatosObjeto}