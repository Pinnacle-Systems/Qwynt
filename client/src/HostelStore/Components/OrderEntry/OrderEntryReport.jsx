import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import {
    getDateFromDateTimeToDisplay,
} from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { useGetOrderEntryQuery } from "../../../redux/uniformService/OrderEntryService";
import { FileText } from "lucide-react";
import { useAddApprovalStausMutation } from "../../../redux/uniformService/PoServices";
import { ApprovalBadge } from "../../../Utils/ApprovalHelper";
import Modal from "../../../UiComponents/Modal";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { UserPermissions } from "../../../Utils/UserPermissions";
const OrderEntryReport = ({
    onClick,
    onView,
    itemsPerPage = 10,
    onEdit,
    onDelete,
    rowActions = true,
    onCreateJobCard,
    userData,
    canApprove,
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId",
    );

    const [dataPerPage, setDataPerPage] = useState("10");
    const [serachDocNo, setSerachDocNo] = useState("");
    const [searchDocDate, setSearchDocDate] = useState("");
    const [searchCustomer, setSearchCustomer] = useState("");
    const [searchOrderType, setSearchOrderType] = useState("");

    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [approvalModal, setApprovalModal] = useState(false);
    const [selectedJobEntry, setSelectedJobEntry] = useState(null);
    const [actionType, setActionType] = useState(""); // "APPROVE" | "REJECT"
    const [remarks, setRemarks] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const { hasPermission } = UserPermissions();

    const dispatch = useDispatch();
    const [addApprovalStatus] = useAddApprovalStausMutation();
    const searchFields = {
        serachDocNo,
        searchDocDate,
        searchCustomer,
        searchOrderType,
    };

    useEffect(() => {
        setCurrentPageNumber(1);
    }, [
        serachDocNo,
        searchDocDate,
        searchCustomer,
        searchOrderType,
    ]);

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId",
    );

    const {
        data: allData,
        isFetching,
        isLoading,
    } = useGetOrderEntryQuery({
        params: {
            branchId,
            ...searchFields,
            pagination: true,
            dataPerPage,
            pageNumber: currentPageNumber,
        },
    });

    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount);
        }
    }, [allData, isLoading, isFetching]);

    const isLoadingIndicator = isLoading || isFetching;

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math?.ceil(allData?.data?.length / itemsPerPage);
    const indexOfLastItem = currentPage * parseInt(10);
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allData?.data?.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    const Pagination = () => {

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
                        className={`px-3 py-1 rounded-md ${currentPage === 1
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
                                className={`px-3 py-1 rounded-md ${currentPage === pageNum
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
                            className={`px-3 py-1 rounded-md ${currentPage === totalPages
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
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages
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



    const handleApprovalAction = (jobEntry, type) => {
        setSelectedJobEntry(jobEntry);
        setActionType(type);
        setRemarks("");
        setApprovalModal(true);
    };

    const handleConfirmAction = async () => {
        if (actionType === "REJECT" && !remarks.trim()) {
            toast.warning("Remarks required for sending back!");
            return;
        }

        setActionLoading(true);
        try {
            const result = await addApprovalStatus({
                userId: userData?.id,
                remarks: remarks || null,
                actionType, // "APPROVE" or "REJECT"
                referenceId: selectedJobEntry.id,
                referencePage: "ORDER ENTRY",
                recordData: {},
            }).unwrap();

            if (result.statusCode === 0) {
                toast.success(
                    result.message
                        ? result?.message
                        : actionType === "APPROVE"
                            ? "Order Entry Approved!"
                            : "Order Entry Sent Back for Review!",
                );
                setApprovalModal(false);
            } else {
                toast.error(result.message || "Action failed");
                setApprovalModal(false);
            }
        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong!");
            setApprovalModal(false);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={approvalModal}
                onClose={() => setApprovalModal(false)}
                widthClass="w-[420px]"
            >
                <div className="space-y-4">
                    {/* Header */}
                    <h2
                        className={`text-base font-semibold ${actionType === "APPROVE" ? "text-green-700" : "text-blue-700"
                            }`}
                    >
                        {actionType === "APPROVE"
                            ? "✅ Approve Order Entry"
                            : "↩️ Send Back for Review"}
                    </h2>

                    {/* PO Info Card */}
                    <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Order Entry No</span>
                            <span className="font-medium text-gray-800">
                                {selectedJobEntry?.docId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-medium text-gray-800">
                                {selectedJobEntry?.Customer?.name}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Current Approval</span>
                            <ApprovalBadge approvalStatus={selectedJobEntry?.approvalStatus} />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                            Remarks{" "}
                            {actionType === "REJECT" && (
                                <span className="text-red-500">* required</span>
                            )}
                        </label>
                        <textarea
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
                            placeholder={
                                actionType === "APPROVE"
                                    ? "Optional remarks..."
                                    : "Reason for sending back (required)..."
                            }
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setApprovalModal(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    setApprovalModal(false);
                                }
                            }}
                            className="px-4 py-1.5 text-xs rounded borde text-white hover:bg-red-600 bg-red-500"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={handleConfirmAction}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleConfirmAction();
                                }
                            }}
                            className={`px-4 py-1.5 text-xs rounded text-white font-semibold transition ${actionType === "APPROVE"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-blue-600 hover:bg-blue-700"
                                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                        >
                            {actionLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-3 w-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    Processing...
                                </>
                            ) : actionType === "APPROVE" ? (
                                " Confirm Approve"
                            ) : (
                                " Send Back"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
            <div
                className="flex flex-col w-full h-[78Vh] overflow-auto"
            >
                <>
                    <div className="h-[100vh] rounded-lg bg-[#F1F1F0] shadow-sm">
                        <div className="h-[68vh]">
                            <table className="">
                                <thead className="bg-gray-200 text-gray-800 ">
                                    <tr className="">
                                        <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                                            <div className="">S No</div>
                                        </th>

                                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                                            <div>Order No</div>

                                        </th>
                                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                                            <div>Order Date</div>
                                        </th>
                                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-40">
                                            <div>Order Type</div>
                                        </th>

                                        <th className="w-80  px-3   font-medium text-[13px] text-gray-900  text-center ">
                                            <div>Customer</div>
                                        </th>
                                        <th
                                            className=" px-3 w-36  font-medium text-[13px]  text-gray-900  text-center "
                                            rowSpan={2}
                                        >
                                            <div>Approval Status</div>
                                        </th>
                                        <th
                                            className=" px-3 w-32  font-medium text-[13px]  text-gray-900  text-center "
                                            rowSpan={2}
                                        >
                                            <div> Remarks</div>
                                        </th>
                                        {
                                            canApprove && (
                                                <th
                                                    className=" px-3 w-32  font-medium text-[13px]  text-gray-900  text-center "
                                                    rowSpan={2}
                                                >
                                                    <div>Approval Actions</div>
                                                </th>
                                            )}

                                        <th
                                            className="w-14   px-3  font-medium text-[13px]  text-gray-900  text-center "
                                            rowSpan={2}
                                        >
                                            <div>Actions</div>
                                        </th>
                                    </tr>
                                    <tr className="">
                                        <th className=" px-1  font-medium text-[13px] justify-end  text-gray-900  text-center  w-12">
                                            <div className="h-3"></div>
                                        </th>

                                        <th className=" px-1 font-medium text-[13px] border  text-gray-900  text-center w-32">
                                            <input
                                                type="text"
                                                className="text-black h-5   w-full  px-1 focus:outline-none border  border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={serachDocNo}
                                                onChange={(e) => {
                                                    setSerachDocNo(e.target.value);
                                                }}
                                            />
                                        </th>
                                        <th className="  px-1 font-medium text-[13px]  text-gray-900  text-center w-32">
                                            <input
                                                type="text"
                                                className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={searchDocDate}
                                                onChange={(e) => {
                                                    setSearchDocDate(e.target.value);
                                                }}
                                            />
                                        </th>
                                        <th className="  px-1 font-medium text-[13px]  text-gray-900  text-center w-40">
                                            <input
                                                type="text"
                                                className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={searchOrderType}
                                                onChange={(e) => {
                                                    setSearchOrderType(e.target.value);
                                                }}
                                            />
                                        </th>
                                        <th className="w-80  px-1 font-medium text-[13px]  text-gray-900  text-center ">
                                            <input
                                                type="text"
                                                className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={searchCustomer}
                                                onChange={(e) => {
                                                    setSearchCustomer(e.target.value);
                                                }}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                {isLoadingIndicator ? (
                                    <tbody>
                                        <tr>
                                            <td>
                                                <Loader />
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody className="border-2">
                                        {(allData?.data ? allData?.data : []).map(
                                            (dataObj, index) => {
                                                const isDisabled = dataObj?.approvalStatus?.status === "PENDING" ||
                                                    dataObj?.approvalStatus?.status === "NOTAPPROVED" ||
                                                    dataObj?.approvalStatus?.status === "REJECTED";
                                                return (
                                                    <tr
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                onClick(dataObj.id);
                                                            }
                                                        }}
                                                        tabIndex={0}
                                                        key={dataObj.id}
                                                        className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                            }`}
                                                        onClick={() => {
                                                            onClick(dataObj.id);
                                                        }}
                                                    >
                                                        <td className="text-center ">{index + 1}</td>

                                                        <td className="py-1.5 text-center">{dataObj.docId} </td>

                                                        <td className="py-1.5 text-left">
                                                            {getDateFromDateTimeToDisplay(dataObj.docDate)}
                                                        </td>
                                                        <td className="py-1.5 text-left  ">
                                                            {dataObj.orderType}{" "}
                                                        </td>

                                                        <td className="py-1.5 text-left">
                                                            {" "}
                                                            {dataObj?.customer?.name}
                                                        </td>
                                                        <td className="py-1.5 text-left">
                                                            <ApprovalBadge
                                                                approvalStatus={dataObj?.approvalStatus}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1">
                                                            <div className="flex items-center justify-center gap-1.5 text-orange-700">
                                                                {dataObj?.approvalStatus?.remarks || "-"}
                                                            </div>
                                                        </td>
                                                        {
                                                            canApprove && (
                                                                <td className="px-2 py-1">
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        {/* ↩️ Send Back — show when PENDING or APPROVED */}
                                                                        {["PENDING"].includes(
                                                                            dataObj?.approvalStatus?.status,
                                                                        ) && (
                                                                                <Tooltip title="Send Back for Review" arrow>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleApprovalAction(dataObj, "REJECT")
                                                                                        }
                                                                                        // disabled={dataObj?.approvalStatus?.status === "PENDING"}
                                                                                        className="p-1.5 rounded-md bg-blue-200 text-blue-700 hover:bg-blue-300 transition"
                                                                                    >
                                                                                        <MdKeyboardDoubleArrowLeft size={16} />
                                                                                    </button>
                                                                                </Tooltip>
                                                                            )}

                                                                        {/* ✅ Approve — show only when PENDING */}
                                                                        {dataObj?.approvalStatus?.status ===
                                                                            "PENDING" && (
                                                                                <Tooltip title="Approve" arrow>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleApprovalAction(dataObj, "APPROVE")
                                                                                        }
                                                                                        className="p-1.5 rounded-md bg-green-200 text-green-700 hover:bg-green-300 transition"
                                                                                    >
                                                                                        <FiCheck size={16} />
                                                                                    </button>
                                                                                </Tooltip>
                                                                            )}

                                                                        {dataObj?.approvalStatus?.status ===
                                                                            "NOT_CONFIGURED" && (
                                                                                <span className="text-[10px] text-gray-400 italic">
                                                                                    —
                                                                                </span>
                                                                            )}
                                                                    </div>
                                                                </td>)}
                                                        {rowActions && (
                                                            <td className="px-2 py-1">
                                                                <div className="flex items-center justify-center">
                                                                    {/* <div className="flex items-center gap-1.5 pr-2 border-r border-gray-300">
                                                                        {onCreateJobCard && (
                                                                            <Tooltip title="Create Job Card" arrow>
                                                                                <button
                                                                                    disabled={dataObj.childRecord > 0 || isDisabled}
                                                                                    onClick={() => {
                                                                                        dispatch(
                                                                                            push({
                                                                                                name: "JOB CARD", // ⬅️ must match your tabs key exactly
                                                                                                params: {
                                                                                                    customerId: dataObj.customerId,
                                                                                                    orderEntryId: dataObj.id,
                                                                                                    orderType: dataObj.orderType,
                                                                                                    orderQty: dataObj.orderQty,
                                                                                                    timestamp: Date.now(),
                                                                                                },
                                                                                            }),
                                                                                        );
                                                                                    }}
                                                                                    className={`p-1.5 rounded-md transition bg-indigo-50 text-indigo-600 hover:bg-indigo-100 ${dataObj.childRecord > 0 || isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                                                                                >
                                                                                    <FileText size={16} />
                                                                                </button>
                                                                            </Tooltip>
                                                                        )}

                                                                    </div> */}
                                                                    {/* VIEW / EDIT / DELETE */}
                                                                    <div className="flex items-center gap-1 pl-2">
                                                                        {onView && (
                                                                            <Tooltip title="View" arrow>
                                                                                <button
                                                                                    className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                                                                                    onClick={() => hasPermission(() => onView(dataObj.id), "read")}
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
                                                                        )}
                                                                        {onEdit && (
                                                                            <Tooltip title="Edit" arrow>
                                                                                <button
                                                                                    className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                                                                                    onClick={() => hasPermission(() => onEdit(dataObj.id), "edit")}
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
                                                                        )}
                                                                        {onDelete && (
                                                                            <Tooltip
                                                                                title={
                                                                                    dataObj.childRecord > 0
                                                                                        ? "Cannot Delete. Child Record Exists"
                                                                                        : "Delete"
                                                                                }
                                                                                arrow
                                                                            >
                                                                                <button
                                                                                    className={`flex items-center gap-1 px-1 rounded transition
       ${dataObj.childRecord > 0
                                                                                            ? "bg-red-50 text-red-500 opacity-40 cursor-not-allowed"
                                                                                            : "bg-red-50 text-red-800 hover:bg-red-100"
                                                                                        }`}
                                                                                    onClick={() => hasPermission(() => onDelete(dataObj.id), "delete")}
                                                                                    disabled={dataObj.childRecord > 0}
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
                                                                                    {/* <span className="text-xs">delete</span> */}
                                                                                </button>
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                )
                                            },
                                        )}
                                    </tbody>
                                )}
                            </table>
                        </div>
                        <div className="h-[10vh]">
                            <Pagination />
                        </div>
                    </div>
                </>
            </div>
        </>
    );
};

export default OrderEntryReport;
