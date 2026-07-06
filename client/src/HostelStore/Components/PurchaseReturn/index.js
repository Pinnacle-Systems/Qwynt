import { useEffect, useRef, useState } from "react";
import PurchaseReturnForm from "./PurchaseReturnForm.js";
import PurchaseReturnFormReport from "./PurchaseReturnFormReport.js";
import { getCommonParams } from "../../../Utils/helper.js";
import { FaPlus } from "react-icons/fa";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import {
  useGetBranchByIdQuery,
  useGetBranchQuery,
} from "../../../redux/services/BranchMasterService.js";
import { useGetStyleItemMasterQuery } from "../../../redux/services/StyleItemMasterService.js";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import Swal from "sweetalert2";
import { useDeletePurchaseReturnMutation } from "../../../redux/services/PurchaseReturnService.js";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService.js";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";
import { useGetTermsandCondtionsQuery } from "../../../redux/uniformService/TermsAndContionService.js";
import { useSelector } from "react-redux";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService.js";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [fromInwardSupplierId, setFromInwardSupplierId] = useState(""); // ⬅️
  const [fromInwardId, setFromInwardId] = useState("");
  const [fromInwardType, setFromInwardType] = useState("");

  // const dispatch = useDispatch();
  const { branchId, companyId, finYearId, userId } = getCommonParams();
  const params = {
    branchId,
    companyId,
    finYearId,
  };

  const { data: branchData } = useGetBranchByIdQuery(branchId, {
    skip: !branchId,
  });

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
  const [removeData] = useDeletePurchaseReturnMutation();
  const handleDelete = async (id) => {
    setId(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
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
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
  };

  const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
  const { data: branchList } = useGetBranchQuery({ params: { ...params } });
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params: { ...params },
  });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: hsnList } = useGetHsnMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const {
    data: termsData,
    isLoading,
    isFetching,
  } = useGetTermsandCondtionsQuery({ params });
  const { data: gsmList } = useGetGsmMasterQuery({ params });

  const tabParams = useSelector(
    (state) =>
      state.openTabs.tabs.find((t) => t.name === "PURCHASE RETURN")?.params,
  );
  const lastProcessedTimestamp = useRef(null);

  useEffect(() => {
    console.log(tabParams, "tabParams");
    // Skip if no params or already processed this exact timestamp
    if (!tabParams?.supplierId || !tabParams?.timestamp) return;
    if (tabParams.timestamp === lastProcessedTimestamp.current) return;

    // ⬅️ Mark as processed BEFORE setting state
    lastProcessedTimestamp.current = tabParams.timestamp;

    setFromInwardSupplierId(tabParams.supplierId);
    setFromInwardId(tabParams.purchaseInwardId);
    setFromInwardType(
      tabParams.inwardType === "Direct Inward"
        ? "General Return"
        : "Purchase Return",
    );
    setId("");
    setReadOnly(false);
    setShowForm(true);

    // ❌ NO clearTabParams here — that's what's breaking it
  }, [tabParams]);

  return (
    <>
      <div
        className="p-1 bg-[#F1F1F0] h-[85%]"
        style={{ display: showForm ? "none" : "block" }}
      >
        <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Purchase Return Report
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800  py-1 rounded-md flex items-center gap-2 text-xs px-2"
              onClick={() => {
                setShowForm(true);
                onNew();
              }}
            >
              <FaPlus /> Create New
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <PurchaseReturnFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
            // searchStyleId={searchStyleId}
          />
        </div>
      </div>

      {showForm && (
        <PurchaseReturnForm
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          id={id}
          setId={setId}
          onClose={() => {
            setShowForm(false);
            setReadOnly((prev) => !prev);
            setFromInwardSupplierId(""); // ⬅️ clear on close
            setFromInwardId("");
            setFromInwardType("");
          }}
          setShowForm={setShowForm}
          supplierList={supplierList}
          branchList={branchList}
          uomList={uomList}
          styleItemList={styleItemList}
          hsnList={hsnList}
          onNew={onNew}
          sizeList={sizeList}
          colorList={colorList}
          branchData={branchData}
          termsData={termsData}
          fromInwardId={fromInwardId}
          fromInwardSupplierId={fromInwardSupplierId}
          fromInwardType={fromInwardType}
          setFromInwardId={setFromInwardId}
          setFromInwardSupplierId={setFromInwardSupplierId}
          setFromInwardType={setFromInwardType}
          gsmList={gsmList}
        />
      )}
    </>
  );
}
