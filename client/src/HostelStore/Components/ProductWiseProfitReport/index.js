import React, { useState } from 'react'
import { PDFViewer} from '@react-pdf/renderer';
import MonthlySalesDocument from './MonthlySalesDocument';
import { DateInput } from '../../../Inputs';
import secureLocalStorage from 'react-secure-storage';
import { useGetStockQuery } from '../../../redux/services/StockService';
import { EMPTY_ICON, REFRESH_ICON } from "../../../icons";
import { useGetSalesBillQuery } from '../../../redux/services/SalesBillService';
import moment from 'moment';

const MonthlySales = () => {

  const [startDate,setStartDate]=useState("")
  const [endDate,setEndDate]=useState("")

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )

  const { data: salesData, refetch
  } = useGetSalesBillQuery({ params: { branchId, salesReport: true, fromDate:startDate, toDate: endDate } },
    { skip: !(endDate && startDate) });


  let salesList = salesData ? salesData.data : []

  let totalAmount=0;
  for (const obj of salesList) {
    totalAmount += obj.Amount;
  }

// function calculateTotalAmount () {
//   return salesList.reduce((prev, cur) => prev + cur.Amount, 0);
// }

  const numericFields = ["Qty",  "Amount"];
  return (
    <div>



<div className='bg-gray-300'>
        <div className='w-full h-full p-1'>
          <div className='flex items-center justify-between page-heading p-2 font-bold'>
            <h1 className=''>Monthly Sales Report</h1>
            {/* <div className='flex gap-5'>
              <ParameterButton onClick={() => setParameter(true)} />
              <button onClick={refetch}>
                Refresh {REFRESH_ICON}
              </button>
            </div> */}
          </div>
            <div className='flex  p-2 w-2/6'>
             <DateInput inputHead={"font-bold text-sm"} name={"From :"} value={startDate} setValue={setStartDate}/>
                <DateInput inputHead={"font-bold text-sm"}  name={"To :"} value={endDate} setValue={setEndDate} />
</div>
               



          <div className='w-full grid grid-cols-1   '>
            {
              salesList.length !== 0 ?
                <table className='w-2/4 m-auto border-2 border-gray-900 text-xs'>
                  <thead>
                    <tr className='bg-blue-400 border-2 border-gray-700 sticky top-0 py-2'>
                    <th className='w-12'>S.No</th>
                      {Object.keys(salesList[0]).map((heading, i) =>
                        <th className='p-2 border border-gray-500 text-sm' key={i}>
                          {heading.replace(/_+/g, ' ')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {salesList?.map((data, i) =>
                    <>
                      <tr key={i} className='py-2 w-full table-row'>
                          <td className='text-center border border-gray-500'>{i+1}</td>
                        {Object.keys(data).map((heading, i) =>
                        <>
                          
                          <td key={i} className={`${numericFields.includes(heading) ? "text-right" : "text-left"} p-1 px-3 border border-gray-500`}>
                            {heading=="Amount" ? parseFloat(data[heading]).toFixed(2):(data[heading])}
                          </td>
                          </>
                       
                        )}
                      

                      </tr>

                     
                      </>
                    )}

                   <tr  className='py-2 w-full table-row bg-blue-400'>
                      <td colSpan={3} className='text-center border-2 border-gray-700 font-bold text-sm bg-blue-400'>Total</td>
                      <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-blue-400'>{parseFloat(totalAmount).toFixed(2)}</td>
                         
                      </tr>
                  </tbody>
                </table>
                :
                <div className="flex justify-center items-center text-blue-900  text-3xl sm:mt-52">
                  <p>{EMPTY_ICON} No Data Found...! </p>
                </div>
            }
          </div>
        </div>
      </div>















{/* <PDFViewer className='w-full h-screen'>
                <MonthlySalesDocument />
            </PDFViewer> */}              
    </div>
  )
}

export default MonthlySales