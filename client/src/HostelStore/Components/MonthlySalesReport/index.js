import React, { useState,useEffect } from 'react';
import { DateInput, MultiSelectDropdown } from '../../../Inputs';
import secureLocalStorage from 'react-secure-storage';
import { EMPTY_ICON } from "../../../icons";
import { useGetSalesBillQuery } from '../../../redux/services/SalesBillService';
import { ExcelButton, PreviewButtonOnly } from '../../../Buttons';
import { getDateFromDateTimeToDisplay, sumArray } from '../../../Utils/helper';
import Modal from '../../../UiComponents/Modal';
import { PDFViewer } from '@react-pdf/renderer';
import MonthlySalesDocument from './MonthlySalesDocument';
import { multiSelectOption } from '../../../Utils/contructObject';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';

const MonthlySales = () => {
  const [openPdfView, setOpenPdfView] = useState(false);
  const [partyList, setPartyList] = useState([]);
  const [productList, setProductList] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  const params = {
    branchId,
    companyId,
    filterSupplier: true
  };
 
  const { data: salesData } = useGetSalesBillQuery(
    {
      params: {
        branchId,
        salesReport: true,
        fromDate: startDate,
        toDate: endDate,
        partyList: JSON.stringify(partyList.map(party => party.label)),
        productList: JSON.stringify(productList.map(party => party.label)),
      }
    },
    { skip: !(endDate && startDate) }

  );
 
  console.log(productList,"productList")
  console.log(partyList,"party")
  const { data: allData, isLoading, isFetching } = useGetProductQuery({ params, searchParams: searchValue });

  const salesList = salesData ? salesData.data : [];

  const totalAmount = salesList.reduce((total, item) => total + (item.Qty * item.AvgPrice), 0);
  const totalQty = salesList.reduce((total,item) => total + item.Qty,0 )
  const AvgPrice = salesList.reduce((total, item) => total + item.price, 0) / salesList.length;

  const { data: partyListData } = useGetPartyQuery({ params });

  const numericFields = ["Qty", "Amount"];

  return (
    <>
      <Modal onClose={() => setOpenPdfView(false)} isOpen={openPdfView} widthClass={"w-[90%] h-[90%]"}>
        <PDFViewer className='w-full h-screen'>
          <MonthlySalesDocument
            salesList={salesList}
            totalAmount={totalAmount}
            startDate={getDateFromDateTimeToDisplay(new Date(startDate))}
            endDate={getDateFromDateTimeToDisplay(new Date(endDate))}
          />
        </PDFViewer>
      </Modal>

      <div className='bg-gray-200 min-h-screen'>
        <div className='w-full h-full p-1'>
          <div className='flex items-center justify-between page-heading p-2 font-bold'>
            <h1 className=''>Monthly Sales Report</h1>
            <div className='flex no-print'>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 p-4 w-full">
  {/* From Date Input */}
  <div className="col-span-1">
    <DateInput
      inputHead="font-bold text-sm"
      name="From :"
      value={startDate}
      setValue={setStartDate}
    />
  </div>

  {/* To Date Input */}
  <div className="col-span-1">
    <DateInput
      inputHead="font-bold text-sm"
      name="To :"
      value={endDate}
      setValue={setEndDate}
    />
  </div>

  {/* Party Multi-Select */}
  <div className="col-span-1">
    <MultiSelectDropdown
      name="Party :"
      inputClass="w-60"
      labelName="font-bold"
      selected={partyList}
      setSelected={setPartyList}
      options={
        partyListData
          ? multiSelectOption(
              partyListData.data.filter(item => item.isCustomer === true),
              "name",
              "id"
            )
          : []
      }
    />
  </div>

  {/* Product Multi-Select */}
  <div className="col-span-1">
    <MultiSelectDropdown
      name="Product :"
      inputClass="w-60"
      labelName="font-bold"
      selected={productList}
      setSelected={setProductList}
      options={
        allData && allData.data
          ? multiSelectOption(allData.data, "name", "id")
          : []
      }
    />
  </div>
</div>


          <div className="flex w-full justify-end -mt-9">
            <PreviewButtonOnly onClick={() => setOpenPdfView(true)} />
          </div>

          <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button"
            table="table-to-xls"
            filename="MonthlySalesReport"
            sheet="Sales"
            buttonText="Download as XLS"
          />

          <div className='w-full grid grid-cols-1 mt-5'>
            {salesList.length !== 0 ? (
              <table className='w-2/4 m-auto border-2 border-gray-900 text-xs' id="table-to-xls">
                <thead>
                  <tr className='bg-emerald-400 border-2 border-gray-700 sticky top-0 py-2'>
                    <th className='w-12'>S.No</th>
                    {Object.keys(salesList[0]).map((heading, i) => (
                      <th className='p-2 border border-gray-500 text-sm' key={i}>
                        {heading.replace(/_+/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
  {salesList.map((data, i) => (
    <tr key={i} className='py-2 w-full table-row'>
      <td className='text-center border border-gxray-500'>{i + 1}</td>
      {Object.keys(data).map((heading, index) => (
        <td
          key={index}
          className={`${numericFields.includes(heading) ? "text-right" : "text-left"} p-1 px-3 border border-gray-500`}
        >
          {heading === "Amount" ? (
            parseFloat(data[heading]).toFixed(2)
          ) : heading === "Date" ? (
            new Date(data[heading]).toISOString().split('T')[0]
          )  : heading === "TotalPrice" ?(
            parseFloat(data[heading]).toFixed(2)
          ): (
            data[heading]
          )}
        </td>
      ))}
    </tr>
  ))}

  <tr className='py-2 w-full table-row bg-blue-400'>
    <td colSpan={Object.keys(salesList[0]).length - 2} className='text-center border-2 border-gray-700 font-bold text-sm bg-emerald-400'>
      Total
    </td>
    <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-emerald-400'>
      {parseFloat(totalQty).toFixed(2)}
    </td>
    <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-emerald-400'>
      {parseFloat(AvgPrice).toFixed(2)}
    </td>
    <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-emerald-400'>
      {parseFloat(totalAmount).toFixed(2)}
    </td>
   
  </tr>
</tbody>

              </table>
            ) : (
              <div className="flex justify-center items-center text-blue-900 text-3xl sm:mt-52">
                <p>{EMPTY_ICON} No Data Found...! </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MonthlySales;
