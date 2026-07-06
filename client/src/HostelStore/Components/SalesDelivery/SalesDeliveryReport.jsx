import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import { useGetSalesDeliveryQuery } from "../../../redux/uniformService/SalesDeliveryService";
import { UserPermissions } from "../../../Utils/UserPermissions";

const receiptTypeLabel = (type) => {
  if (type === "AGAINST_INVOICE") return "Delivery cum Invoice";
  if (type === "WITHOUT_INVOICE") return "Delivery only";
  return type || "—";
};

const SalesDeliveryReport = ({
  onView,
  onEdit,
  onDelete,
  itemsPerPage = 10,
}) => {
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  );

  const [dataPerPage, setDataPerPage] = useState("10");
  const [searchDocNo, setSearchDocNo] = useState("");
  const [searchDocDate, setSearchDocDate] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const { hasPermission } = UserPermissions();

  const searchFields = { searchDocNo, searchDocDate, searchCustomer };

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchDocNo, searchDocDate, searchCustomer]);

  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetSalesDeliveryQuery({
    params: {
      branchId,
      ...searchFields,
      pagination: true,
      dataPerPage,
      pageNumber: currentPageNumber,
    },
  });

  useEffect(() => {
    if (allData?.totalCount) setTotalCount(allData?.totalCount);
  }, [allData, isLoading, isFetching]);

  const [currentPage, setCurrentPage] = useState(1);
  const isLoadingIndicator = isLoading || isFetching;
  const totalPages = Math?.ceil(allData?.data?.length / itemsPerPage);
  const indexOfLastItem = currentPage * parseInt(10);
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const Pagination = () => {
    // if (totalPages <= 1) return null;

    return (
      <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200 ">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, allData?.data?.length)} of{" "}
          {allData?.length} entries
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaChevronLeft className="inline" />
          </button>

          {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === pageNum
                    ? "bg-indigo-800 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-3 py-1">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-indigo-800 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaChevronRight className="inline" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-[78Vh] overflow-auto">
      <div className="h-[100vh] rounded-lg bg-[#F1F1F0] shadow-sm">
        <div className="h-[68vh]">
          <table className="">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="px-1 py-1.5 font-medium text-[13px] text-gray-900 text-center w-12">
                  S No
                </th>
                <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-32">
                  Delivery No
                </th>
                <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-32">
                  Date
                </th>
                <th className="w-80 px-3 font-medium text-[13px] text-gray-900 text-center">
                  Customer
                </th>
                <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-40">
                  Type
                </th>
                <th className="w-14 px-3 font-medium text-[13px] text-gray-900 text-center">
                  Actions
                </th>
              </tr>
              <tr>
                <th className="px-1 font-medium text-[13px] text-gray-900 text-center w-12">
                  <div className="h-3"></div>
                </th>
                <th className="px-1 font-medium text-[13px] border text-gray-900 text-center w-32">
                  <input
                    type="text"
                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                    placeholder="Search"
                    value={searchDocNo}
                    onChange={(e) => setSearchDocNo(e.target.value)}
                  />
                </th>
                <th className="px-1 font-medium text-[13px] border text-gray-900 text-center w-32">
                  <input
                    type="text"
                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                    placeholder="Search"
                    value={searchDocDate}
                    onChange={(e) => setSearchDocDate(e.target.value)}
                  />
                </th>
                <th className="w-80 px-1 font-medium text-[13px] text-gray-900 text-center">
                  <input
                    type="text"
                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                    placeholder="Search"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                  />
                </th>
                <th className="px-3 w-40 font-medium text-[13px] text-gray-900 text-center"></th>
                <th className="w-14 px-3 font-medium text-[13px] text-gray-900 text-center"></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoadingIndicator ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader />
                  </td>
                </tr>
              ) : allData?.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500 italic"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                allData?.data?.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                    // onClick={() => onView(item.id)}
                  >
                    <td className="text-center">{index + 1}</td>
                    <td className="py-1.5 text-center">{item.docId}</td>
                    <td className="py-1.5 text-center">
                      {getDateFromDateTimeToDisplay(item.docDate)}
                    </td>
                    <td className="py-1.5 text-left px-2">
                      {item.Customer?.name}
                    </td>
                    <td className="py-1.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${item.deliveryType === "AGAINST_INVOICE" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {receiptTypeLabel(item.deliveryType)}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <div
                        className="flex items-center justify-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="View" arrow>
                          <button
                            className="text-blue-600 flex items-center px-1 bg-blue-50 rounded"
                            onClick={() =>
                              hasPermission(() => onView(item.id), "read")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                          <button
                            className="text-green-600 gap-1 px-1 bg-green-50 rounded"
                            onClick={() =>
                              hasPermission(() => onEdit(item.id), "edit")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip
                          title={
                            item.childRecord > 0
                              ? "Cannot Delete. Child Record Exists"
                              : "Delete"
                          }
                          arrow
                        >
                          <button
                            className={`flex items-center gap-1 px-1 rounded transition ${item.childRecord > 0 ? "bg-red-50 text-red-500 opacity-40 cursor-not-allowed" : "bg-red-50 text-red-800 hover:bg-red-100"}`}
                            onClick={() =>
                              hasPermission(() => onDelete(item.id), "delete")
                            }
                            disabled={item.childRecord > 0}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="h-[10vh]">
          <Pagination />
        </div>
      </div>
    </div>
  );
};

export default SalesDeliveryReport;
