import React, { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import {
  useGetItemVariantQuery,
  useGetItemVariantByIdQuery,
  useAddItemVariantMutation,
  useUpdateItemVariantMutation,
  useDeleteItemVariantMutation,
} from "../../../redux/services/ItemVariantService";
import styleMasterApi, {
  useGetStyleMasterQuery,
} from "../../../redux/services/StyleMaster_Service";
import printingDesignApi, {
  useGetPrintingDesignsQuery,
} from "../../../redux/services/PrintingDesingnService";
import SizeMasterApi, {
  useGetSizeMasterQuery,
} from "../../../redux/services/SizemasterService";
import ColorMasterApi, {
  useGetColorMasterQuery,
} from "../../../redux/services/ColorMasterService";
import {
  TextInput,
  ToggleButton,
  ReusableTable,
  TextInputNew,
  TextInputNew1,
  FxSelectWithAdd,
} from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import Modal from "../../../UiComponents/Modal";

import { push } from "../../../redux/features/opentabs";
import { useDispatch, useSelector } from "react-redux";

import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions";
import { getCommonParams } from "../../../Utils/helper";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { dropDownListObjectMultiple } from "../../../Utils/contructObject";
import { StyleMaster, PrintingDesign } from "..";
import { Size, ColorMaster } from "../../../HostelStore/Components";
import Select from "react-select";
export default function Form({
  onSuccess,
  onClose,
  editId,
  deleteId,
  deleteLabel,
} = {}) {
  const openTabs = useSelector((state) => state.openTabs);

  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState(editId || deleteId || "");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [active, setActive] = useState(true);
  const [styleId, setStyleId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [itemDetails, setItemDetails] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const formRef = useRef(null);
  const { branchId, companyId, finYearId, userId } = getCommonParams();
  //   const params = { companyId, branchId, finYearId };
  const dispatch = useDispatch();

  const childRecord = useRef(0);
  const { hasPermission } = UserPermissions();
  const { data: styleNameList } = useGetStyleMasterQuery({
    searchParams: searchValue,
  });
  const { data: sizeList } = useGetSizeMasterQuery({
    searchParams: searchValue,
  });
  const { data: colorList } = useGetColorMasterQuery({
    searchParams: searchValue,
  });
  console.log(sizeList, "sizeList");
  console.log(styleNameList, "styleNameList");
  console.log(colorList, "colorList");
  const { data: printDesignList } = useGetPrintingDesignsQuery({
    searchParams: searchValue,
  });

  console.log(printDesignList, "printDesignList");

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetItemVariantQuery({ searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetItemVariantByIdQuery(id, { skip: !id });

  const [addData] = useAddItemVariantMutation();
  const [updateData] = useUpdateItemVariantMutation();
  const [removeData] = useDeleteItemVariantMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      setStyleId(data?.styleId);
      setActive(data?.active ?? true);
      const mappedData =
        data?.ItemVariantMasterDetails?.map((item) => ({
          printingDesignId: item.printingDesignId,
          sizeId: item.sizeId,
          colorId: item.colorId,
          price: item.price?.toFixed(2),
          id: item.id,
        })) || [];

      if (mappedData.length < 15) {
        const padding = Array.from({ length: 15 - mappedData.length }, () => ({
          printingDesignId: "",
          sizeId: "",
          colorId: "",
          price: 0,
        }));
        setItemDetails([...mappedData, ...padding]);
      } else {
        setItemDetails(mappedData);
      }

      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },

    [id],
  );

  useEffect(() => {
    if (singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    styleId,
    itemDetails: itemDetails?.filter(
      (val) => val.printingDesignId !== "" || null || undefined,
    ),
    branchId: parseInt(branchId),
    companyId: parseInt(companyId),
    finYearId: parseInt(finYearId),
    userId: parseInt(userId),
    active,
    id,
  };

  const validateData = (data) => {
    if (data.styleId && data?.itemDetails?.length >= 1) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();

      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData.data.id);
        return;
      }
      await Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });

      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
        modelNameRef?.current?.focus();
      } else {
        setForm(false);
        syncFormWithDb(undefined);
      }
      dispatch(styleMasterApi.util.invalidateTags(["styleMaster"]));
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
      modelNameRef.current?.focus();
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        didClose: () => {
          modelNameRef?.current?.focus();
        },
      });
      return;
    }
    // let foundItem;

    // if (id) {
    //   foundItem = allData?.data
    //     ?.filter((i) => i.id != id)
    //     ?.some((item) => item?.name.toUpperCase() === upperName);
    // } else {
    //   foundItem = allData?.data?.some(
    //     (item) => item?.name.toUpperCase() === upperName,
    //   );
    // }

    // if (foundItem) {
    //   Swal.fire({
    //     text: "The Item variant Name already exists.",
    //     icon: "warning",
    //     didClose: () => {
    //       modelNameRef?.current?.focus();
    //     },
    //   });
    //   return false;
    // }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          await Swal.fire({
            icon: "error",
            title: "Submission error",
            text: deldata.data?.message || "Something went wrong!",
          });
          return;
        }
        setId("");
        dispatch(styleMasterApi.util.invalidateTags(["modelNameMaster"]));
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        syncFormWithDb(undefined);
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
        setForm(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setStyleId("");
    setName("");
    setGender("");
    setBasePrice("");
    setItemDetails((prev) => {
      let newArray = Array?.from({ length: 15 - prev?.length }, () => {
        return {
          printingDesignId: "",
          sizeId: "",
          colorId: "",
          price: 0,
        };
      });
      return [...prev, ...newArray];
    });
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
  };
  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
  };
  useEffect(() => {
    if (styleId) {
      setGender(
        styleNameList?.data?.find((item) => item?.id === styleId)?.modelName
          ?.gender,
      );
      setName(styleNameList?.data?.find((item) => item?.id === styleId)?.name);
      let bs = styleNameList?.data?.find(
        (item) => item?.id === styleId,
      )?.basePrice;
      setBasePrice(Number(bs).toFixed(2));
    } else {
      setGender("");
      setName("");
      setBasePrice("");
    }
  }, [styleId]);

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },

    {
      header: "Item variant Name",
      accessor: (item) => item?.name,

      className: "font-medium text-gray-900 text-left uppercase w-72",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),

      className: "font-medium text-gray-900 text-center uppercase w-16",
    },
  ];

  const {
    firstInputRef: modelNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  useEffect(() => {
    if ((form || onSuccess) && modelNameRef.current) {
      modelNameRef.current.focus();
    }
  }, [form, onSuccess]);

  useEffect(() => {
    if (itemDetails?.length >= 1) return;
    setItemDetails((prev) => {
      let newArray = Array?.from({ length: 15 - prev?.length }, () => {
        return {
          printingDesignId: "",
          sizeId: "",
          colorId: "",
          price: 0,
        };
      });
      return [...prev, ...newArray];
    });
  }, [itemDetails, setItemDetails]);
  console.log(itemDetails, "itemDetails");

  const handleInputChange = (value, index, field) => {
    console.log(value, index, field, "value, index, field");

    const newBlend = structuredClone(itemDetails);
    const prospectiveRow = { ...newBlend[index], [field]: value };

    if (["printingDesignId", "sizeId", "colorId"].includes(field)) {
      const { printingDesignId, sizeId, colorId } = prospectiveRow;
      
      // Check for duplicate only if all three fields have values
      if (printingDesignId && sizeId && colorId) {
        const isDuplicate = newBlend.some((row, i) => {
          return (
            i !== index &&
            row.printingDesignId === printingDesignId &&
            row.sizeId === sizeId &&
            row.colorId === colorId
          );
        });

        if (isDuplicate) {
          Swal.fire({
            icon: "error",
            title: "Duplicate Combination",
            text: "Same combination not allowed. Please choose a different one.",
          });
          return; // Prevent state update
        }
      }
    }

    newBlend[index][field] = value;

    // Automatically fill basePrice when color is selected, if price is empty/0
    if (field === "colorId" && value) {
      if (!newBlend[index].price || newBlend[index].price === 0) {
        newBlend[index].price = basePrice
          ? Number(Number(basePrice).toFixed(2))
          : 0;
      }
    }
    console.log(newBlend, "newBlend");

    setItemDetails(newBlend);
  };
  const addNewRow = () => {
    const newRow = {
      printingDesignId: "",
      sizeId: "",
      colorId: "",
      price: 0,
    };
    setItemDetails([...itemDetails, newRow]);
  };
  const handleDeleteRow = (index) => {
    setItemDetails((prev) => {
      const updated = structuredClone(prev);

      // Remove the selected row
      updated.splice(index, 1);

      // If length falls below 15, append a new empty row to maintain the 15 minimum
      if (updated.length < 15) {
        updated.push({
          printingDesignId: "",
          sizeId: "",
          colorId: "",
          price: 0,
        });
      }

      return updated;
    });
  };
  const handleDeleteAllRows = () => {
    setItemDetails(
      Array.from({ length: 15 }, () => ({
        printingDesignId: "",
        sizeId: "",
        colorId: "",
        price: 0,
      })),
    );
  };
  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  const formBody = (
    <div className="flex-1 p-3">
      <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
        <div className="p-2" ref={formRef}>
          <div className="flex gap-x-6">
            <div className="w-[28%]">
              <DropdownWithModal
                name="Style Name"
                options={dropDownListObjectMultiple(
                  id
                    ? styleNameList?.data
                    : styleNameList?.data?.filter((item) => item?.active),
                  ["modelName.name"],
                  "id",
                )}
                value={styleId}
                setValue={setStyleId}
                required={true}
                readOnly={readOnly}
                className={`w-[150px]`}
                disabled={childRecord.current > 0}
                addNewLabel="+ Add New Style Name"
                childComponent={StyleMaster}
                addNewModalWidth="w-[45%] h-[50%]"
                ref={modelNameRef}
              />
            </div>
            <div className="mb-3 w-[15%]">
              <TextInputNew1
                name="Gender"
                type="text"
                value={gender}
                readOnly={true}
                disabled={childRecord.current > 0}
              />
            </div>
            <div className="mb-3 w-[25%]">
              <TextInputNew1
                name="Cutting Pattern Name"
                type="text"
                value={name}
                readOnly={true}
                disabled={childRecord.current > 0}
              />
            </div>
            <div className="mb-3 w-[9%]">
              <TextInputNew1
                name="Base Price"
                type="number"
                value={basePrice}
                readOnly={true}
                disabled={childRecord.current > 0}
                className="text-right"
              />
            </div>
            <div className="mb-3 w-[30%]">
              <ToggleButton
                name="Status"
                options={statusDropdown}
                value={active}
                setActive={setActive}
                required={true}
                readOnly={readOnly}
                ref={toggleButtonRef}
                onKeyDown={handlers.handleToggleKeyDown}
              />
            </div>
          </div>

          <div className="h-full flex flex-col -ml-4">
            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-1 gap-1 h-full">
                <div className="space-y-3">
                  <div className="bg-white p-2 rounded-md border border-gray-200 h-full">
                    <div className="space-y-4">
                      <div
                        className={`w-full  overflow-auto bg-white max-h-[310px]`}
                      >
                        <table className="w-[60vw] border-collapse table-fixed ">
                          <thead className="bg-gray-200 text-gray-800">
                            <tr>
                              <th
                                className={`w-4  py-2 text-center font-medium text-[13px] `}
                              >
                                S.No
                              </th>
                              <th
                                className={`w-20 py-2 text-center font-medium text-[13px] `}
                              >
                                Printing Design
                              </th>
                              <th
                                className={`w-12 py-2 text-center font-medium text-[13px] `}
                              >
                                Size
                              </th>
                              <th
                                className={`w-20 py-2 text-center font-medium text-[13px] `}
                              >
                                Color
                              </th>

                              <th
                                className={`w-8 py-2 text-center font-medium text-[13px] `}
                              >
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemDetails?.map((val, index) => {
                              return (
                                <tr
                                  key={index}
                                  className=" w-full table-row-second "
                                >
                                  <td className="border  border-gray-300   text-center px-1">
                                    {index + 1}
                                  </td>
                                  <td className="border border-gray-300 text-[12px] py-1 item-center">
                                    <FxSelectWithAdd
                                      value={val.printingDesignId}
                                      onChange={(val) =>
                                        handleInputChange(
                                          val,
                                          index,
                                          "printingDesignId",
                                        )
                                      }
                                      options={(printDesignList?.data || [])
                                        // .filter((i) => (id ? true : i.active))
                                        .map((i) => ({
                                          label: i.name,
                                          value: i.id,
                                        }))}
                                      readOnly={
                                        readOnly || childRecord?.current > 0
                                      }
                                      placeholder=""
                                      addNew={true}
                                      childComponent={PrintingDesign}
                                      addNewModalWidth="w-[38%] h-[50%]"
                                      // nextRef={requirementRef}
                                    />
                                  </td>
                                  <td className="border border-gray-300  w-[6px] item-center px-1">
                                    <FxSelectWithAdd
                                      value={val.sizeId}
                                      onChange={(val) =>
                                        handleInputChange(val, index, "sizeId")
                                      }
                                      options={(sizeList?.data || [])
                                        // .filter((i) => (id ? true : i.active))
                                        .map((i) => ({
                                          label: i.name,
                                          value: i.id,
                                        }))}
                                      readOnly={
                                        readOnly || childRecord?.current > 0
                                      }
                                      placeholder=""
                                      addNew={true}
                                      childComponent={Size}
                                      addNewModalWidth="w-[38%] h-[50%]"
                                      // nextRef={requirementRef}
                                    />
                                  </td>

                                  <td className="border border-gray-300 text-[12px] py-0.5 item-center ">
                                    <FxSelectWithAdd
                                      value={val.colorId}
                                      onChange={(val) =>
                                        handleInputChange(val, index, "colorId")
                                      }
                                      options={(colorList?.data || [])
                                        // .filter((i) => (id ? true : i.active))
                                        .map((i) => ({
                                          label: i.name,
                                          value: i.id,
                                        }))}
                                      readOnly={
                                        readOnly || childRecord?.current > 0
                                      }
                                      placeholder=""
                                      addNew={true}
                                      childComponent={ColorMaster}
                                      addNewModalWidth="w-[38%] h-[50%]"
                                      // nextRef={requirementRef}
                                    />
                                  </td>
                                  <td className="border border-gray-300 text-[12px] py-0.5 item-center ">
                                    <input
                                      type="number" // enforce proper format
                                      value={val?.price}
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) =>
                                        handleInputChange(
                                          Number(e.target.value),
                                          index,
                                          "price",
                                        )
                                      }
                                      onContextMenu={(e) => {
                                        if (!readOnly) {
                                          handleRightClick(e, index, "price");
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !readOnly) {
                                          addNewRow();
                                        }
                                      }}
                                      spellCheck={false}
                                      className={`w-full bg-transparent uppercase  pr-2 text-right focus:outline-none focus:border-transparent   ${
                                        readOnly || childRecord.current > 0
                                          ? "text-gray-600"
                                          : "text-black"
                                      }`}
                                      disabled={
                                        readOnly || childRecord.current > 0
                                      }
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (deleteId) {
    const childCount = singleData?.data?.childRecord ?? 0;
    const isLoadingRecord = isSingleFetching || isSingleLoading;

    const handleConfirmDelete = async () => {
      try {
        const res = await removeData(deleteId).unwrap();
        if (res?.statusCode === 1) {
          toast.error(
            res?.data?.message || "Cannot delete: child records exist",
          );
          return;
        }
        toast.success("Model Name deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete Model Name");
      }
    };

    return (
      <div className="flex flex-col bg-gray-200 min-h-[250px]">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            Delete Item variant
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 mb-3 rounded">
          {isLoadingRecord ? (
            <p className="text-xs text-gray-400">Checking records...</p>
          ) : childCount > 0 ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <p className="text-sm font-semibold text-red-600">
                  Cannot Delete
                </p>
                <p className="text-xs text-gray-600 text-center">
                  <span className="font-semibold">"{deleteLabel}"</span> has{" "}
                  <span className="font-semibold text-red-600">
                    {childCount} linked state{childCount > 1 ? "s" : ""}
                  </span>
                  . Remove them first before deleting this Item variant.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{deleteLabel}"</span>?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (onSuccess) {
    return (
      <div
        onKeyDown={handleKeyDown}
        className="h-full flex flex-col bg-gray-200"
      >
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            {editId ? "Edit Item variant" : "Add New Item variant"}
          </h2>
          <button
            type="button"
            onClick={() => saveData("close")}
            ref={saveCloseButtonRef}
            onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
            className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
          >
            <Check size={14} />
            {editId ? "Update" : "Save"}
          </button>
        </div>
        {formBody}
      </div>
    );
  }

  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-lg font-bold text-gray-800">Item variant</h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border h-6  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Item variant
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[80%] h-[600px]"}
            onClose={() => {
              setForm(false);
              syncFormWithDb(undefined);
              setId("");
            }}
          >
            <>
              <div className="h-full flex flex-col  bg-gray-200">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                      {id
                        ? !readOnly
                          ? "Edit Item variant"
                          : "Item variant "
                        : "Add New Item variant"}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <div>
                      {readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm(false);
                            setSearchValue("");
                            setId(false);
                          }}
                          className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            saveData("close");
                          }}
                          className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                          ref={saveCloseButtonRef} // ✅ Add ref
                          tabIndex={0}
                          onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                        >
                          <Check size={14} />
                          {id ? "Update" : "Save & close"}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!readOnly && !id && (
                        <button
                          type="button"
                          onClick={() => {
                            saveData("new");
                          }}
                          onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                          className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                          ref={saveNewButtonRef} // ✅ Add ref
                          tabIndex={0}
                        >
                          <Check size={14} />
                          {"Save & New"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {formBody}
              </div>
              {contextMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: `${contextMenu.mouseY - 50}px`,
                    left: `${contextMenu.mouseX - 30}px`,

                    // background: "gray",
                    boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                    padding: "8px",
                    borderRadius: "4px",
                    zIndex: 1000,
                  }}
                  className="bg-gray-100"
                  onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
                >
                  <div className="flex flex-col gap-1">
                    <button
                      className=" text-black text-[12px] text-left rounded px-1"
                      onClick={() => {
                        handleDeleteRow(contextMenu.rowId);
                        handleCloseContextMenu();
                      }}
                    >
                      Delete{" "}
                    </button>
                    <button
                      className=" text-black text-[12px] text-left rounded px-1"
                      onClick={() => {
                        handleDeleteAllRows();
                        handleCloseContextMenu();
                      }}
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              )}
            </>
          </Modal>
        )}
      </div>
    </div>
  );
}
