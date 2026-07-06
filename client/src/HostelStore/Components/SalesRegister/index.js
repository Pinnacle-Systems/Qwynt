import React, { Fragment, useMemo, useRef } from 'react'
import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { getDateFromDateTimeToDisplay, sumArray } from "../../../Utils/helper";
import secureLocalStorage from 'react-secure-storage';
import {
    useGetSalesBillQuery,
    useGetSalesBillByIdQuery,
} from '../../../redux/services/SalesBillService'
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import SaleAmount from './SaleAmount';
import ShowEntries from '../../../UiComponents/ShowEntries';



const SalesRegister = () => {
    const [totalNetBillValue, setTotalNetBillValue] = useState('')
    const [currentOpenNumber, setCurrentOpenNumber] = useState("");
    const [excelData, setExcelData] = useState([]);

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

    const { data, isLoading, isFetching } = useGetSalesBillQuery({
        params: {
            branchId, pagination: true, dataPerPage, pageNumber: currentPageNumber
        }
    });
    const purData = useMemo(() => data?.data ? data.data : [], [data])

    const { data: singleData } = useGetSalesBillByIdQuery(id, { skip: !id });

    useEffect(() => {
        if (purData.length > 0) {
            const totalNetBill = purData.reduce((total, dataObj) => {
                return total + (dataObj.netBillValue || 0);
            }, 0);

            setTotalNetBillValue(totalNetBill);
        }
    }, [purData]);
    console.log(purData,"purData")


    // const { data: allData, isLoading: isAllDataLoading, isFetching: isAllDataFetching } = ({
    //   params: {
    //     branchId, ...searchFields,
    //     supplierId: partyId, startDate, endDate,
    //     filterParties: filterParties.map(item => item.value),
    //     filterPoTypes: filterPoTypes.map(item => item.value)
    //   }
    // })

    // useEffect(() => {
    //   if (paginatedData?.totalCount) {
    //     setTotalCount(paginatedData?.totalCount)
    //   } else {
    //     setTotalCount(0)
    //   }
    // }, [paginatedData, isLoading, isFetching])

    useEffect(() => {
        setCurrentPageNumber(1)
    }, [dataPerPage])

    useEffect(() => {
        setTotalCount(data?.totalCount || 0);
    }, [data])

    const tableRef = useRef(null);

    let totalAmount = 0;
    for (const obj of purData) {
        totalAmount += (obj?.SalesBillItems || []).reduce((a, c) => a + (parseFloat(c.qty) * parseFloat(c.price)), 0);
    }


    if (isLoading || isFetching) return <Loader />

    const isLoadingIndicator = isLoading || isFetching
    return (
        <>

            <div className="flex flex-col w-full h-[95%] overflow-auto">
                <div className="flex items-center justify-between w-full page-heading p-1 text-black">
                    <div className="heading text-center whitespace-nowrap">Sales Register</div>
                    <span className='flex gap-4'>

                        <ShowEntries value={dataPerPage} setValue={setDataPerPage} />
                    </span>
                </div>
                <>
                    <div
                        className="h-[500px] overflow-auto p-2"
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
                                        <label>Customer</label>

                                    </th>
                                    <th className="  top-0 stick-bg table-data">
                                        <label>NetBill Amount</label>

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
                                <tbody className="">
                                    {purData.map((dataObj, index) => (
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
                                                <td className='py-1 text-left border-2 border-gray-400'>{dataObj.docId}</td>
                                                <td className='py-1 text-left border-2 border-gray-400'> {getDateFromDateTimeToDisplay(dataObj?.createdAt)}</td>
                                                <td className='py-1 text-left border-2 border-gray-400'>{dataObj?.supplier  ? dataObj.supplier.name: "Sales"} </td>
                                                <td className='py-1 text-right px-1 border-2 border-gray-400 '>
                                                {dataObj?.netBillValue  ? dataObj.netBillValue:0}
                                                </td>
                                            </tr>

                                            {(currentOpenNumber === index)
                                                &&



                                                <table class=" border text-xs  w-screen mt-1">

                                                    <thead className=" table-header ">
                                                        <tr className='h-2'>
                                                            <th
                                                                className="  top-0 w-10 bg-emerald-500">
                                                                S. no.
                                                            </th>
                                                         
                                                            <th
                                                                className="  top-0 bg-emerald-500 ">
                                                                Product
                                                            </th>
                                                         

                                                            <th className="  top-0 bg-emerald-500 table-data">
                                                                <label>Qty</label>
                                                            </th>

                                                            <th
                                                                className="  top-0 bg-emerald-500 table-data "
                                                            >
                                                                <label>Price</label>

                                                            </th>
                                                            <th className="  top-0 bg-emerald-500 table-data">
                                                                <label>Total Amt</label>
                                                            </th>
                                                            <th className="  top-0 bg-emerald-500 table-data">
                                                                Return Qty
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='bg-yellow-200 mt-2 '>{console.log(singleData, "singleData")}
                                                        {singleData?.data?.SalesBillItems.map((poItem, index) => (
                                                            <tr key={index}>
                                                                <td className='border-2 border-gray-400'>{index + 1}</td>
                                                                <td className='border-2 border-gray-400'>{poItem.Product.name}</td>
                                                                <td className='py-1 text-right border-2 border-gray-400'>{poItem.qty}</td>
                                                                <td className='py-1 text-right border-2 border-gray-400'>{poItem.price}</td>
                                                                <td className='py-1 text-right border-2 border-gray-400'>{(poItem.price * poItem.qty).toFixed(2)}</td>
                                                                <td className='py-1 text-right border-2 border-gray-400 pr-5'>{poItem.alreadyReturnQty}</td>
                                                            </tr>
                                                        ))}

                                                    </tbody>
                                                </table>
                                            }
                                        </Fragment>
                                    ))}
                                    <tr className='py-2 w-full table-row bg-blue-400'>
                                        <td colSpan={4} className='text-center border-2 border-gray-500 font-bold text-sm bg-emerald-400'>Total</td>
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

export default SalesRegister



