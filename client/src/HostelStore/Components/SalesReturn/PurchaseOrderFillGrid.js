
import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { EMPTY_ICON } from "../../../icons";
import { Loader } from "../../../Basic/components";
import { findFromList, getDateFromDateTime, getDateFromDateTimeToDisplay } from "../../../Utils/helper";

import secureLocalStorage from "react-secure-storage";
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { showEntries } from "../../../Utils/DropdownData";
import { useGetPurchaseBillQuery } from "../../../redux/services/PurchaseBillService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetSalesBillQuery } from "../../../redux/services/SalesBillService";

const PurchaseOrderFillGrid = ({
    setPurchaseBillFillGrid,  setPurchaseOrderFillGrid, setPurchaseOrderId,  supplierId, 
}) => {



    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    );
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    );
    const params = {
        branchId,
        companyId,
    };

    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });

    const [searchDocId, setSearchDocId] = useState("");
    const [searchBillDate, setSearchBillDate] = useState("");
    const [searchDueDate, setSearchDueDate] = useState("");
    const [searchSupplierName, setSearchSupplierName] = useState("");


    const [id, setId] = useState("");

    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId, searchBillDate, searchSupplierAliasName: searchSupplierName,  }
   

        const { data: allData, isLoading, isFetching } = useGetSalesBillQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber } });

    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount)
        }
    }, [allData, isLoading, isFetching])
    
    const isLoadingIndicator =!supplierList ||  !allData
  
      
    
    return (
        <div className="flex flex-col w-full h-[95%] overflow-auto">
            <div className="md:flex md:items-center md:justify-between page-heading p-2">
                <div className="heading text-center md:mx-10">Purchase Bill</div>
                <div className="flex sub-heading justify-center md:justify-start items-center">
                    <label className="text-white text-sm rounded-md m-1  border-none">
                        Show Entries
                    </label>
                    <select
                        value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)}
                        className="h-6 w-40 border border-gray-500 rounded"
                    >
                        {showEntries.map((option) => (
                            <option value={option.value}>{option.show}</option>
                        ))}
                    </select>


                </div>
            </div>

            <div
                className="h-[500px] overflow-auto "

            >


<table className="table-fixed text-center w-full">
            <thead className="border-2 table-header">
              <tr className='h-2'>
                <th
                  className="border-2  top-0 stick-bg w-10"
                >
                  S. no.
                </th>
                <th
                  className="border-2  top-0 stick-bg flex flex-col"
                >
                  <div>Bill. No</div><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchDocId}
                    onChange={(e) => {
                      setSearchDocId(e.target.value);
                    }}
                  />
                </th>
                <th
                  className="border-2  top-0 stick-bg"
                >
                  <div>Bill. Date</div><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchBillDate}
                    onChange={(e) => {
                      setSearchBillDate(e.target.value);
                    }}
                  />
                </th>
                <th

                  className="border-2  top-0 stick-bg flex flex-col"
                >
                  <div>Supplier</div><input
                    type="text"
                    className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchSupplierName}
                    onChange={(e) => {
                      setSearchSupplierName(e.target.value);
                    }}
                  />
                </th>
                <th
                  className="border-2  top-0 stick-bg"
                >
                  <div>Due Date</div><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchDueDate}
                    onChange={(e) => {
                      setSearchDueDate(e.target.value);
                    }}
                  />
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
              <tbody className="border-2">
                {allData?.data.map((dataObj, index) => (
                  <tr
                   
                    tabIndex={0}
                    key={dataObj.id}
                    className="border-2 table-row cursor-pointer"
                    onClick={() => { setPurchaseOrderId(dataObj.id); setPurchaseOrderFillGrid(false); setPurchaseBillFillGrid(true); }}>
                    <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                    <td className='py-1'> {dataObj.docId}</td>
                    <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                    <td className='py-1'>{findFromList(dataObj.supplierId, supplierList.data, "name")}</td>
                    <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.dueDate)}</td>
                   
                  </tr>
                ))}
              </tbody>
            }
          </table>
            </div>
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
    );
};

export default PurchaseOrderFillGrid;
