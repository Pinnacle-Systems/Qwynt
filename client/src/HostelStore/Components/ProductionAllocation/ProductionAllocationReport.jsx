import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useGetProductionAllocationQuery } from "../../../redux/uniformService/ProductionAllocationService";
import FormReportTable from "../../../Basic/components/Reuseable/FormReportTable";

// ─── Columns ─────────────────────────────────────────────────────

const COLUMNS = [
    {
        key: "docId",
        label: "Allocation No",
        width: "w-32",
    },
    {
        key: "docDate",
        label: "Allocation Date",
        width: "w-32",
        render: (row) => getDateFromDateTimeToDisplay(row.docDate),
    },
    {
        key: "jobCard",
        label: "Job Card No",
        width: "w-40",
        render: (row) => row?.JobCard?.docId,
    },
    {
        key: "styleItem",
        label: "Item Description",
        width: "w-80",
        render: (row) => row?.StyleItem?.name,
    },
];

const SEARCH_COLUMNS = [
    "docId",
    "docDate",
    "jobCard",
    "styleItem",
];

// ─── Component ───────────────────────────────────────────────────

const ProductionAllocationReport = ({
    onView,
    onEdit,
    onDelete,
    onClick,
    rowActions = true,
    hasPermission,
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId",
    );



    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [searchValues, setSearchValues] = useState({
        docId: "",
        docDate: "",
        jobCard: "",
        styleItem: "",
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValues]);

    const { data: allData, isFetching, isLoading } =
        useGetProductionAllocationQuery({
            params: {
                branchId,
                searchDocNo: searchValues.docId,
                searchDocDate: searchValues.docDate,
                searchJobCard: searchValues.jobCard,
                searchStyleItem: searchValues.styleItem,
                pagination: true,
                dataPerPage: 10,
                pageNumber: currentPage,
            },
        });

    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData.totalCount);
        }
    }, [allData, isLoading, isFetching]);

    return (
        <FormReportTable
            columns={COLUMNS}
            searchColumns={SEARCH_COLUMNS}
            data={allData?.data ?? []}
            totalCount={totalCount}
            isLoading={isLoading}
            isFetching={isFetching}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            searchValues={searchValues}
            onSearchChange={setSearchValues}
            rowActions={rowActions}
            onView={
                onView
                    ? (id) => hasPermission(() => onView(id), "read")
                    : undefined
            }
            onEdit={
                onEdit
                    ? (id) => hasPermission(() => onEdit(id), "edit")
                    : undefined
            }
            onDelete={
                onDelete
                    ? (id) => hasPermission(() => onDelete(id), "delete")
                    : undefined
            }
            onRowClick={
                onClick
                    ? (row) => onClick(row.id)
                    : undefined
            }
        />
    );
};

export default ProductionAllocationReport;