import { useEffect, useRef, useState } from "react";
import PurchaseInwardForm from "./PurchaseInwardForm.js";
import PurchaseInwardFormReport from "./PurchaseInwardFormReport.js";
import { getCommonParams } from "../../../Utils/helper.js";
import { FaPlus } from "react-icons/fa";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService.js";
import { useGetStyleItemMasterQuery } from "../../../redux/services/StyleItemMasterService.js";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import Swal from "sweetalert2";
import {
  useDeletePurchaseInwardEntryMutation,
  useLazyGetPurchaseInwardEntryByIdQuery,
} from "../../../redux/uniformService/PurchaseInwardEntry.js";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService.js";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useSelector } from "react-redux";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices.js";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService.js";
import { useGetItemVariantQuery } from "../../../redux/services/ItemVariantService";
export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const { branchId, companyId, finYearId, userId } = getCommonParams();
  const params = {
    branchId,
    companyId,
    finYearId,
  };
  const [fromPoSupplierId, setFromPoSupplierId] = useState(""); // ⬅️
  const [fromPoId, setFromPoId] = useState("");
  const [fromPoType, setFromPoType] = useState("");
  const [
    trigger,
    {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    },
  ] = useLazyGetPurchaseInwardEntryByIdQuery();
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
  const [removeData] = useDeletePurchaseInwardEntryMutation();
  const [dispatchInvalidate] = useInvalidateTags();

  const handleDelete = async (id) => {
    setId(id);
    const { data } = await trigger(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecord > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction Items used in Purchase Return",
          text: "Data cannot be deleted!",
        });
      } else if (data?.data?.childRecordBill > 0) {
        Swal.fire({
          icon: "error",
          title: "This Transaction Items used in Purchase Bill",
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
    data: taxTypeList,
    isLoading: isTaxLoading,
    isFetching: isTaxfetching,
  } = useGetTaxTemplateQuery({ params: { ...params } });
  const { data: gsmList } = useGetGsmMasterQuery({ params });
  const { data: itemVariantList } = useGetItemVariantQuery({ params });
  console.log(itemVariantList, "itemVariantList");

  const tabParams = useSelector(
    (state) =>
      state.openTabs.tabs.find((t) => t.name === "PURCHASE INWARD")?.params,
  );
  const lastProcessedTimestamp = useRef(null);

  useEffect(() => {
    // Skip if no params or already processed this exact timestamp
    if (!tabParams?.supplierId || !tabParams?.timestamp) return;
    if (tabParams.timestamp === lastProcessedTimestamp.current) return;

    // ⬅️ Mark as processed BEFORE setting state
    lastProcessedTimestamp.current = tabParams.timestamp;

    setFromPoSupplierId(tabParams.supplierId);
    setFromPoId(tabParams.poId);
    setFromPoType(
      tabParams.poType === "ORDER"
        ? "Order Purchase Inward"
        : "General Purchase Inward",
    );
    setId("");
    setReadOnly(false);
    setShowForm(true);

    // ❌ NO clearTabParams here — that's what's breaking it
  }, [tabParams]);

  const handleClose = () => {
    setShowForm(false);
    setFromPoSupplierId(""); // ⬅️ clear on close
    setFromPoId("");
    setReadOnly(false);
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
              Purchase Inward Report
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 py-1 rounded-md flex items-center gap-2 text-xs px-2"
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
          <PurchaseInwardFormReport
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      </div>

      {showForm && (
        <PurchaseInwardForm
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          id={id}
          setId={setId}
          onClose={() => {
            setShowForm(false);
            setReadOnly((prev) => !prev);
            setFromPoSupplierId(""); // ⬅️ clear on close
            setFromPoId("");
            setFromPoType("");
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
          fromPoId={fromPoId}
          fromPoSupplierId={fromPoSupplierId}
          fromPoType={fromPoType}
          setFromPoId={setFromPoId}
          setFromPoSupplierId={setFromPoSupplierId}
          setFromPoType={setFromPoType}
          handleClose={handleClose}
          taxTypeList={taxTypeList}
          gsmList={gsmList}
          itemVariantList={itemVariantList}
        />
      )}
    </>
  );
}
