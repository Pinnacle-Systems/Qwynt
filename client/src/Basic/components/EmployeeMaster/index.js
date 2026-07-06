import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetEmployeeQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "../../../redux/services/EmployeeMasterService";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import LiveWebCam from "../LiveWebCam";

import { toast } from "react-toastify";
import {
  ReusableTable,
  ToggleButton,
  TextInputNew,
  DropdownInputNew,
  DateInputNew,
  TextAreaNew,
  TextInputNew1,
} from "../../../Inputs";
import {
  dropDownListObject,
  dropDownListMergedObject,
} from "../../../Utils/contructObject";
import Modal from "../../../UiComponents/Modal";
import {
  statusDropdown,
  genderList,
  maritalStatusList,
  bloodList,
} from "../../../Utils/DropdownData";
import moment from "moment";
import { useGetEmployeeCategoryQuery } from "../../../redux/services/EmployeeCategoryMasterService";
import { getCommonParams, viewBase64String } from "../../../Utils/helper";
import SingleImageFileUploadComponent from "../SingleImageUploadComponent";
import EmployeeLeavingForm from "./EmployeeLeavingForm";
import { useGetDepartmentQuery } from "../../../redux/services/DepartmentMasterService";
import { Check, LayoutGrid, Plus, Power, Table } from "lucide-react";
import imageDefault from "../../../assets/default-dp.png";
import Swal from "sweetalert2";
import { CityMaster, DepartmentMaster, EmployeeCategoryMaster } from "..";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { UserPermissions } from "../../../Utils/UserPermissions";

export default function Form() {
  const [form, setForm] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const [readOnly, setReadOnly] = useState(false);

  const [id, setId] = useState("");
  const [panNo, setPanNo] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [chamberNo, setChamberNo] = useState("");
  const [localAddress, setlocalAddress] = useState("");
  const [localCity, setLocalCity] = useState("");
  const [localPincode, setLocalPincode] = useState("");
  const [mobile, setMobile] = useState("");
  const [degree, setDegree] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [salaryPerMonth, setSalaryPerMonth] = useState("");
  const [commissionCharges, setCommissionCharges] = useState("");
  const [gender, setGender] = useState("");
  const [regNo, setRegNo] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [permAddress, setPermAddress] = useState("");
  const [permCity, setPermCity] = useState("");
  const [permPincode, setPermPincode] = useState("");
  const [email, setEmail] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [consultFee, setConsultFee] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscNo, setIfscNo] = useState("");
  const [branchName, setbranchName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeCategory, setEmployeeCategory] = useState();
  const [permanent, setPermanent] = useState("");
  const [active, setActive] = useState(true);
  const [bankName, setBankName] = useState("");
  // Employee Leaving form fields
  const [leavingForm, setLeavingForm] = useState(false);
  const [employeeId, setEmployeeId] = useState("");

  const [leavingDate, setLeavingDate] = useState("");
  const [leavingReason, setLeavingReason] = useState("");
  const [canRejoin, setCanRejoin] = useState("");
  const [rejoinReason, setRejoinReason] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [image, setImage] = useState(null);

  const childRecord = useRef(0);
  const [view, setView] = useState("table");

  const { branchId, userId, companyId, finYearId } = getCommonParams();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const { data: cityList } = useGetCityQuery({ params });

  const { data: employeeCategoryList } = useGetEmployeeCategoryQuery({
    params,
  });

  const { data: departmentList } = useGetDepartmentQuery({ params });
  const { data: allData } = useGetEmployeeQuery({
    params,
    searchParams: searchValue,
  });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetEmployeeByIdQuery(id, { skip: !id });

  const [addData] = useAddEmployeeMutation();
  const [updateData] = useUpdateEmployeeMutation();
  const [removeData] = useDeleteEmployeeMutation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      // if (id) setReadOnly(true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;

      setPanNo(data?.panNo ? data?.panNo : "");
      setName(data?.name ? data?.name : "");
      setFatherName(data?.fatherName ? data?.fatherName : "");
      setDob(data?.dob ? moment.utc(data?.dob).format("YYYY-MM-DD") : "");
      setChamberNo(data?.chamberNo ? data?.chamberNo : "");
      setlocalAddress(data?.localAddress ? data?.localAddress : "");
      setLocalCity(data?.localCity?.id ? data?.localCity?.id : "");
      setLocalPincode(data?.localPincode ? data?.localPincode : "");
      setMobile(data?.mobile ? data?.mobile : "");
      setDegree(data?.degree ? data?.degree : "");
      setSpecialization(data?.specialization ? data?.specialization : "");
      setSalaryPerMonth(data?.salaryPerMonth ? data?.salaryPerMonth : "");
      setCommissionCharges(
        data?.commissionCharges ? data?.commissionCharges : "",
      );
      setGender(data?.gender ? data?.gender : "");
      setRegNo(data?.regNo ? data?.regNo : "New");
      setJoiningDate(
        data?.joiningDate
          ? moment.utc(data?.joiningDate).format("YYYY-MM-DD")
          : "",
      );
      setPermAddress(data?.permAddress ? data?.permAddress : "");
      setPermCity(data?.permCity ? data?.permCity?.id : "");
      setPermPincode(data?.permPincode ? data?.permPincode : "");
      setEmail(data?.email ? data?.email : "");
      setMaritalStatus(data?.maritalStatus ? data?.maritalStatus : "");
      setConsultFee(data?.consultFee ? data?.consultFee : "");
      setAccountNo(data?.accountNo ? data?.accountNo : "");
      setIfscNo(data?.ifscNo ? data?.ifscNo : "");
      setbranchName(data?.branchName ? data?.branchName : "");
      setBloodGroup(data?.bloodGroup ? data?.bloodGroup : "");
      setDepartment(data?.departmentId ? data?.department?.id : "");
      setImage(data?.imageBase64 ? viewBase64String(data?.imageBase64) : null);
      setEmployeeCategory(
        data?.employeeCategoryId ? data?.employeeCategoryId : "",
      );
      setPermanent(data?.permanent ? data?.permanent : "");
      setActive(data ? data.active : true);
      setBankName(data?.bankName ? data?.bankName : "");
      // Employee Leaving Form states
      setLeavingDate(data?.leavingDate ? data?.leavingDate : "");
      setLeavingReason(data?.leavingReason ? data?.leavingReason : "");
      setCanRejoin(data?.canRejoin ? data?.canRejoin : false);
      setRejoinReason(data?.rejoinReason ? data?.rejoinReason : "");
      secureLocalStorage.setItem(
        sessionStorage.getItem("sessionId") + "currentEmployeeSelected",
        data?.id,
      );
      setEmployeeId(data?.employeeId ? data?.employeeId : "");
    },
    [id],
  );
  const [dispatchInvalidate] = useInvalidateTags();

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    branchId,
    userId,
    companyId,
    finYearId,
    panNo,
    name,
    fatherName,
    dob,
    chamberNo,
    localAddress,
    localCity,
    localPincode,
    mobile,
    degree,
    specialization,
    salaryPerMonth,
    commissionCharges,
    gender,
    joiningDate,
    permAddress,
    permCity,
    permPincode,
    email,
    maritalStatus,
    consultFee,
    accountNo,
    ifscNo,
    branchName,
    bloodGroup,
    ...(department && { department }),
    employeeCategoryId: employeeCategory,
    permanent,
    active,
    id,
    leavingReason,
    leavingDate,
    canRejoin,
    rejoinReason,
    bankName,
    employeeId,
    employeeCategory,
  };
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // ABCDE1234F

  const validateData = (data) => {
    let newErrors = {};

    if (!data.name) newErrors.name = "Full Name is required";
    if (!data.gender) newErrors.gender = "Gender is required";
    if (!data.bloodGroup) newErrors.bloodGroup = "Blood Group is required";
    if (!data.dob) newErrors.dob = "Date of Birth is required";
    if (!data.employeeCategory)
      newErrors.employeeCategory = "Employee Category is required";
    if (!data.department) newErrors.department = "Department is required";
    if (!data.joiningDate) newErrors.joiningDate = "Joining Date is required";
    if (!data.employeeId) newErrors.employeeId = "Employee Id is required";
    if (!data.mobile) newErrors.mobile = "Mobile No is required";
    if (!data.localAddress) newErrors.localAddress = "Address is required";
    if (!data.permCity) newErrors.permCity = "City is required";
    if (!data.permPincode) newErrors.permPincode = "Pincode is required";
    if (!data.maritalStatus)
      newErrors.maritalStatus = "Marital Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return mobileRegex.test(mobile);
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/; // 6 digit pincode, not starting with 0
    return pincodeRegex.test(pincode);
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      const formData = new FormData();

      for (let key in data) {
        formData.append(key, data[key]);
      }

      if (image instanceof File) {
        formData.append("image", image);
      } else if (!image) {
        formData.append("isDeleteImage", true);
      }

      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }

      await Swal.fire({
        title: text + " Successfully",
        icon: "success",
        didClose: () => {
          setTimeout(() => {
            countryNameRef.current?.focus();
          }, 100);
        },
      });

      if (nextProcess === "new") {
        // reset form
        syncFormWithDb(undefined);
        onNew();
      } else {
        setForm(false);
        setId("");
        syncFormWithDb(undefined);
      }

      dispatchInvalidate();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message || "Something went wrong!",
      });
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        didClose: () => countryNameRef.current?.focus(),
      });
      return;
    }
    if (data.mobile && !validateMobile(data.mobile)) {
      Swal.fire({
        title: "Invalid Mobile Number",
        text: "Please enter a valid 10-digit Indian mobile number starting with 6-9",
        icon: "error",
        confirmButtonColor: "#3085d6",
        didClose: () => {
          // Focus on mobile input field if you have a ref for it
          // mobileRef.current?.focus();
        },
      });
      return;
    }

    // Step 3: Validate permanent pincode format
    if (data.permPincode && !validatePincode(data.permPincode)) {
      Swal.fire({
        title: "Invalid Pincode",
        text: "Please enter a valid 6-digit pincode",
        icon: "error",
        confirmButtonColor: "#3085d6",
        didClose: () => {
          // Focus on pincode input field if you have a ref for it
          // pincodeRef.current?.focus();
        },
      });
      return;
    }
    if (data.panNo && !panRegex.test(data.panNo.toUpperCase())) {
      Swal.fire({
        title: "Invalid PAN Number",
        text: "Format: ABCDE1234F",
        icon: "error",
      });
      return;
    }
    let foundItem;

    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id != id)
        ?.some((item) => item.name === name);
    } else {
      foundItem = allData?.data?.some((item) => item.name === name);
    }

    if (foundItem) {
      Swal.fire({
        text: "The Employee Name already exists.",
        icon: "warning",
      });
      return;
    }

    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) return;
    }

    if (!JSON.parse(active)) {
      setLeavingForm(true);
      return;
    }

    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const deleteData = async (id, childRecord) => {
    if (childRecord) {
      Swal.fire({
        title: "Child Record Exists",
        icon: "error",
      });
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id);
        setId("");
        dispatchInvalidate();

        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        syncFormWithDb(undefined);
      } catch (error) {
        toast.error("something went wrong");
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

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = ["Employee Id", "Name", "Employee Category"];
  const tableDataNames = [
    "dataObj.regNo",
    "dataObj.name",
    "dataObj?.EmployeeCategory?.name",
  ];
  const submitLeavingForm = () => {
    console.log("sdfsdfsdfsdf");
    if (id) {
      console.log("called id");
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      console.log("called no id");
      handleSubmitCustom(addData, data, "Added");
    }
    setLeavingForm(false);
  };

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
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
      header: "Employee Id",
      accessor: (item) => item?.regNo,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-40",
    },

    {
      header: "Employee Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-72",
    },
    {
      header: "Employee Category",
      accessor: (item) => item?.EmployeeCategory?.name,
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-48",
    },
    {
      header: "Gender",
      accessor: (item) => item?.gender,
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-24",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },
  ];

  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  const handleKeyNext = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!data.employeeCategory)
        newErrors.employeeCategory = "Employee Category is required";
      if (!data.name) newErrors.name = "Name is required";
      if (!data.joiningDate) newErrors.joiningDate = "Joining Date is required";
      if (!data.department) newErrors.department = "Select a department";
    } else if (step === 2) {
      if (!data.mobile) newErrors.mobile = "Mobile No is required";
    } else if (step === 3) {
      if (!data.dob) newErrors.dob = "Date of Birth is required";
      if (!data.gender) newErrors.gender = "Gender is required";
    } else if (step === 4) {
      if (!data.localAddress) newErrors.localAddress = " Address is required";
      if (!data.localPincode) newErrors.localPincode = " Pincode is required";
      if (!data.localCity) newErrors.localCity = " City is required";
    } else if (step === 6) {
      if (!data.active) newErrors.active = "Set Status";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const countryNameRef = useRef(null);

  useEffect(() => {
    if (form && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form]);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const errorClass = (field) =>
    errors[field] ? "border-red-500 bg-red-50" : "";

  return (
    <div onKeyDown={handleKeyDown} className="p-1 ">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h1 className="text-lg font-bold text-gray-800">Employee Master</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCreate}
            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Employee
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                view === "table"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Table size={16} />
              Table
            </button>
            <button
              onClick={() => setView("card")}
              className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                view === "card"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutGrid size={16} />
              Cards
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-100  rounded-xl shadow overflow-hidden">
        <div className="pt-2">
          {view === "table" ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ReusableTable
                columns={columns}
                data={allData?.data}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={deleteData}
                itemsPerPage={10}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allData?.data?.map((employee, index) => (
                <div
                  key={index}
                  onClick={() => onDataClick(employee.id)}
                  className={`border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
                    employee?.active ? "border-green-200" : "border-red-200"
                  }`}
                >
                  <div
                    className={`p-4 ${
                      employee?.active ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={employee?.imageBase64 || imageDefault}
                        alt="Profile"
                        className={`w-12 h-12 object-cover rounded-full border-2 ${
                          employee?.active
                            ? "border-green-500"
                            : "border-red-500"
                        }`}
                      />
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">
                          {employee?.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {employee?.regNo}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Department</p>
                        <p className="font-medium">
                          {employee?.department?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p
                          className={`font-medium ${
                            employee?.active ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {employee?.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Mobile</p>
                        <p className="font-medium">{employee?.mobile || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium truncate">
                          {employee?.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[95%] h-[93vh]"}
          onClose={() => {
            setForm(false);
            syncFormWithDb(undefined);
            setId("");
            setErrors({});
          }}
        >
          <div className="h-full flex flex-col bg-gray-200">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-2">
              <div className="flex items-center gap-2 ">
                <h2 className="text-lg font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Employee"
                      : "Employee Master"
                    : "Add New Employee"}
                </h2>
              </div>

              <div className="flex gap-2">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => saveData("close")}
                    className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
      border border-blue-600 flex items-center gap-1 text-xs"
                  >
                    <Check size={14} />
                    {id ? "Update" : "Save & Close"}
                  </button>
                )}

                {!readOnly && !id && (
                  <button
                    type="button"
                    onClick={() => saveData("new")}
                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
      border border-green-600 flex items-center gap-1 text-xs"
                  >
                    <Check size={14} />
                    Save & New
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-3 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <SingleImageFileUploadComponent
                      setWebCam={setCameraOpen}
                      disabled={readOnly}
                      image={image}
                      setImage={setImage}
                      className="mb-3"
                    />

                    <div className="space-y-2">
                      <TextInputNew1
                        ref={countryNameRef}
                        name="Full Name"
                        value={name}
                        setValue={(val) => {
                          setName(val);
                          clearError("name");
                        }}
                        required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        className={errorClass("name")}
                      />
                      {errors.name && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.name}
                        </span>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <DropdownInputNew
                            ref={input2Ref}
                            name="Gender"
                            options={genderList}
                            value={gender}
                            setValue={(val) => {
                              setGender(val);
                              clearError("gender");
                            }}
                            required
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className={errorClass("gender")}
                          />
                          {errors.gender && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.gender}
                            </span>
                          )}
                        </div>

                        <div>
                          <DropdownInputNew
                            name="Blood Group"
                            options={bloodList}
                            value={bloodGroup}
                            setValue={(val) => {
                              setBloodGroup(val);
                              clearError("bloodGroup");
                            }}
                            required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className={errorClass("bloodGroup")}
                          />
                          {errors.bloodGroup && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.bloodGroup}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <DateInputNew
                          name="Date of Birth"
                          value={dob}
                          setValue={(val) => {
                            setDob(val);
                            clearError("dob");
                          }}
                          required
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          type={"date"}
                          className={errorClass("dob")}
                        />
                        {errors.dob && (
                          <span className="text-red-500 text-xs ml-1 mt-1">
                            {errors.dob}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3  rounded-md border border-gray-200 mt-2 h-[90px]">
                    {/* <h3 className="font-medium text-gray-800 mb-2 text-sm">Employment Status</h3> */}
                    <div className="space-y-3 mt-2 ">
                      <ToggleButton
                        name="Employment Status"
                        options={statusDropdown}
                        value={active}
                        setActive={setActive}
                        required={true}
                        readOnly={readOnly}
                      />
                      {errors.active && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.active}
                        </span>
                      )}

                      {!active && (
                        <button
                          type="button"
                          onClick={() => setLeavingForm(true)}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Add Leaving Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Official Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <DropdownWithModal
                          name="Employee Category"
                          options={dropDownListObject(
                            id
                              ? employeeCategoryList?.data
                              : employeeCategoryList?.data?.filter(
                                  (item) => item?.active,
                                ),
                            "name",
                            "id",
                          )}
                          value={employeeCategory}
                          setValue={(val) => {
                            setEmployeeCategory(val);
                            clearError("employeeCategory");
                          }}
                          required={true}
                          readOnly={readOnly}
                          // className={`w-[150px]`}
                          disabled={childRecord.current > 0}
                          addNewLabel="+ Add New Employee Category"
                          childComponent={EmployeeCategoryMaster}
                          addNewModalWidth="w-[40%] h-[45%]"
                          className={errorClass("employeeCategory")}
                        />
                        {errors.employeeCategory && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.employeeCategory}
                          </span>
                        )}
                      </div>

                      <div>
                        <DropdownWithModal
                          name="Department"
                          options={dropDownListObject(
                            id
                              ? departmentList?.data
                              : departmentList?.data?.filter(
                                  (item) => item?.active,
                                ),
                            "name",
                            "id",
                          )}
                          value={department}
                          setValue={(val) => {
                            setDepartment(val);
                            clearError("department");
                          }}
                          required={true}
                          readOnly={readOnly}
                          className={errorClass("department")}
                          disabled={childRecord.current > 0}
                          addNewLabel="+ Add New Department"
                          childComponent={DepartmentMaster}
                          addNewModalWidth="w-[40%] h-[45%]"
                        />
                        {errors.department && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.department}
                          </span>
                        )}
                      </div>

                      <div>
                        <TextInputNew1
                          name="Designation"
                          value={chamberNo}
                          setValue={setChamberNo}
                          readOnly={readOnly}
                          // required={isCurrentEmployeeDoctor(employeeCategory)}
                          // disabled={childRecord.current > 0}
                        />
                      </div>

                      <div className="">
                        <DateInputNew
                          name="Joining Date"
                          value={joiningDate}
                          setValue={(val) => {
                            setJoiningDate(val);
                            clearError("joiningDate");
                          }}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          type={"date"}
                          className={errorClass("joiningDate")}
                        />
                        {errors.joiningDate && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.joiningDate}
                          </span>
                        )}
                      </div>
                      <div>
                        <TextInputNew1
                          name="Employee ID"
                          value={employeeId}
                          setValue={(val) => {
                            setEmployeeId(val);
                            clearError("employeeId");
                          }}
                          readOnly={readOnly}
                          required={true}
                          disabled={childRecord.current > 0}
                          className={errorClass("employeeId")}
                        />
                        {errors.employeeId && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.employeeId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[250px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <TextInputNew1
                          name="Father Name"
                          value={fatherName}
                          setValue={setFatherName}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                        />
                        {errors.fatherName && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.fatherName}
                          </span>
                        )}
                      </div>

                      <div>
                        <DropdownInputNew
                          name="Marital Status"
                          options={maritalStatusList}
                          value={maritalStatus}
                          setValue={(val) => {
                            setMaritalStatus(val);
                            clearError("maritalStatus");
                          }}
                          required
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className={errorClass("maritalStatus")}
                        />
                        {errors.maritalStatus && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.maritalStatus}
                          </span>
                        )}
                      </div>

                      <div>
                        <TextInputNew
                          name="Pan No"
                          value={panNo}
                          setValue={setPanNo}
                          type="pan_no"
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                        />
                        {errors.panNo && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.panNo}
                          </span>
                        )}
                      </div>

                      <div>
                        <TextInputNew1
                          name="Degree"
                          value={degree}
                          setValue={setDegree}
                          readOnly={readOnly}
                        />
                        {errors.degree && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.degree}
                          </span>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <TextInputNew1
                          name="Specialization"
                          value={specialization}
                          setValue={setSpecialization}
                          readOnly={readOnly}
                        />
                        {errors.specialization && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Bank Details
                    </h3>
                    <div className="space-y-2">
                      <div className="col-span-1">
                        <TextInputNew1
                          name="Bank Name"
                          value={bankName}
                          setValue={setBankName}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                        />
                      </div>
                      <div className="col-span-1">
                        <TextInputNew1
                          name="Branch Name"
                          value={branchName}
                          setValue={setbranchName}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <TextInputNew
                          name="IFSC No"
                          value={ifscNo}
                          setValue={setIfscNo}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                        />

                        <TextInputNew
                          name="Account No"
                          type="number"
                          value={accountNo}
                          setValue={setAccountNo}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200 sticky">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <TextInputNew
                            name="Mobile No"
                            type="mobile"
                            value={mobile}
                            setValue={(val) => {
                              setMobile(val);
                              clearError("mobile");
                            }}
                            required={true}
                            readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className={errorClass("mobile")}
                          />
                          {errors.mobile && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.mobile}
                            </span>
                          )}
                        </div>

                        <TextInputNew
                          name="Email Id"
                          type="email"
                          value={email}
                          setValue={setEmail}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                        />
                      </div>
                      <div>
                        <TextAreaNew
                          name="Address"
                          rows="2"
                          value={localAddress}
                          setValue={(val) => {
                            setlocalAddress(val);
                            clearError("localAddress");
                          }}
                          required
                          readOnly={readOnly}
                          className={errorClass("localAddress")}

                          // disabled={childRecord.current > 0}
                        />
                        {errors.localAddress && (
                          <span className="text-red-500 text-xs ml-1 mt-1">
                            {errors.localAddress}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <TextInputNew
                            name="Pincode"
                            type="pincode"
                            value={permPincode}
                            setValue={(val) => {
                              setPermPincode(val);
                              clearError("permPincode");
                            }}
                            readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            required
                            className={errorClass("permPincode")}
                          />
                          {errors.permPincode && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.permPincode}
                            </span>
                          )}
                        </div>
                        <div>
                          <DropdownWithModal
                            name="City/State Name"
                            options={dropDownListMergedObject(
                              id
                                ? cityList?.data
                                : cityList?.data?.filter((item) => item.active),
                              "name",
                              "id",
                            )}
                            // country={country}
                            masterName="CITY MASTER"
                            // lastTab={activeTab}
                            value={permCity}
                            setValue={(val) => {
                              setPermCity(val);
                              clearError("permCity");
                            }}
                            required={true}
                            readOnly={readOnly}
                            className={`focus:ring-2 focus:ring-blue-100 ${errorClass("permCity")}`}
                            addNewLabel="+ Add New City"
                            childComponent={CityMaster}
                            addNewModalWidth="w-[40%] h-[55%]"
                          />
                          {errors.permCity && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.permCity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Modal isOpen={cameraOpen} onClose={() => setCameraOpen(false)}>
            <LiveWebCam
              picture={image}
              setPicture={setImage}
              onClose={() => setCameraOpen(false)}
            />
          </Modal>

          <Modal isOpen={leavingForm} onClose={() => setLeavingForm(false)}>
            <EmployeeLeavingForm
              leavingReason={leavingReason}
              setLeavingReason={setLeavingReason}
              leavingDate={leavingDate}
              setLeavingDate={setLeavingDate}
              canRejoin={canRejoin}
              setCanRejoin={setCanRejoin}
              rejoinReason={rejoinReason}
              setRejoinReason={setRejoinReason}
              onSubmit={submitLeavingForm}
              onClose={() => setLeavingForm(false)}
            />
          </Modal>
        </Modal>
      )}
    </div>
  );
}
