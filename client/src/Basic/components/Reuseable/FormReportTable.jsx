import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import { Loader } from "../../../Basic/components";

// ─── Action Buttons ──────────────────────────────────────────────────────────

export const ViewButton = ({ onClick }) => (
    <Tooltip title="View" arrow>
        <button
            onClick={onClick}
            className="text-blue-600 flex items-center px-1 bg-blue-50 rounded"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
        </button>
    </Tooltip>
);

export const EditButton = ({ onClick }) => (
    <Tooltip title="Edit" arrow>
        <button
            onClick={onClick}
            className="text-green-600 gap-1 px-1 bg-green-50 rounded"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
        </button>
    </Tooltip>
);

export const DeleteButton = ({ onClick, disabled }) => (
    <Tooltip title={disabled ? "Cannot Delete. Child Record Exists" : "Delete"} arrow>
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1 px-1 rounded transition ${disabled
                ? "bg-red-50 text-red-500 opacity-40 cursor-not-allowed"
                : "bg-red-50 text-red-800 hover:bg-red-100"
                }`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        </button>
    </Tooltip>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ currentPage, totalPages, totalCount, indexOfFirstItem, indexOfLastItem, onPageChange }) => (
    <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalCount)} of {totalCount} entries
        </div>
        <div className="flex gap-1">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
            >
                <FaChevronLeft className="inline" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-1 rounded-md ${currentPage === pageNum ? "bg-indigo-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {pageNum}
                    </button>
                );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-3 py-1">...</span>}
            {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                    onClick={() => onPageChange(totalPages)}
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-indigo-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    {totalPages}
                </button>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
            >
                <FaChevronRight className="inline" />
            </button>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ReusableDataTable
 *
 * Props:
 *  columns        – array of { key, label, width?, render? }
 *                   render(dataObj) → ReactNode   (optional custom cell)
 *  searchColumns  – array of keys that match `columns` to show search inputs
 *  data           – array of row objects
 *  totalCount     – total number of records (for pagination display)
 *  isLoading      – boolean
 *  isFetching     – boolean
 *  currentPage    – controlled page number
 *  onPageChange   – (newPage) => void
 *  itemsPerPage   – number (default 10)
 *  onSearchChange – ({ fieldKey: value }) => void  (called on any search input change)
 *  searchValues   – { [fieldKey]: string }
 *  rowActions     – boolean (default true)
 *  onView         – (id) => void
 *  onEdit         – (id) => void
 *  onDelete       – (id) => void
 *  extraActions   – (dataObj) => ReactNode  (slot for extra buttons before view/edit/delete)
 *  onRowClick     – (dataObj) => void
 */
const FormReportTable = ({
    columns = [],
    searchColumns = [],
    data = [],
    totalCount = 0,
    isLoading = false,
    isFetching = false,
    currentPage = 1,
    onPageChange,
    itemsPerPage = 10,
    onSearchChange,
    searchValues = {},
    rowActions = true,
    onView,
    onEdit,
    onDelete,
    extraActions,
    onRowClick,
}) => {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const isLoadingIndicator = isLoading || isFetching;

    const handleSearch = (key, value) => {
        onSearchChange?.({ ...searchValues, [key]: value });
    };

    return (
        <div className="flex flex-col w-full h-[78vh] overflow-auto">
            <div className="h-[100vh] rounded-lg bg-[#F1F1F0] shadow-sm">
                <div className="h-[68vh] overflow-auto">
                    <table className="">
                        <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                            {/* ── Label row ── */}
                            <tr>
                                <th className="px-1 py-1.5 font-medium text-[13px] text-gray-900 text-center w-12">
                                    S No
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`px-3 font-medium text-[13px] text-gray-900 text-center ${col.width ?? ""}`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                {rowActions && (
                                    <th className="px-3 w-14 font-medium text-[13px] text-gray-900 text-center" rowSpan={2}>
                                        Actions
                                    </th>
                                )}
                            </tr>

                            {/* ── Search row ── */}
                            <tr>
                                <th className="px-1 font-medium text-[13px] text-gray-900 text-center w-12">
                                    <div className="h-3" />
                                </th>
                                {columns.map((col) => (
                                    <th key={col.key} className="px-1 font-medium text-[13px] text-gray-900 text-center">
                                        {searchColumns.includes(col.key) ? (
                                            <input
                                                type="text"
                                                className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                                                placeholder="Search"
                                                value={searchValues[col.key] ?? ""}
                                                onChange={(e) => handleSearch(col.key, e.target.value)}
                                            />
                                        ) : (
                                            <div className="h-3" />
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {isLoadingIndicator ? (
                            <tbody>
                                <tr>
                                    <td colSpan={columns.length + 2}>
                                        <Loader />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="border-2">
                                {data.map((dataObj, index) => (
                                    <tr
                                        key={dataObj.id}
                                        tabIndex={0}
                                        onClick={() => onRowClick?.(dataObj)}
                                        onKeyDown={(e) => e.key === "Enter" && onRowClick?.(dataObj)}
                                        className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${onRowClick ? "cursor-pointer" : ""
                                            } ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                                    >
                                        <td className="text-center py-1.5">{indexOfFirstItem + index + 1}</td>

                                        {columns.map((col) => (
                                            <td key={col.key} className="py-1.5 px-2 text-left">
                                                {col.render ? col.render(dataObj) : dataObj[col.key]}
                                            </td>
                                        ))}

                                        {rowActions && (
                                            <td className="px-2 py-1">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Extra actions slot (e.g. Bill / Return buttons) */}
                                                    {extraActions && (
                                                        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
                                                            {extraActions(dataObj)}
                                                        </div>
                                                    )}

                                                    {/* Standard view / edit / delete */}
                                                    <div className="flex items-center gap-1 pl-2">
                                                        {onView && <ViewButton onClick={(e) => { e.stopPropagation(); onView(dataObj.id); }} />}
                                                        {onEdit && <EditButton onClick={(e) => { e.stopPropagation(); onEdit(dataObj.id); }} />}
                                                        {onDelete && <DeleteButton onClick={(e) => { e.stopPropagation(); onDelete(dataObj.id); }} disabled={dataObj.childRecord > 0} />}
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>

                <div className="h-[10vh]">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        indexOfFirstItem={indexOfFirstItem}
                        indexOfLastItem={indexOfLastItem}
                        onPageChange={onPageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default FormReportTable;