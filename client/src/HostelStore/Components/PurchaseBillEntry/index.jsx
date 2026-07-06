import { useEffect, useRef, useState } from "react";
import PurchaseBillEntryForm from "./PurchaseBillEntryForm.js";
import PurchaseBillEntryFormReport from "./PurchaseBillEntryFormReport.js"
import { getCommonParams } from "../../../Utils/helper.js";
import { FaPlus } from "react-icons/fa";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService.js";
import { useGetStyleItemMasterQuery } from "../../../redux/services/StyleItemMasterService.js";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import Swal from "sweetalert2";
import { useDeletePurchaseBillEntryMutation, } from "../../../redux/uniformService/PurchaseBillEntryService.js";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices.js";
import { useSelector } from "react-redux";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [fromInwardSupplierId, setFromInwardSupplierId] = useState(""); // ⬅️
  const [fromInwardId, setFromInwardId] = useState("");
  const [fromInwardType, setFromInwardType] = useState("");

  // const dispatch = useDispatch();
  const { branchId, companyId, finYearId, userId } = getCommonParams()
  const params = {
    branchId, companyId, finYearId
  };

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
  const [removeData] = useDeletePurchaseBillEntryMutation();
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
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params: { ...params } });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: hsnList } =
    useGetHsnMasterQuery({ params });
  const { data: taxTypeList, isLoading: isTaxLoading, isFetching: isTaxfetching } =
    useGetTaxTemplateQuery({ params: { ...params } });

  const tabParams = useSelector(
    (state) =>
      state.openTabs.tabs.find((t) => t.name === "PURCHASE BILL ENTRY")?.params,
  );
  const lastProcessedTimestamp = useRef(null);

  useEffect(() => {
    // Skip if no params or already processed this exact timestamp
    if (!tabParams?.supplierId || !tabParams?.timestamp) return;
    if (tabParams.timestamp === lastProcessedTimestamp.current) return;

    // ⬅️ Mark as processed BEFORE setting state
    lastProcessedTimestamp.current = tabParams.timestamp;

    setFromInwardSupplierId(tabParams.supplierId);
    setFromInwardId(tabParams.purchaseInwardId);
    setFromInwardType(tabParams.inwardType);
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
              Purchase Bill Entry
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
          <PurchaseBillEntryFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          // searchStyleId={searchStyleId}
          />
        </div>
      </div>

      {showForm && (
        <PurchaseBillEntryForm
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
          taxTypeList={taxTypeList}
          fromInwardId={fromInwardId}
          fromInwardSupplierId={fromInwardSupplierId}
          fromInwardType={fromInwardType}
          setFromInwardId={setFromInwardId}
          setFromInwardSupplierId={setFromInwardSupplierId}
          setFromInwardType={setFromInwardType}
        />
      )}
    </>
  );

}