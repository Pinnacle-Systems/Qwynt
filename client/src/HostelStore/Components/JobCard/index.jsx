import { useDispatch, useSelector } from "react-redux";
import { getCommonParams } from "../../../Utils/helper";
import { useGetTermsandCondtionsQuery } from "../../../redux/uniformService/TermsAndContionService";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useGetBranchByIdQuery, useGetBranchQuery } from "../../../redux/services/BranchMasterService.js";
import { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import JobCardForm from "./JobCardForm.jsx";
import JobCardReport from "./JobCardReport.jsx";
import { useDeleteJobCardMutation } from "../../../redux/uniformService/JobCardService.js";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService.js";
import { useGetPlateMasterQuery } from "../../../redux/services/PlateMasterService.js";
import { useGetDieMasterQuery } from "../../../redux/services/DieMasterService.js";
import OrderEntryApi from "../../../redux/uniformService/OrderEntryService.js";
import { invalidateOrderEntryModule } from "../../../redux/Dispatch/OrderInvalidateTags.js";
import { useIsApprover } from "../../../CustomHooks/userIsApprover.js";
import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService.js";
import { invalidateJobCardModule } from "../../../redux/Dispatch/JobCardInvalidateTags.js";
import { UserPermissions } from "../../../Utils/UserPermissions.js";
import Swal from "sweetalert2";

const index = () => {
    const [showForm, setShowForm] = useState(false);
    const [id, setId] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [formOrderCustomerId, setFormOrderCustomerId] = useState("");
    const [fromOrderId, setFromOrderId] = useState("");
    const [fromOrderType, setFromOrderType] = useState("");
    const [fromOrderQty, setFromOrderQty] = useState("");
    const { hasPermission } = UserPermissions();

    const dispatch = useDispatch();
    const { branchId, companyId, finYearId, userId } = getCommonParams();
    const params = {
        branchId,
        companyId,
        finYearId,
    };
    const {
        data: gsmList,
        isLoading,
        isFetching,
    } = useGetGsmMasterQuery({ params });

    const { data: plateList } = useGetPlateMasterQuery({ params });
    const { data: dieList } = useGetDieMasterQuery({ params });
    const { data: branchData } = useGetBranchByIdQuery(branchId, {
        skip: !branchId,
    });
    const { data: userData } = useGetUserByIdQuery(userId)
    const { canApprove } = useIsApprover("JOB CARD", userData?.data?.id);

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
    const [removeData] = useDeleteJobCardMutation();
    const handleDelete = async (id) => {
        setId(id);
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }

            try {
                let deldata = await removeData(id).unwrap();
                invalidateOrderEntryModule();
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
                Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                    timer: 1000,
                });
                // dispatch(OrderEntryApi.util.invalidateTags(["orderEntry"]));
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


    const { data: customerList } = useGetPartyQuery({ params: { ...params } });
    const { data: branchList } = useGetBranchQuery({ params: { ...params } });
    const { data: employeeList } = useGetEmployeeQuery({ params: { ...params } });

    const tabParams = useSelector((state) =>
        state.openTabs.tabs.find((t) => t.name === "JOB CARD")?.params
    );

    const lastProcessedTimestamp = useRef(null);

    useEffect(() => {
        // Skip if no params or already processed this exact timestamp
        if (!tabParams?.customerId || !tabParams?.timestamp) return;
        if (tabParams.timestamp === lastProcessedTimestamp.current) return;
        console.log(tabParams, "tabParams");
        // ⬅️ Mark as processed BEFORE setting state
        lastProcessedTimestamp.current = tabParams.timestamp;

        setFormOrderCustomerId(tabParams.customerId);
        setFromOrderId(tabParams.orderEntryId);
        setFromOrderType(tabParams.orderType);
        setFromOrderQty(tabParams.orderQty);
        setId("");
        setReadOnly(false);
        setShowForm(true);

        // ❌ NO clearTabParams here — that's what's breaking it

    }, [tabParams]);

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
                            Job Card Report
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800  py-1 rounded-md flex items-center gap-2 text-xs px-2"
                            onClick={handleCreate}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <JobCardReport
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        itemsPerPage={10}
                        userData={userData?.data}
                        canApprove={canApprove}
                    />
                </div>
            </div>

            {showForm && (
                <div className="h-[93vh] overflow-hidden">
                    <JobCardForm
                        readOnly={readOnly}
                        setReadOnly={setReadOnly}
                        id={id}
                        setId={setId}
                        onClose={() => {
                            setShowForm(false);
                            setReadOnly((prev) => !prev);
                            setFormOrderCustomerId("");
                            setFromOrderId("");
                            setFromOrderType("");
                            setFromOrderQty("");
                        }}
                        setShowForm={setShowForm}
                        customerList={customerList}
                        branchList={branchList}
                        userData={userData?.data}
                        gsmList={gsmList}
                        plateList={plateList}
                        dieList={dieList}
                        branchData={branchData}
                        formOrderCustomerId={formOrderCustomerId}
                        setFormOrderCustomerId={setFormOrderCustomerId}
                        fromOrderId={fromOrderId}
                        setFromOrderId={setFromOrderId}
                        fromOrderType={fromOrderType}
                        setFromOrderType={setFromOrderType}
                        fromOrderQty={fromOrderQty}
                        setFromOrderQty={setFromOrderQty}
                        canApprove={canApprove}
                        employeeList={employeeList}
                        hasPermission={hasPermission}
                    />
                </div>
            )}
        </>
    );
}

export default index