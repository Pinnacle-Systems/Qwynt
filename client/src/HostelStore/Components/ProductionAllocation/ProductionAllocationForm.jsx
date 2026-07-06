import React, { useEffect, useState, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import {
  TextInput,
  DropdownInput,
  DateInputNew,
  DropdownNew,
  CheckBoxNew,
  FxSelectWithAdd,
} from "../../../Inputs";
import { findFromList, getCommonParams, ModeChip } from "../../../Utils/helper";
import {
  dropDownListObject,
  dropDownListObjectMultiple,
} from "../../../Utils/contructObject";
import moment from "moment";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import tw from "../../../Utils/tailwind-react-pdf";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiEdit2, FiSave, FiPrinter, FiEye } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import {
  TransactionActions,
  TransactionLayout,
} from "../../../Basic/components/Reuseable";
import {
  useGetPartyByIdQuery,
  useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import { PartyMaster } from "../index.js";
import {
  useAddProductionAllocationMutation,
  useDeleteProductionAllocationMutation,
  useGetProductionAllocationByIdQuery,
  useGetProductionAllocationQuery,
  useUpdateProductionAllocationMutation,
} from "../../../redux/uniformService/ProductionAllocationService.js";
import JobCardApi, {
  useGetJobCardListQuery,
} from "../../../redux/uniformService/JobCardService.js";
import { useGetStyleItemMasterQuery } from "../../../redux/services/StyleItemMasterService.js";
import { useGetProcessMasterQuery } from "../../../redux/services/ProcessMasterService.js";
import { useDispatch } from "react-redux";
import { invalidateJobCardModule } from "../../../redux/Dispatch/JobCardInvalidateTags.js";
import { priorityTypes } from "../../../Utils/DropdownData.js";

const ProductionAllocationForm = ({
  readOnly,
  setReadOnly,
  id,
  setId,
  onClose,
  termsData,
  customerList,
  hasPermission,
}) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState(moment().format("YYYY-MM-DD"));
  const [customerId, setCustomerId] = useState("");
  const [jobCardId, setJobCardId] = useState("");
  const [styleItemId, setStyleItemId] = useState("");
  const [orderQty, setOrderQty] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [priority, setPriority] = useState("MEDIUM");
  const dispatch = useDispatch();

  const DEFAULT_ROWS = Array.from({ length: 5 }, (_, index) => ({
    seqNo: index + 1,
    processId: "",
    processName: "",
    type: "",
    isInHouse: false,
    isOutSide: false,
    supplierId: "",
    processRouteId: "",
    isFront: false,
    isFrontAndBack: false,
  }));
  const [allocationDetails, setAllocationDetails] = useState(DEFAULT_ROWS);
  const childRecord = useRef(0);

  const customerRef = useRef(null);

  const effectiveReadOnly = readOnly || childRecord.current > 0;

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    contactPerson: "",
    phone: "",
  });

  const { data: allData } = useGetProductionAllocationQuery({
    params: { branchId },
  });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProductionAllocationByIdQuery(id, {
    skip: !id,
  });
  const { data: supplierData } = useGetPartyByIdQuery(customerId, {
    skip: !customerId,
  });
  const { data: jobCardList } = useGetJobCardListQuery({
    params: { companyId, branchId, isDropdown: true },
  });
  const { data: styleItemList } = useGetStyleItemMasterQuery(
    { params: { companyId, branchId } },
    {
      skip: !companyId || !branchId,
    },
  );
  const { data: processList } = useGetProcessMasterQuery(
    { params: { companyId, branchId } },
    {
      skip: !companyId || !branchId,
    },
  );
  const { data: supplierList } = useGetPartyQuery(
    { params: { companyId, branchId } },
    {
      skip: !companyId || !branchId,
    },
  );

  const [addData] = useAddProductionAllocationMutation();
  const [updateData] = useUpdateProductionAllocationMutation();
  const [removeData] = useDeleteProductionAllocationMutation();

  const syncFormWithDb = useCallback((data) => {
    setDocId(data?.docId || "New");
    setDocDate(moment(data?.docDate || new Date()).format("YYYY-MM-DD"));
    setCustomerId(data?.customerId || "");
    setJobCardId(data?.jobCardId || "");
    setRemarks(data?.remarks || "");
    setStyleItemId(data?.styleItemId || "");
    setOrderQty(data?.orderQty || "");
    setAllocationDetails(
      data?.allocationDetails?.map((item, index) => ({
        id: item.id,
        seqNo: item.sequence || index + 1,
        processId: item.processId || "",
        type: item.type || "",
        isInHouse: item.isInHouse || false,
        isOutSide: item.isOutSide || false,
        supplierId: item.supplierId || "",
        processRouteId: item.processRouteId || "",
        isFront: item.isFront || false,
        isFrontAndBack: item.isFrontAndBack || false,
      })) || DEFAULT_ROWS,
    );
    setPriority(data?.priority || "MEDIUM");
    childRecord.current = data?.childRecord ? data?.childRecord : 0;
  }, []);

  useEffect(() => {
    if (id && singleData?.data) syncFormWithDb(singleData.data);
    else syncFormWithDb(undefined);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  const handleSaveAndClose = async () => {
    await handleSave("close");
  };

  const handleSaveAndNew = async () => {
    await handleSave("new");
  };

  const validateData = () => {
    // Job Card validation
    if (!jobCardId) {
      Swal.fire({
        title: "Error",
        text: "Job Card No is required",
        icon: "error",
        confirmButtonColor: "#d33",
      });

      customerRef.current?.focus();
      return false;
    }

    // Only valid rows
    const validRows = allocationDetails?.filter(
      (item) => item?.processId && item?.seqNo,
    );

    // Allocation details required
    if (validRows?.length === 0) {
      Swal.fire({
        title: "Error",
        text: "Allocation Details is required",
        icon: "error",
        confirmButtonColor: "#d33",
      });

      return false;
    }

    // Row validations
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];

      // Must select InHouse or Outside
      if (!row.isInHouse && !row.isOutSide) {
        Swal.fire({
          title: "Error",
          text: `Please select In House or Outside in row ${i + 1}`,
          icon: "error",
          confirmButtonColor: "#d33",
        });

        return false;
      }
    }

    return true;
  };

  const handleSave = async (pendingAction = null) => {
    if (!validateData()) {
      return;
    }

    const payload = {
      userId,
      branchId,
      companyId,
      finYearId,
      docDate,
      customerId,
      jobCardId,
      remarks,
      styleItemId,
      orderQty,
      allocationDetails: allocationDetails?.filter(
        (item) => item?.processId && item?.seqNo,
      ),
      priority,
    };

    try {
      let savedId = id;
      if (id) {
        await updateData({ id, body: payload }).unwrap();
        Swal.fire({
          title: "Success",
          text: "Production Allocation updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          didClose: () => {
            customerRef.current.focus();
          },
        });
        invalidateJobCardModule();
      } else {
        const res = await addData(payload).unwrap();
        savedId = res.data.id;
        setId(savedId);
        Swal.fire({
          title: "Success",
          text: "Production Allocation created successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          didClose: () => {
            customerRef.current.focus();
          },
        });
      }
      setReadOnly(true);
      dispatch(JobCardApi.util.invalidateTags(["jobCard"]));

      if (pendingAction === "new") {
        onNew();
      } else if (pendingAction === "close") {
        onClose();
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.data?.message || "Failed to save Proforma Invoice",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      handleSave();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setDocId("New");
    setDocDate(moment().format("YYYY-MM-DD"));
    setJobCardId("");
    setRemarks("");
    setAllocationDetails(DEFAULT_ROWS);
    setPriority("MEDIUM");
  };

  const handleJobCardChange = (item) => {
    if (!item) return;

    setJobCardId(item.id || "");
    setStyleItemId(item.styleItemId || "");

    const routes = item.processRoute || [];
    const mappedRows = routes.map((route, index) => {
      const processData = processList?.data?.find(
        (p) => p.id === route?.processId,
      );

      const isOutside = processData?.isOutsideJob || false;

      return {
        seqNo: route?.sequence || index + 1,
        processId: route?.processId || "",
        processName: route?.Process?.name || "",
        type: route?.type || "",
        isInHouse: route?.processId ? !isOutside : false,
        isOutSide: route?.processId ? isOutside : false,
        isFront: route?.isFront || false,
        isFrontAndBack: route?.isFrontAndBack || false,
        processRouteId: route?.id || "",
      };
    });
    setAllocationDetails(mappedRows);
  };

  const actionButtonClass =
    "px-2 py-1 rounded flex items-center justify-center text-xs gap-2 text-white transition";

  const leftActions = [
    ...(!effectiveReadOnly
      ? [
          {
            key: "saveAndClose",
            icon: (
              <span className="flex items-center gap-1">
                {/* <FiSave className="h-4 w-4" /> */}
                <HiOutlineRefresh className="h-4 w-4" />
              </span>
            ),
            hoverLabel: "Save & Close",
            label: "Save & Close",
            iconOnly: false,
            onClick: handleSaveAndClose,
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveAndClose();
              }
            },
            className: `bg-indigo-500 hover:bg-indigo-600 ${actionButtonClass}`,
          },
          {
            key: "saveAndNew",
            icon: (
              <span className="flex items-center gap-1">
                <FiSave className="h-4 w-4" />
                {/* <HiOutlineRefresh className="h-4 w-4" /> */}
              </span>
            ),
            hoverLabel: "Save & New",
            label: "Save & New",
            iconOnly: false,
            onClick: handleSaveAndNew,
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveAndNew();
              }
            },
            className: `bg-indigo-600 hover:bg-indigo-700 ${actionButtonClass}`,
          },
        ]
      : []),
  ];

  const rightActions = [
    {
      key: "edit",
      icon: <FiEdit2 className="h-4 w-4" />,
      hoverLabel: "Edit",
      label: "Edit",
      iconOnly: false,
      onClick: () => hasPermission(() => setReadOnly(false), "edit"),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          hasPermission(() => setReadOnly(false), "edit");
        }
      },
      className: `bg-yellow-600 hover:bg-yellow-700 ${actionButtonClass}`,
      hidden: !readOnly || !id,
    },
  ].filter((a) => !a.hidden);

  const headerContent = (
    <>
      <div className="flex flex-col md:flex-row gap-1 w-full">
        <div className="flex flex-col md:flex-row gap-1 w-full">
          <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
              Basic Details
            </h2>
            <div className="flex gap-2">
              <div className="w-36">
                <TextInput name="PA No" value={docId} disabled={true} />
              </div>
              <div className="w-32">
                <DateInputNew
                  name="PA Date"
                  value={docDate}
                  setValue={setDocDate}
                  disabled={true}
                  required={true}
                  type="date"
                />
              </div>
            </div>
          </div>
          <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
              Job Card Details
            </h2>
            <div className="flex gap-2 ">
              <div className="w-44">
                <DropdownNew
                  name="Job Card No"
                  dataList={jobCardList?.data.filter(
                    (item) =>
                      ["APPROVED", "NOT_CONFIGURED"].includes(
                        item?.approvalStatus?.status,
                      ) &&
                      (id || item.childRecord === 0),
                  )}
                  value={jobCardId}
                  setValue={setJobCardId}
                  required
                  readOnly={readOnly}
                  disabled={readOnly || childRecord.current > 0}
                  otherField={"docId"}
                  beforeChange={handleJobCardChange}
                  ref={customerRef}
                />
              </div>
              <div className="w-40">
                <DropdownInput
                  name="Priority Type"
                  options={priorityTypes}
                  value={priority}
                  setValue={(value) => setPriority(value)}
                  required={true}
                  readOnly={readOnly}
                  disabled={childRecord.current > 0 || readOnly}
                />
              </div>
              <div className="w-64">
                <DropdownNew
                  name="Item Description"
                  dataList={styleItemList?.data}
                  value={styleItemId}
                  setValue={setStyleItemId}
                  required
                  readOnly={true}
                  disabled={true}
                />
              </div>
            </div>
          </div>
          <div className="flex-1 w-auto border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
              Order Details
            </h2>
            <div className="flex gap-2 ">
              <div className="w-44">
                <TextInput
                  name="Order No"
                  value={findFromList(
                    jobCardId,
                    jobCardList?.data,
                    "orderEntryDocId",
                  )}
                  readOnly={true}
                  required
                  className=" w-full"
                />
              </div>
              <div className="w-20">
                <TextInput
                  name="Order Qty"
                  value={findFromList(jobCardId, jobCardList?.data, "orderQty")}
                  readOnly={true}
                  required
                  type="number"
                  className="text-right w-full"
                />
              </div>
              <div className="w-64">
                <TextInput
                  name="Customer"
                  value={findFromList(
                    jobCardId,
                    jobCardList?.data,
                    "customerName",
                  )}
                  readOnly={true}
                  required
                  className=" w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const footerContent = (
    <>
      <TransactionActions
        leftActions={leftActions}
        rightActions={rightActions}
      />
    </>
  );

  return (
    <>
      {/* <Modal
                isOpen={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                widthClass={"w-[90%] h-[90%]"}
            >
                <PDFViewer style={tw("w-full h-full")}>
                  
                </PDFViewer>
            </Modal> */}

      <TransactionLayout
        title="Production Allocation"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        header={headerContent}
        detailsLayout="default"
        detailsLayouts={["default"]}
        gridItems={
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-2 w-full h-full">
            <h2 className="text-[11px] font-bold text-gray-600 uppercase border-b pb-1 mb-2">
              Process Allocation
            </h2>

            <div className="overflow-x-auto">
              <table className=" border-collapse text-[11px] m-2">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 px-2 py-1 w-16">
                      Seq No
                    </th>

                    <th className="border w-64 border-slate-300 px-2 py-1">
                      Process
                    </th>

                    <th className="border border-slate-300 px-2 py-1 w-28">
                      In House
                    </th>

                    <th className="border border-slate-300 px-2 py-1 w-28">
                      Outside
                    </th>
                    {/* 
                                        <th className="border border-slate-300 px-2 py-1 w-64">
                                            Supplier
                                        </th> */}
                  </tr>
                </thead>

                <tbody>
                  {allocationDetails.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        {row.seqNo}
                      </td>

                      <td className="border border-slate-300 px-2 py-1">
                        {findFromList(
                          row.processId,
                          processList?.data,
                          "name",
                        ) || ""}{" "}
                        {row.isFrontAndBack && "(Front & Back)"}
                        {row.isFront && "(Front)"}
                      </td>

                      <td className="border border-slate-300 px-2 py-1 text-center">
                        <CheckBoxNew
                          value={row.isInHouse}
                          setValue={(val) => {
                            const temp = [...allocationDetails];

                            temp[index].isInHouse = val;
                            temp[index].supplierId = null;
                            if (val) {
                              temp[index].isOutSide = false;
                            }

                            setAllocationDetails(temp);
                          }}
                          disabled={!row.processId || childRecord.current > 0}
                        />
                      </td>

                      <td className="border border-slate-300 px-2 py-1 text-center">
                        <CheckBoxNew
                          value={row.isOutSide}
                          setValue={(val) => {
                            const temp = [...allocationDetails];

                            temp[index].isOutSide = val;

                            if (val) {
                              temp[index].isInHouse = false;
                            }

                            setAllocationDetails(temp);
                          }}
                          disabled={!row.processId || childRecord.current > 0}
                        />
                      </td>
                      {/* <td className="border border-gray-300">
                                                <FxSelectWithAdd
                                                    value={row.supplierId}
                                                    onChange={(val) => {
                                                        const temp = [...allocationDetails];
                                                        temp[index].supplierId = val;
                                                        setAllocationDetails(temp);
                                                    }}
                                                    options={
                                                        supplierList?.data
                                                            ?.filter((p) => p.active)
                                                            .map((p) => ({ label: p.name, value: p.id })) || []
                                                    }
                                                    readOnly={readOnly || row.isInHouse || !row.processId} // Read-only from Order Entry
                                                    placeholder=""
                                                    addNew={true}
                                                    childComponent={PartyMaster}
                                                    addNewModalWidth="w-[90%] h-[90%]"
                                                />
                                            </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
        footer={footerContent}
      />
    </>
  );
};

export default ProductionAllocationForm;
