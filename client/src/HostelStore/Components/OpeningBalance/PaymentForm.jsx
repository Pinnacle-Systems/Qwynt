import { useEffect, useRef } from "react";
import { amountInWords } from "../../../Utils/helper";
import { partyType } from "../../../Utils/DropdownData";


import { DropdownInputNew, TextInputNew } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";

import { HiOutlineRefresh } from "react-icons/hi";
import { FiEdit2, FiSave } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";

const PaymentForm = ({ onClose, docId, date, setDate, partCategory, setPartyCategory,
    dropDownData,
    partyId, setPartyId, amount, setAmount, readOnly, setReadOnly, paidAmount, setPaidAmount, childRecord, saveData

}) => {



    const handleChange = (e) => {
        const value = e.target.value;
        // if (/^\d*$/.test(value)) {
        setPaidAmount(value);
        // }
    };
    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === 's') {
            event.preventDefault();
            saveData();
        }
    }

    const inputRef = useRef(null);


    useEffect(() => {
        inputRef.current?.focus();
    }, []);



    return (
        <>


            <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-[85vh] relative'>

                <div className='flex flex-col w-full '>

                    <div className="w-full  mx-auto rounded-md shadow-lg px-2 overflow-y-auto">
                        <div className="flex justify-between items-center mb-1">
                            <h1 className="text-2xl font-bold text-gray-800">Opening Balance</h1>
                            <button
                                onClick={() => {

                                    onClose()

                                }
                                }
                                className="text-indigo-600 hover:text-indigo-700"
                                title="Open Report"
                            >
                                <FaFileAlt className="w-5 h-5" />
                            </button>
                        </div>

                    </div>

                    <div className="w-full p-11 mt-3 bg-gray-100 border border-gray-200">
                        <div className="flex gap-x-8">
                            <div className="">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Opening Balance No</label>
                                <input
                                    type="text"
                                    value={docId}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-slate-100 text-xs"
                                    readOnly
                                />
                            </div>
                            <div className="w-32">
                                <TextInputNew

                                    name="Opening Balance Date"
                                    value={date}
                                    setValue={setDate}
                                    type="date"
                                    required
                                    ref={inputRef}

                                />
                            </div>
                            <div className="w-36">
                                <label htmlFor="paymentType" className="block text-xs font-bold text-gray-600 mb-1 ">
                                    Customer / Supplier <span className="text-red-500">*</span>
                                </label>
                                <select name="" id="" className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
                                          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                          transition-all duration-150 shadow-sm ${readOnly ? "bg-slate-100" : ""}
                                         `} value={partCategory} onChange={(e) => setPartyCategory(e.target.value)}>

                                    <option value="" >
                                        Select
                                    </option>
                                    {partyType?.map((val, index) => (
                                        <option key={index} value={val.value}>
                                            {val.show}
                                        </option>
                                    ))

                                    }
                                </select>
                            </div>

                            <div className="mb-2 w-[580px] flex-wrap">
                                <label htmlFor="paymentType" className="block text-xs font-bold text-gray-600 mb-1 ">
                                    {
                                        !partCategory
                                            ? "Select Party Type"
                                            : partCategory === "customer"
                                                ? "Customer Name"
                                                : "Supplier Name"
                                    }
                                    <span className="text-red-500">*</span>
                                </label>
                                <DropdownInputNew

                                    className="block text-gray-600 font-medium mb-2"
                                    options={dropDownListObject(
                                        // supplierData.filter((value) => value.isCustomer && value.active),
                                        dropDownData,
                                        "name",
                                        "id"
                                    )}
                                    value={partyId}
                                    setValue={setPartyId}
                                    required
                                    readOnly={readOnly}
                                    disabled={childRecord.current > 0}
                                />
                            </div>
                            <div className="w-40">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value)
                                        handleChange(e)
                                    }
                                    }
                                    onBlur={() => {
                                        if (amount !== "" && !isNaN(amount)) {
                                            setAmount(Number(amount).toFixed(2));
                                        }
                                    }}
                                    placeholder="amount"
                                    readOnly={readOnly}


                                    className={`w-full text-right pr-2 px-3 py-1.5 text-xs border border-gray-300 rounded-lg
                                          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                          transition-all duration-150 shadow-sm ${readOnly ? "bg-slate-100" : ""}
                                         `}
                                />
                            </div>

                        </div>

                        <div className="mt-5 justify-center items-center">

                            <p className="text-sm text-gray-700 text-center">
                                Amount in words: <span className="text-green-700 font-semibold">
                                    {amountInWords(parseFloat(paidAmount ? paidAmount : 0))}

                                </span>
                            </p>
                        </div>
                    </div>


                </div>
                <div className='flex flex-col absolute bottom-3 w-full'>

                    <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                        {/* Left Buttons */}
                        <div className="flex gap-2 ml-2 flex-wrap">
                            <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Save & Close
                            </button>
                            <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <FiSave className="w-4 h-4 mr-2" />
                                Save & New
                            </button>

                        </div>

                        {/* Right Buttons */}
                        <div className="flex gap-2 flex-wrap mr-2">

                            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                onClick={() => setReadOnly(false)}
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Edit
                            </button>

                        </div>
                    </div>
                </div>

            </div>

        </>
    )
}

export default PaymentForm