import { useDispatch } from "react-redux";
import { getCommonParams } from "../../../Utils/helper";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService.js";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices.js";
import { UserPermissions } from "../../../Utils/UserPermissions.js";
import { useDeleteProcessBillMutation } from "../../../redux/uniformService/ProcessBillService.js";
import ProcessBillReport from "./ProcessBillReport.jsx";
import ProcessBillForm from "./ProcessBillForm.jsx";
import Swal from "sweetalert2";
import { invalidateJobCardModule } from "../../../redux/Dispatch/JobCardInvalidateTags.js";

const index = () => {
    const [showForm, setShowForm] = useState(false);
    const [id, setId] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const { hasPermission } = UserPermissions();

    const dispatch = useDispatch();
    const { branchId, companyId, finYearId, userId } = getCommonParams();
    const params = { branchId, companyId, finYearId };
    const [dispatchInvalidate] = useInvalidateTags();

    const handleView = (orderId) => {
        setId(orderId);
        setShowForm(true);
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId);
        setShowForm(true);
        setReadOnly(false);
    };

    const [removeData] = useDeleteProcessBillMutation();
    const handleDelete = async (id) => {
        setId(id);
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) return;
            try {
                let deldata = await removeData(id).unwrap();
                // dispatchInvalidate();
                invalidateJobCardModule();
                if (deldata?.statusCode == 1) {
                    Swal.fire({
                        icon: "error",
                        title: "Child record Exists",
                        text: deldata.data?.message || "Data cannot be deleted!",
                    });
                    return;
                }
                setId("");
                Swal.fire({ title: "Deleted Successfully", icon: "success", timer: 1000 });
                setShowForm(false);
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Submission error",
                    text: error.data?.message || "Something went wrong!",
                });
                setShowForm(false);
            }
        }
    };

    const onNew = () => {
        setId("");
        setReadOnly(false);
    };

    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
    const { data: branchList } = useGetBranchQuery({ params: { ...params } });
    const { data: taxTypeList, isLoading: isTaxLoading, isFetching: isTaxfetching } =
        useGetTaxTemplateQuery({ params: { ...params } });

    const handleCreate = () => {
        hasPermission(() => {
            setShowForm(true);
            onNew();
        }, "create");
    };


    return (
        <>
            <div
                className="p-1 bg-[#F1F1F0] h-[85%]"
                style={{ display: showForm ? "none" : "block" }}
            >
                <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">
                            Process Bill Report
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 py-1 rounded-md flex items-center gap-2 text-xs px-2"
                            onClick={handleCreate}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <ProcessBillReport
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        itemsPerPage={10}
                    />
                </div>
            </div>

            {showForm && (
                <div className="h-[93vh] overflow-hidden">
                    <ProcessBillForm
                        readOnly={readOnly}
                        setReadOnly={setReadOnly}
                        id={id}
                        setId={setId}
                        onClose={() => {
                            setShowForm(false);
                            setReadOnly((prev) => !prev);
                        }}
                        setShowForm={setShowForm}
                        supplierList={supplierList}
                        branchList={branchList}
                        taxTypeList={taxTypeList}
                        hasPermission={hasPermission}
                    />
                </div>
            )}
        </>
    );
};

export default index;