import React, { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";

import { TextInput, ToggleButton, ReusableTable, TextInputNew, TextInputNew1, DropdownInputNew } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import Modal from "../../../UiComponents/Modal";

import { push } from "../../../redux/features/opentabs";
import { useDispatch, useSelector } from "react-redux";

import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { UserPermissions } from "../../../Utils/UserPermissions";
import { useAddbankMutation, useDeletebankMutation, useGetbankByIdQuery, useGetbankQuery, useUpdatebankMutation } from "../../../redux/services/BankMasterService";
import { CityMaster } from "..";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { dropDownListMergedObject } from "../../../Utils/contructObject";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";


export default function Form({ onSuccess, onClose, editId, deleteId, deleteLabel } = {}) {
    const openTabs = useSelector((state) => state.openTabs);

    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState(editId || deleteId || "");
    const [name, setName] = useState("");
    const [accNo, setAccNo] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [swiftCode, setSwiftCode] = useState("");
    const [branchId, setBranchId] = useState("");
    const [active, setActive] = useState(true);
    const [searchValue, setSearchValue] = useState("");

    const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
    const formRef = useRef(null);

    const childRecord = useRef(0);
    const { hasPermission } = UserPermissions();


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const {
        data: allData,
        isLoading,
        isFetching,
    } = useGetbankQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetbankByIdQuery(id, { skip: !id });
    const {
        data: cityList,
        isLoading: cityLoading,
        isFetching: cityFetching,
    } = useGetCityQuery({ params });

    const [addData] = useAddbankMutation();
    const [updateData] = useUpdatebankMutation();
    const [removeData] = useDeletebankMutation();

    const handleCreate = () => {
        hasPermission(() => {
            setForm(true);
            onNew();
        }, "create");
    };

    const syncFormWithDb = useCallback(
        (data) => {
            setName(data?.name || "");
            setAccNo(data?.accNo || "");
            setIfsc(data?.ifsc || "");
            setSwiftCode(data?.swiftCode || "");
            setBranchId(data?.branchId || "");
            setActive(data?.active ?? true);
            childRecord.current = data?.childRecord ? data?.childRecord : 0;
        },
        [id]
    );

    useEffect(() => {
        if (singleData?.data) {
            syncFormWithDb(singleData.data);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name,
        accNo,
        ifsc,
        swiftCode,
        branchId,
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
        active,
        id,
    };

    const validateData = (data) => {
        if (data.name && data.accNo && data.ifsc && data.branchId) {
            return true;
        }
        return false;
    };


    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id);
            if (onSuccess) {
                await Swal.fire({
                    title: text + "  " + "Successfully",
                    icon: "success",
                });
                onSuccess(returnData.data.id);
                return;
            }
            if (nextProcess == "new") {
                syncFormWithDb(undefined)
                onNew()
                bankNameRef?.current?.focus();
            } else {
                setForm(false)
                syncFormWithDb(undefined);
            }
            await Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
            });
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Submission error',
                text: error.data?.message || 'Something went wrong!',
            });
            bankNameRef.current?.focus();
        }
    };

    const saveData = (nextProcess) => {
        const upperName = name.toUpperCase();

        const finalData = {
            ...data,
            name: upperName,
        };

        if (!validateData(finalData)) {
            Swal.fire({
                title: 'Please fill all required fields...!',
                icon: 'error',
                didClose: () => {
                    bankNameRef?.current?.focus();
                }
            });
            return;
        }
        let foundItem;

        if (id) {
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item?.name.toUpperCase() === upperName && item.branchId === branchId);
        } else {
            foundItem = allData?.data?.some(item => item?.name.toUpperCase() === upperName && item.branchId === branchId);
        }


        if (foundItem) {
            Swal.fire({
                text: "The Bank Name already exists for this branch.",
                icon: "warning",
                didClose: () => {
                    bankNameRef?.current?.focus();
                }
            });
            return false;
        }
        if (id) {
            if (!window.confirm("Are you sure update the details ...?")) {
                return;
            }
        }
        if (id) {
            handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, finalData, "Added", nextProcess);
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
                        icon: 'error',
                        title: 'Submission error',
                        text: deldata.data?.message || 'Something went wrong!',
                    });
                    return;
                }
                setId("");
                await Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                });
                setForm(false);
                syncFormWithDb(undefined);
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
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
            header: "Bank Name",
            accessor: (item) => item?.name,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-left uppercase w-72",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },



    ];

    const {
        firstInputRef: bankNameRef,
        toggleButtonRef,
        saveCloseButtonRef,
        saveNewButtonRef,
    } = refs;

    useEffect(() => {
        if ((form || onSuccess) && bankNameRef.current) {
            bankNameRef.current.focus();
        }
    }, [form, onSuccess]);

    const formBody = (
        <div className="flex-1 p-3">
            <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                <div className="p-2" ref={formRef}>
                    <div className="flex gap-x-2">
                        <div className="mb-3 w-3/4">
                            <TextInputNew1
                                name="Bank Name"
                                type="text"
                                value={name}
                                setValue={setName}
                                required={true}
                                readOnly={readOnly}
                                ref={bankNameRef}
                                disabled={childRecord.current > 0}
                            />
                        </div>
                        <div className="mb-3 ">
                            <TextInputNew
                                name="Acc No"
                                type="acc_no"
                                value={accNo}
                                setValue={setAccNo}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                            />
                        </div>

                    </div>
                    <div className="flex gap-x-2">
                        <div className="mb-3 w-[50%]">
                            <TextInputNew
                                name="IFSC Code"
                                type="ifsc"
                                value={ifsc}
                                setValue={setIfsc}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                            />
                        </div>
                        <div className="mb-3 w-[50%]">
                            <TextInputNew
                                name="Swift Code"
                                type="swift"
                                value={swiftCode}
                                setValue={setSwiftCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                            />
                        </div>
                    </div>
                    <div className="w-[50%] mb-3">

                        <DropdownWithModal
                            name="Branch/City Name"
                            options={dropDownListMergedObject(
                                id
                                    ? cityList?.data
                                    : cityList?.data?.filter((item) => item.active),
                                "name",
                                "id",
                            )}
                            masterName="CITY MASTER"
                            required={true}
                            value={branchId}
                            setValue={setBranchId}
                            readOnly={readOnly}
                            className={`focus:ring-2 focus:ring-blue-100`}
                            addNewLabel="+ Add New City"
                            childComponent={CityMaster}
                            addNewModalWidth="w-[50%] h-[55%]"
                            disabled={childRecord.current > 0}
                        />
                    </div>

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
        </div>
    );


    if (deleteId) {
        const childCount = singleData?.data?.childRecord ?? 0;
        const isLoadingRecord = isSingleFetching || isSingleLoading;

        const handleConfirmDelete = async () => {
            try {
                const res = await removeData(deleteId).unwrap();
                if (res?.statusCode === 1) {
                    toast.error(res?.data?.message || "Cannot delete: child records exist");
                    return;
                }
                toast.success("Bank deleted successfully");
                onSuccess?.();
            } catch (err) {
                toast.error(err?.data?.message || "Failed to delete Bank");
            }
        };

        return (
            <div className="flex flex-col bg-gray-200 min-h-[250px]">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">Delete Bank</h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 mb-3 rounded">
                    {isLoadingRecord ? (
                        <p className="text-xs text-gray-400">Checking records...</p>
                    ) : childCount > 0 ? (
                        <>
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <p className="text-sm font-semibold text-red-600">Cannot Delete</p>
                                <p className="text-xs text-gray-600 text-center">
                                    <span className="font-semibold">"{deleteLabel}"</span> has{" "}
                                    <span className="font-semibold text-red-600">{childCount} linked state{childCount > 1 ? "s" : ""}</span>.
                                    Remove them first before deleting this Bank.
                                </p>
                            </div>
                            <button type="button" onClick={onClose}
                                className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
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
                                <button type="button" onClick={onClose}
                                    className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleConfirmDelete}
                                    className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded">
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
            <div onKeyDown={handleKeyDown} className="h-full flex flex-col bg-gray-200">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                        {editId ? "Edit Bank" : "Add New Bank"}
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

    return (
        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-lg font-bold text-gray-800">Bank Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={handleCreate}
                        className="bg-white border h-6  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Bank
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
                        widthClass={"w-[38%] h-[440px]"}
                        onClose={() => {
                            setForm(false);
                            syncFormWithDb(undefined);
                            setId("");
                        }}
                    >
                        <div className="h-full flex flex-col  bg-gray-200">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Bank Master"
                                                : "Bank Master"
                                            : "Add New Bank"}
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
                                                    saveData("close")
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
                                        {(!readOnly && !id) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    saveData("new")
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
                    </Modal>
                )}
            </div>
        </div>
    );
}
