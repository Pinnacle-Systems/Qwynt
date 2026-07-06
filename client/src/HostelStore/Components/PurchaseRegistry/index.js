import React, { Fragment, useMemo, useRef } from 'react'
import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import secureLocalStorage from 'react-secure-storage';
import {
  useGetPurchaseBillQuery,
  useGetPurchaseBillByIdQuery,
} from '../../../redux/services/PurchaseBillService'
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import ShowEntries from '../../../UiComponents/ShowEntries';



const PurchaseRegister = () => {
  const [totalNetBillValue, setTotalNetBillValue] = useState('')
  const [currentOpenNumber, setCurrentOpenNumber] = useState("");
  const [partyId, setPartyId] = useState("");
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [parameter, setParameter] = useState(false);

  const [excelData, setExcelData] = useState([]);


  const [filterParties, setFilterParties] = useState([])
  const [filterPoTypes, setFilterPoTypes] = useState([])

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )
  const [poNo, setPoNo] = useState("");
  const [searchPoDate, setPoDate] = useState("");
  const [searchDueDate, setDueDate] = useState("");
  const [searchPoType, setSearchPoType] = useState("");
  const [supplier, setSupplier] = useState("");
  const [dataPerPage, setDataPerPage] = useState("10");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);


  const [id, setId] = useState("")

  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  const searchFields = { searchDocId: poNo, searchPoDate, searchSupplierAliasName: supplier, searchPoType, searchDueDate }


  const { data, isLoading, isFetching } = useGetPurchaseBillQuery({
    params: {
      branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber, supplierId: partyId, startDate, endDate,
    }
  });
  const purData = useMemo(() => data?.data ? data.data : [], [data])

  const { data: singleData } = useGetPurchaseBillByIdQuery(id, { skip: !id });

  useEffect(() => {
    setTotalCount(data?.totalCount || 0);
  }, [data])

  useEffect(() => {
    setCurrentPageNumber(1)
  }, [dataPerPage])

  useEffect(() => {
    if (purData.length > 0) {
      const totalNetBill = purData.reduce((total, dataObj) => {
        return total + (dataObj.netBillValue || 0);
      }, 0);

      setTotalNetBillValue(totalNetBill);
    }
  }, [purData]);


  const tableRef = useRef(null);

  // const { data: poDetails, isLoading: isLoadingPoDetails, isFetching: isFetchingPoDetails } = (currentSelectedPoDetail, { skip: !currentSelectedPoDetail });
  // useEffect(() => {
  //   if (!poDetails?.data || !currentSelectedPoDetail) return
  //   let excelPoItems = poDetails.data.PoItems.map(poItem => {
  //     let poQty = parseFloat(poItem.qty).toFixed(3)
  //     let cancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
  //     let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
  //     let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
  //     let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty)).toFixed(3)
  //     let poBags = poItem.noOfBags
  //     let cancelBags = poItem.alreadyCancelData?._sum.noOfBags ? poItem.alreadyCancelData._sum.noOfBags : 0.000;
  //     let alreadyInwardedBags = poItem.alreadyInwardedData?._sum?.noOfBags ? poItem.alreadyInwardedData._sum.noOfBags : 0.000;
  //     let alreadyReturnedBags = poItem.alreadyReturnedData?._sum?.noOfBags ? parseFloat(poItem.alreadyReturnedData._sum.noOfBags).toFixed(3) : "0.000";
  //     let balanceBags = substract(substract(poBags, cancelBags), substract(alreadyInwardedBags, alreadyReturnedBags))

  //     let alreadyBillQty = poItem?.alreadyBillData?._sum?.qty ? poItem?.alreadyBillData._sum.qty : 0;
  //     let balBillQty = substract(poQty, alreadyBillQty);
  //     balBillQty = balBillQty > 0 ? balBillQty : 0

  //     let newItem = {}
  //     if (poDetails.data.transType === "GreyYarn" || poDetails.data.transType === "DyedYarn") {
  //       newItem["Item"] = poItem.Yarn.aliasName;
  //       newItem["Po Bags"] = poBags;
  //       newItem["Cancel Bags"] = cancelBags;
  //       newItem["Inward Bags"] = alreadyInwardedBags;
  //       newItem["Return Bags"] = alreadyReturnedBags;
  //       newItem["Balance Bags"] = balanceBags;
  //     } else if (poDetails.data.transType === "GreyFabric" || poDetails.data.transType === "DyedFabric") {
  //       newItem["Item"] = poItem.Fabric.aliasName;
  //       newItem["Design"] = poItem.Design.name;
  //       newItem["Gauge"] = poItem.Gauge.name;
  //       newItem["K-Dia"] = poItem.KDia.name;
  //       newItem["F-Dia"] = poItem.FDia.name;
  //     } else {
  //       newItem["Item"] = poItem.Accessory.aliasName;
  //       newItem["Accessory Item"] = poItem.Accessory.accessoryItem.name;
  //       newItem["Accessory Group"] = poItem.Accessory.accessoryItem.AccessoryGroup.name
  //     }
  //     newItem["Uom"] = poItem.Uom.name
  //     newItem["Color"] = poItem.Color.name
  //     newItem["Po Qty"] = poQty;
  //     newItem["Cancel Qty"] = cancelQty;
  //     newItem["Inward Qty"] = alreadyInwardedQty;
  //     newItem["Return Qty"] = alreadyReturnedQty;
  //     newItem["Balance Qty"] = balanceQty;
  //     newItem["Bill Qty"] = alreadyBillQty;
  //     newItem["Bal. Bill Qty"] = balBillQty;
  //     return newItem
  //   })

  //   setCurrentSelectedPoDetail("");
  // }, [isLoadingPoDetails, poDetails, isFetchingPoDetails, currentSelectedPoDetail])

  // useEffect(() => {
  //   if (allData?.data) {
  //     setExcelData(allData.data.map(item => {
  //       let newItem = {};
  //       newItem["Po. No"] = item?.docId;
  //       newItem["Po. Date"] = getDateFromDateTimeToDisplay(item?.createdAt);
  //       newItem["Supplier"] = item?.supplier?.aliasName;
  //       newItem["Po Type"] = item?.transType;
  //       newItem["Due Date"] = getDateFromDateTimeToDisplay(item?.dueDate);
  //       newItem["Po Qty"] = item?.poQty ? item?.poQty : 0;
  //       return newItem
  //     }))
  //   }
  // }, [allData, isAllDataLoading, isAllDataFetching])


  let totalAmount = 0;
  for (const obj of purData) {
    totalAmount += obj.netBillValue;
  }


  if (isLoading || isFetching) return <Loader />

  const isLoadingIndicator = isLoading || isFetching
  return (
    <>

      <div className="flex flex-col w-full h-[95%] overflow-auto">
        <div className="flex items-center justify-between w-full page-heading p-1 text-black">
          <div className="heading text-center whitespace-nowrap">Purchase Register</div>
          <span className='flex gap-4 w-[300px]'>
            <ShowEntries value={dataPerPage} setValue={setDataPerPage} />
          </span>
        </div>
        <>
          <div
            className="h-[500px] overflow-auto"
          >
            <table ref={tableRef} id="table-to-xls" className="table-fixed text-center w-full ">
              <thead className=" table-header">
                <tr className='h-2'>
                  <th
                    className="  top-0 stick-bg w-10">
                    S. no.
                  </th>
                  <th className="  top-0 stick-bg table-data">
                    Bill No
                  </th>
                  <th
                    className="  top-0 stick-bg table-data "
                  >
                    <label>Bill Date</label>

                  </th>
                  <th className="  top-0 stick-bg table-data">
                    <label>Supplier</label>

                  </th>


                  <th
                    className="  top-0 stick-bg table-data "
                  >
                    <label>Supplier Dc No</label>

                  </th>


                  <th className=" top-0 stick-bg table-data ">
                    Net Bill Value
                  </th>
                </tr>
              </thead>
              {isLoadingIndicator ?
                <tbody>
                  <tr>
                    <td>
                      <Loader />
                    </td>
                  </tr>
                </tbody>
                :
                <tbody className="">{console.log(purData, "purdatapurchase")}
                  {(purData ? purData : []).map((dataObj, index) => (
                    <Fragment key={index}>
                      <tr
                        className={` table-row ${(currentOpenNumber === index) ? "border-2 border-black" : ""}`}
                        onClick={() => {
                          if (index === currentOpenNumber) {
                            setCurrentOpenNumber("")
                          } else {
                            setCurrentOpenNumber(index)
                            setId(dataObj.id)
                          }
                        }}>
                        <td className='py-1 border-2 border-gray-400'> {(index + 1) + (currentPageNumber - 1)}</td>
                        <td className='py-1 text-left border-2 border-gray-400'>{dataObj?.docId}</td>
                        <td className='py-1 text-left border-2 border-gray-400'> {getDateFromDateTimeToDisplay(dataObj?.createdAt)}</td>
                        <td className='py-1 text-left border-2 border-gray-400'>{dataObj?.supplier?.name} </td>
                        <td className='py-1 text-right border-2 border-gray-400'>{(dataObj?.supplierDcNo
                        )}</td>


                        <td className='text-right border-2 border-gray-400'>{parseFloat(dataObj?.netBillValue ? dataObj.netBillValue : 0).toFixed(2)}</td>

                      </tr>


                      {(currentOpenNumber === index)
                        &&



                        <table class=" border text-xs  w-screen  mt-2">
                          <thead className=" table-header">
                            <tr className='h-2'>
                              <th
                                className="  top-0 stick-bg w-10">
                                S.no.
                              </th>
                             
                              <th
                                className="  top-0 stick-bg ">
                                Product
                              </th>
                             
                              <th className="  top-0 stick-bg table-data">
                                <label>Qty</label>
                              </th>

                              <th
                                className="  top-0 stick-bg table-data "
                              >
                                <label>Price</label>

                              </th>
                              <th className="  top-0 stick-bg table-data">
                                <label>Total Amt</label>
                              </th>
                              <th className="  top-0 stick-bg table-data">
                                Return Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody className=' bg-yellow-200 '>
                            {(singleData?.data?.PoBillItems ? singleData?.data?.PoBillItems : []).map((poItem, index) => (
                              <tr key={index}>
                                <td className='border-2 border-gray-400'>{index + 1}</td>
                                <td className='border-2 border-gray-400'>{poItem?.Product?.name ? poItem?.Product?.name : ""}</td>
                                <td className='py-1 text-right border-2 border-gray-400'>{poItem?.qty ? poItem?.qty : ""}</td>
                                <td className='py-1 text-right border-2 border-gray-400'>{poItem?.price ? parseFloat(poItem?.price).toFixed(2) : 0}</td>
                                <td className='py-1 text-right border-2 border-gray-400'>{(poItem?.price * poItem?.qty).toFixed(2)}</td>
                                <td className='py-1 text-right border-2 border-gray-400 pr-5'>{poItem?.alreadyReturnQty ? poItem?.alreadyReturnQty : 0}</td>
                              </tr>
                            ))}



                          </tbody>
                        </table>
                      }
                    </Fragment>
                  ))}

                  <tr className='py-2 w-full table-row bg-emerald-600'>
                    <td colSpan={5} className='text-center border-2 border-gray-500 font-bold text-sm bg-emerald-400'>Total</td>
                    <td className='text-right px-1 border-2 border-gray-700 font-bold text-sm bg-emerald-400'>{parseFloat(totalAmount).toFixed(2)}</td>

                  </tr>
                </tbody>

              }
            </table>

          </div>
        </>
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
          pageCount={Math.ceil(totalCount / dataPerPage)}
          marginPagesDisplayed={1}
          onPageChange={handleOnclick}
          containerClassName={"flex justify-center m-2 gap-5 items-center"}
          pageClassName={"border custom-circle text-center"}
          disabledClassName={"p-1 bg-gray-200"}
          previousLinkClassName={"border p-1 text-center"}
          nextLinkClassName={"border p-1"}
          activeClassName={"bg-blue-900 text-white px-2"} />
      </div>
    </>
  )
}

export default PurchaseRegister



