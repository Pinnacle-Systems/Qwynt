import { useState } from "react";
import secureLocalStorage from "react-secure-storage";

const PopUp = ({
  setIsPrintOpen, onClose, setPrintModalOpen, nextprocess, formclose, syncFormWithDb, inputRef, setId
}) => {




  return (
    <div id='' className="flex flex-col   ">
      <div className="md:flex md:items-center bg-gray-500  h-[60px]">
        <div className="heading text-center md:mx-10 ">
          Would you like to view the Invoice  against  this transaction?
        </div>

      </div>

      <div className="md:flex md:justify-around items-center p-5 h-[40%] border  rounded-lg shadow-md">
        <div>
          <button className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            onClick={() => {
              onClose()
              setPrintModalOpen(true)


            }}
          >
            YES
          </button>
        </div>
        <div>
          <button className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            onClick={() => {
              setIsPrintOpen(false)
              if (nextprocess == "close") {
                formclose()
              } else {
                setId("")
                syncFormWithDb(undefined)
                inputRef.current?.focus();
              }
            }}

          >
            NO
          </button>
        </div>
      </div>



    </div>
  )
}

export default PopUp