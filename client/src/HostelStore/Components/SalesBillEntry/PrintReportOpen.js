import React from 'react'
import { DELETE } from '../../../icons'

const PrintReportOpen = ({setPrintModalOpen}) => {
  return (
    <div className='w-full'>
        <div className='mt-1 w-full text-center p-1 bg-blue-300 rounded-md font-bold'>
        YOU WANT TO PRINT 
        </div>
      
  <div className='flex justify-center gap-x-24 mt-4 '>
  <button className="w-24 p-2 text-xs bg-green-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
     onClick={() => {
      setPrintModalOpen(true)
     }}
    
   >YES</button>
   <button
   type='button'
   onClick={() => {
    setPrintModalOpen(false)
   }}
   className='w-24 p-2 text-xs text-black  bg-red-500 rounded hover:bg-red-600 font-semibold transition hover:text-white'>NO
</button>
  </div>
    
</div>
  )
}

export default PrintReportOpen