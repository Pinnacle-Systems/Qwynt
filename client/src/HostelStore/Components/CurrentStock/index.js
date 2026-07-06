import React, { useEffect, useState } from 'react'

import { DateInput } from '../../../Inputs';
import secureLocalStorage from 'react-secure-storage';
import { useGetStockQuery } from '../../../redux/services/StockService';
import { EMPTY_ICON, REFRESH_ICON } from "../../../icons";
import moment from 'moment';
import { ExcelButton, PreviewButtonOnly } from '../../../Buttons';
import { exportFileToCsv } from '../../../Utils/excelHelper';
import { getDateFromDateTimeToDisplay, sumArray } from '../../../Utils/helper';
import StockDocument from './StockDocument';
import Modal from '../../../UiComponents/Modal';
import { PDFViewer } from '@react-pdf/renderer';


const CurrentStock = () => {

  const [startDate, setStartDate] = useState("")
  const [refresh, setRefresh] = useState(false)
  const [openPdfView, setOpenPdfView] = useState(false);

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )

  const { data: stockData, refetch
  } = useGetStockQuery({ params: { branchId, stockReport: true, fromDate: startDate } }, { skip: !(startDate) }

  );

  useEffect(() => {
    setRefresh(false)
  }, [startDate])

  let stockList = stockData ? stockData.data : []

  let totalAmount = 0;
  for (const obj of stockList) {
    totalAmount += obj["SaleValue"];
  }

  function refetchFun() {
    refetch();
    setRefresh(true)
  }

  const numericFields = ["Stock", "SaleRate", "SaleValue"];
  return (

    <div className='w-full bg-gray-300 min-h-screen mt-1  p-2'>
      <Modal onClose={() => setOpenPdfView(false)} isOpen={openPdfView} widthClass={"w-[90%] h-[90%]"}>
        <PDFViewer className='w-full h-screen'>
          <StockDocument totalAmount={totalAmount} stockList={stockList} startDate={getDateFromDateTimeToDisplay(new Date(startDate))} />
        </PDFViewer>
      </Modal>
      <div className='flex items-center justify-between page-heading p-2 font-bold'>
        <h1 className=''>Stock Report</h1>
        <div className='flex no-print'>
          <ExcelButton onClick={() => exportFileToCsv([...stockList.map((i, index) => ({ "S.No": index + 1, ...i })), { "S.No": "", Product: "Total", "Stock": "", "Sale Rate": "", "Uom": "", "Sale Value": sumArray(stockList, "Sale Value") }], "Monthly Sales Report")} width={40} />
          {/* <PrintButtonOnly onClick={() => setOpenPdfView(true)} /> */}
        </div>
      </div>

      <div className='flex gap-x-5 p-2 w-1/4'>
        <DateInput inputHead={"font-bold  text-sm"} name={"Till Date"} value={startDate} setValue={setStartDate} />

        <button onClick={() => { refetchFun() }}>
          Refresh {REFRESH_ICON}
        </button>
        {/* <DateInput name={"To"} value={endDate} setValue={setEndDate} /> */}
      </div>
      <div className="flex w-full justify-end -mt-9">
            <PreviewButtonOnly onClick={()=>setOpenPdfView(true)} />

            </div>

      <div className='w-full h-full  p-2'>

        {refresh &&
          stockList.length !== 0 ?
          <table className='w-2/4 m-auto h-full border-2 border-gray-900 text-xs'>
            <thead>
              <tr className='bg-blue-400 border-2 border-gray-900 sticky top-0 py-2'>
                <th className='w-12'>S.No</th>
                {Object.keys(stockList[0]).map((heading, i) =>
                  <th className='p-2 border-2 border-gray-900' key={i}>
                    {heading.replace(/_+/g, ' ')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {stockList.map((data, i) =>
                <tr key={i} className='py-2 w-full table-row'>
                  <td className='text-center border border-gray-500'>{i + 1}</td>
                  {Object.keys(data).map((heading, i) =>
                    <>

                      <td key={i} className={`${numericFields.includes(heading) ? "text-right" : "text-left"} p-1 px-1 border border-gray-500`}>
                        {(heading == 'PurchaseDate') ? moment.utc(data[heading]).format("YYYY-MM-DD") : heading == "SaleValue" ? parseFloat(data[heading]).toFixed(2) : data[heading]}

                      </td>
                    </>

                  )}
                </tr>
              )}
              <tr className='py-2 w-full table-row bg-blue-400'>
                <td colSpan={5} className='text-center border-2 border-gray-700 font-bold text-sm bg-blue-400'>Total</td>
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















      {/* <PDFViewer className='w-full h-screen'>
                <MonthlySalesDocument />
            </PDFViewer> */}
    </div>
  )
}

export default CurrentStock