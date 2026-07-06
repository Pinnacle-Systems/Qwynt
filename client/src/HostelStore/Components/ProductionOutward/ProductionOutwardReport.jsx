import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import { useGetProductionOutwardQuery } from "../../../redux/uniformService/ProductionOutwardService";
import { useAddApprovalStausMutation } from "../../../redux/uniformService/PoServices";
import { UserPermissions } from "../../../Utils/UserPermissions";
import FormReportTable from "../../../Basic/components/Reuseable/FormReportTable";

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS = [
    { key: "docId", label: "Issue No", width: "w-40" },
    {
        key: "docDate", label: "Issue Date", width: "w-40",
        render: (row) => getDateFromDateTimeToDisplay(row.docDate)
    },
    {
        key: "jobCard", label: "Job Card", width: "w-40",
        render: (row) => row?.JobCard?.docId
    },
    {
        key: "supplier", label: "Supplier", width: "w-56",
        render: (row) => row?.Supplier?.name
    },
];

const SEARCH_COLUMNS = ["docId", "docDate", "jobCard", "supplier"];

// ─── Component ────────────────────────────────────────────────────────────────

const ProductionOutwardReport = ({
    onView,
    onEdit,
    onDelete,
    rowActions = true,
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId",
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchValues, setSearchValues] = useState({
        docId: "", docDate: "", jobCard: "", supplier: "",
    });

    const [addApprovalStatus] = useAddApprovalStausMutation();
    const { hasPermission } = UserPermissions();

    // Reset to page 1 whenever any search field changes
    useEffect(() => { setCurrentPage(1); }, [searchValues]);

    const { data: allData, isFetching, isLoading } = useGetProductionOutwardQuery({
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
        />
    );
};

export default ProductionOutwardReport;