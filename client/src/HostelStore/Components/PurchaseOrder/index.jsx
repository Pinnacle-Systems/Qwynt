import { useMemo, useState, useEffect } from "react";
import PurchaseOrderForm from "./PurchaseOrderForm.js";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport.js";
import { getCommonParams } from "../../../Utils/helper.js";
import { FaPlus } from "react-icons/fa";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices.js";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import {
  useGetBranchByIdQuery,
  useGetBranchQuery,
} from "../../../redux/services/BranchMasterService.js";
import { useGetStyleItemMasterQuery } from "../../../redux/services/StyleItemMasterService.js";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import Swal from "sweetalert2";
import {
  useDeletePoMutation,
  useLazyGetPoByIdQuery,
} from "../../../redux/uniformService/PoServices.js";
import { useGetTermsandCondtionsQuery } from "../../../redux/uniformService/TermsAndContionService.js";
import { useGetPaytermMasterQuery } from "../../../redux/services/payTermMasterService.js";
import { useGetItemGroupMasterQuery } from "../../../redux/services/ItemGroupMasterService.js";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService.js";
import { useDispatch, useSelector } from "react-redux";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService.js";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService.js";
import { push } from "../../../redux/features/opentabs";
import { UserPermissions } from "../../../Utils/UserPermissions.js";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [showInwardForm, setShowInwardForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");

  const openTabs = useSelector((state) => state.openTabs);
  const previewPOId = useMemo(
    () => openTabs.tabs.find((i) => i.name === "PURCHASE ORDER")?.previewId,
    [openTabs],
  );

  const dispatch = useDispatch();
  const { branchId, companyId, finYearId, userId } = getCommonParams();
  const params = {
    branchId,
    companyId,
    finYearId,
  };
  const {
    data: termsData,
    isLoading,
    isFetching,
  } = useGetTermsandCondtionsQuery({ params });
  const { data: branchData } = useGetBranchByIdQuery(branchId, {
    skip: !branchId,
  });
  const { data: userData } = useGetUserByIdQuery(userId);
  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetPoByIdQuery();
  const handleView = (orderId) => {
    setId(orderId);
    setShowForm(true);
    setReadOnly(true);
  };
  const [dispatchInvalidate] = useInvalidateTags();
  const { hasPermission } = UserPermissions();

  const handleEdit = (orderId) => {
    setId(orderId);
    setShowForm(true);
    setReadOnly(false);
  };
  const [removeData] = useDeletePoMutation();
  const handleDelete = async (id) => {
    setId(id);
    const { data } = await trigger(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecordInward > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction Items used in Purchase Inward",
          text: "Data cannot be deleted!",
        });
      } else if (data?.data?.childRecordCancel > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction Items used in Purchase Cancel",
          text: "Data cannot be deleted!",
        });
      } else {
        try {
          let deldata = await removeData(id).unwrap();
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
          setShowForm(false);
          dispatchInvalidate();
          invalidatePurchaseModule();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Submission error",
            text: error.data?.message || "Something went wrong!",
          });
          setShowForm(false);
        }
      }
    }
  };
  const handleCreateInward = (poId) => {
    setSelectedPoId(poId);
    setShowInwardForm(true);
  };

  const handleCreateCancel = (poId) => {
    setSelectedPoId(poId);
    setShowCancelForm(true);
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
  };

  const {
    data: taxTypeList,
    isLoading: isTaxLoading,
    isFetching: isTaxfetching,
  } = useGetTaxTemplateQuery({ params: { ...params } });
  const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
  const { data: branchList } = useGetBranchQuery({ params: { ...params } });
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params: { ...params },
  });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: hsnList } = useGetHsnMasterQuery({ params });
  const { data: payTermList } = useGetPaytermMasterQuery({ params });
  const { data: itemGroupList } = useGetItemGroupMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: gsmList } = useGetGsmMasterQuery({ params });

  useEffect(() => {
    if (!previewPOId) return;
    setId(previewPOId);
    setShowForm(true);
    // dispatch(push({ name: "PURCHASE ORDER", previewId: null }))
  }, [previewPOId, dispatch]);

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
              Purchase Order Report
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
          <PurchaseOrderFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
            onCreateInward={handleCreateInward} // ⬅️
            onCreateCancel={handleCreateCancel}
            userData={userData?.data}
            previewPOId={previewPOId}
          />
        </div>
      </div>

      {showForm && (
        <div className="h-[93vh] overflow-hidden">
          <PurchaseOrderForm
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            id={id}
            setId={setId}
            onClose={() => {
              setShowForm(false);
              setReadOnly((prev) => !prev);
            }}
            setShowForm={setShowForm}
            taxTypeList={taxTypeList}
            supplierList={supplierList}
            branchList={branchList}
            uomList={uomList}
            styleItemList={styleItemList}
            hsnList={hsnList}
            termsData={termsData}
            payTermList={payTermList}
            itemGroupList={itemGroupList}
            sizeList={sizeList}
            colorList={colorList}
            branchData={branchData}
            gsmList={gsmList}
            userData={userData?.data}
            hasPermission={hasPermission}
          />
        </div>
      )}
    </>
  );
}
