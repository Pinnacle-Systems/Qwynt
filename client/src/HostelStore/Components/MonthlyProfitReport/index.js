import React, { useState } from 'react'
import { DateInput } from '../../../Inputs';
import secureLocalStorage from 'react-secure-storage';
import { EMPTY_ICON } from "../../../icons";
import { useGetSalesBillQuery } from '../../../redux/services/SalesBillService';
import { ExcelButton, PreviewButtonOnly, PrintButtonOnly } from '../../../Buttons';
import { exportFileToCsv } from '../../../Utils/excelHelper';
import { getDateFromDateTimeToDisplay, removeComma, sumArray } from '../../../Utils/helper';
import Modal from '../../../UiComponents/Modal';
import { PDFViewer } from '@react-pdf/renderer';
import MonthlySalesDocument from './MonthlySalesDocument';

const MonthlyProfit = () => {
  const [openPdfView, setOpenPdfView] = useState(false);

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )

  const { data: salesData
  } = useGetSalesBillQuery({ params: { branchId, isProfitReport: true, fromDate: startDate, toDate: endDate } },
    { skip: !(endDate && startDate) });


  let salesList = salesData ? salesData.data : []


  let totalAmount = 0;
  for (let b = 0; b < salesList.length; b++) {

    totalAmount += parseFloat(removeComma(salesList[b]?.Profit));
  }
  let saleAmount = 0;
  for (let b = 0; b < salesList.length; b++) {

    saleAmount += parseFloat(removeComma(salesList[b]?.["Sale Amount"]));
  }
  let purchaseAmount = 0;
  for (let b = 0; b < salesList.length; b++) {

    purchaseAmount += parseFloat(removeComma(salesList[b]?.["Purchase Amount"]));
  }

  const numericFields = ["Qty", "Purchase Amount", "Sale Amount", "Profit"];
  return (

    <>{console.log(salesList, "salelist")}
      <Modal onClose={() => setOpenPdfView(false)} isOpen={openPdfView} widthClass={"w-[90%] h-[90%]"}>
        <PDFViewer className='w-full h-screen'>
          <MonthlySalesDocument purchaseAmount={purchaseAmount} saleAmount={saleAmount} salesList={salesList} startDate={getDateFromDateTimeToDisplay(new Date(startDate))} endDate={getDateFromDateTimeToDisplay(new Date(endDate))} totalAmount={totalAmount} />
        </PDFViewer>
      </Modal>




      <div className='bg-gray-300 min-h-screen' >
        <div className='w-full h-full p-1'>
          <div className='flex items-center justify-between page-heading p-2 font-bold'>
            <h1 className=''>Monthly Profit Report</h1>
            <div className='flex no-print'>
              <ExcelButton onClick={() => exportFileToCsv("ANUGRAHA FASHION HOSTEL", [...salesList.map((i, index) => ({ "S.No": index + 1, ...i })), { "S.No": "", Product: "Total", "Qty": sumArray(salesList, "Qty"), "Amount": sumArray(salesList, "Amount") }], "Monthly Sales Report", "ANUGRAHA FASHION HOSTEL")} width={40} />
              {/* <PrintButtonOnly onClick={() => setOpenPdfView(true)} /> */}
            </div>
          </div>
          <div className='flex  p-2 w-2/6'>
            <DateInput inputHead={"font-bold text-sm"} name={"From :"} value={startDate} setValue={setStartDate} />
            <DateInput inputHead={"font-bold text-sm"} name={"To :"} value={endDate} setValue={setEndDate} />
          </div>
          <div className="flex w-full justify-end -mt-9">
            <PreviewButtonOnly onClick={() => setOpenPdfView(true)} />

          </div>

          <div className='w-full grid grid-cols-1 mt-5  '>
            {
              salesList.length !== 0 ?
                <table className='w-2/4 m-auto border-2 border-gray-900 text-xs'>
                  <thead>
                    <tr className='bg-emerald-700 text-white border-2 border-gray-700 sticky top-0 py-2'>
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
                          <td className='text-center border border-gray-500'>{i + 1}</td>
                          {Object.keys(data).map((heading, i) =>
                            <>

<td key={i} className={`${numericFields.includes(heading) ? "text-right" : "text-left"} p-1 px-1 border border-gray-500`}>
  {["Amount", "Qty"].includes(heading) ? parseFloat(data[heading]).toFixed(2) : data[heading]}
</td>

                            </>

                          )}


                        </tr>


                      </>
                    )}

                    <tr className='py-2 w-full table-row bg-blue-400'>
                      <td colSpan={3} className='text-center border-2 border-gray-700 font-bold text-sm bg-emerald-700 text-white'>Total</td>
                      <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-emerald-700 text-white'>{parseFloat(purchaseAmount).toFixed(2)}</td>
                      <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-emerald-700 text-white'>{parseFloat(saleAmount).toFixed(2)}</td>
                      <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-emerald-700 text-white'>{parseFloat(totalAmount).toFixed(2)}</td>
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
    </>
  )
}

export default MonthlyProfit