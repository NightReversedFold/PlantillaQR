import UsersHandler from "../ComponentesDB/UsersHandler"
import Foter from "../Diseño/Foter"

export default () => {
    return <div className="bg-[#030303]">
        <div className="bg-[#030303] min-h-[100vh] w-[100%]">
            <div className="flex flex-col justify-center w-full h-full py-20 items-center text-white">

                <div className="mt-20">
                    <UsersHandler />

                </div>
            </div>

        </div>
        <Foter />

    </div>
}