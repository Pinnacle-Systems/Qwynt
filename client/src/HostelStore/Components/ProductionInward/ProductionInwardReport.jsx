import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import { useGetProductionInwardQuery } from "../../../redux/uniformService/ProductionInwardService";
import { UserPermissions } from "../../../Utils/UserPermissions";
import FormReportTable from "../../../Basic/components/Reuseable/FormReportTable";

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS = [
    { key: "docId", label: "Receipt No", width: "w-32" },
    {
        key: "docDate", label: "Receipt Date", width: "w-32",
        render: (row) => getDateFromDateTimeToDisplay(row.docDate)
    },
    {
        key: "supplier", label: "Supplier", width: "w-80",
        render: (row) => row?.Supplier?.name
    },
    {
        key: "status",
        label: "Status",
        width: "w-40",
        render: (row) => {
            const statusConfig = {
                "Fully Billed": {
                    bg: "bg-green-100",
                    text: "text-green-700",
                    label: "Fully Billed",
                },
                "Not Billed": {
                    bg: "bg-red-100",
                    text: "text-red-700",
                    label: "Not Billed",
                },
            };

            const config =
                statusConfig[row?.status] ||
                {
                    bg: "bg-gray-100",
                    text: "text-gray-700",
                    label: row?.status || "-",
                };

            return (
                <span
                    className={`
                    inline-flex items-center justify-center
                    px-2 py-0.5 rounded-full
                    text-[11px] font-semibold
                    ${config.bg} ${config.text}
                `}
                >
                    {config.label}
                </span>
            );
        },
    }
];

// Outward No has no search — only include searchable keys here
const SEARCH_COLUMNS = ["docId", "docDate", "supplier"];

// ─── Component ────────────────────────────────────────────────────────────────

const ProductionInwardReport = ({
    onClick,
    onView,
    onEdit,
    onDelete,
    rowActions = true,
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId",
    );

    const { hasPermission } = UserPermissions();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchValues, setSearchValues] = useState({
        docId: "", docDate: "", jobCard: "", supplier: "",
    });

    useEffect(() => { setCurrentPage(1); }, [searchValues]);

    const { data: allData, isFetching, isLoading } = useGetProductionInwardQuery({
        params: {
            branchId,
            searchDocNo: searchValues.docId,
            searchDocDate: searchValues.docDate,
            searchJobCard: searchValues.jobCard,
            searchSupplier: searchValues.supplier,
            pagination: true,
            dataPerPage: 10,
            pageNumber: currentPage,
        },
    });

    useEffect(() => {
        if (allData?.totalCount) setTotalCount(allData.totalCount);
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
            onView={onView ? (id) => hasPermission(() => onView(id), "read") : undefined}
            onEdit={onEdit ? (id) => hasPermission(() => onEdit(id), "edit") : undefined}
            onDelete={onDelete ? (id) => hasPermission(() => onDelete(id), "delete") : undefined}
            onRowClick={onClick ? (row) => onClick(row.id) : undefined}
        />
    );
};

export default ProductionInwardReport;