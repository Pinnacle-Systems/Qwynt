import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'
import { useGetRequirementPlanningFormItemsQuery } from '../../../redux/uniformService/RequirementPlanningFormServices'



export default function OrderDetailsSelection({ id, tempPoItems, setPoItems, poItems = [], onClose, readOnly, setPoType, poMaterial

}) {


    console.log(tempPoItems, "tempPoItems")

    function handleDone() {
        onClose()

    }

    function addItem(id, obj) {
        setPoItems(prevItems => {
            let newItems = structuredClone(prevItems);

            const index = newItems?.findIndex(v => v?.yarnId === "");


            if (index !== -1) {
                newItems[index] = obj;
            } else {
                newItems.push(obj);
            }

            return newItems;
        });
    }
    function removeItem(id) {
        setPoItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item => parseInt(item.id) !== parseInt(id))
            return newItems
        });
    }

    function handleChange(id, obj) {
        console.log(id, "iddddd")

        if (isItemAdded(id)) {
            removeItem(id)
        } else {
            addItem(id, obj)
        }
    }

    function isItemAdded(id) {
        console.log(id, "id")

        return (poItems || [])?.findIndex(item => parseInt(item?.id) === parseInt(id)) !== -1
    }

    function handleSelectAllChange(value, poItems) {
        if (value) {
            poItems?.forEach(item => addItem(item.id, item))
        } else {
            poItems?.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(poItems) {
        return poItems?.every(item => isItemAdded(item.id))
    }






    return (

        <>

            <div className='border border-gray-200  shadow-sm bg-[#f1f1f0]'>
                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                            Purchase Items
                        </h2>

                    </div>
                    <div className="flex gap-2">

                        <div className="flex gap-2">
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={handleDone}
                                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                        border border-green-600 flex items-center gap-1 text-xs"
                                >
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto rounded-md ">

                    <div className="h-full flex flex-col bg-[#f1f1f0] px-1 w-full max-h-[480px]">

                        <div className="flex flex-row w-full">
                            <div className="flex flex-col w-full">
                                <div className="mt-4 mb-5 w-full">

                                    <div className=" w-[88vw] overflow-auto ">

                                        <table className="border-collapse w-full">
                                            <thead className="bg-gray-200 text-gray-800">
                                                <tr>
                                                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                                                        <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, tempPoItems ? tempPoItems : [])}
                                                            checked={getSelectAll(tempPoItems ? tempPoItems : [])}
                                                        />
                                                    </th>
                                                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">S No</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-20">Order No</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-52">Style No</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-72">Yarn</th>
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs text-gray-800  w-24">Color</th>
                                                    {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Counts</th> */}
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-9">Required Qty </th>
                                                    {/* <th className="px-4 py-1.5 border border-gray-300 text-xs  w-20">Already Purchased Qty</th> */}
                                                    <th className="px-4 py-1.5 border border-gray-300 text-xs  w-10">Balance  Qty </th>







                                                </tr>
                                            </thead>





                                            {/* <tbody>

                                                {tempPoItems?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                                                            No data found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tempPoItems?.map((item, index) => (
                                                        <tr
                                                            key={index}
                                                            className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                                                }`}
                                                            onClick={() => {
                                                                if (item?.balanceQty !== 0) {
                                                                    handleChange(item.id, item)
                                                                }
                                                            }}
                                                        >
                                                            <td className='py-1 text-center'>
                                                                <input type="checkbox" name="" id=""
                                                                    checked={isItemAdded(item.id, item)}
                                                                    disabled={(parseFloat(item?.requiredQty) || 0) - (parseFloat(item?.alreadyPoqty) || 0) === 0} />
                                                            </td>
                                                            <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                                {index + 1}
                                                            </td>
                                                           
                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.order?.docId}
                                                            </td>

                                                            <td className=" border border-gray-300 px-2 py-1 text-left text-xs">
                                                                {item?.allColors}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.Yarn?.name}
                                                            </td>
                                                            {poMaterial === "DyedYarn" && (

                                                                <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                    {item?.Color?.name}
                                                                </td>
                                                            )}
                                                            {poMaterial === "GreyYarn"  && item?.Yarn?.name &&  (

                                                                <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                    Grey
                                                                </td>
                                                            )}
                                                            <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.yarnCounts?.name}
                                                            </td>

                                                            <td className=" border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {item?.requiredQty?.toFixed(3)}
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px]  text-right py-1.5 px-2">
                                                                {item?.alreadyPoqty?.toFixed(3)}
                                                            </td>
                                                            <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">


                                                                {(parseFloat(item?.requiredQty || 0) - parseFloat(item?.alreadyPoqty || 0)) > 0
                                                                    ? Math.max(0, parseFloat(item?.requiredQty || 0) - parseFloat(item?.alreadyPoqty || 0)).toFixed(3)
                                                                    : ""
                                                                }
                                                            </td>

                                                        </tr>
                                                    ))
                                                )}
                                            </tbody> */}
                                            <tbody>
                                                {(!tempPoItems || tempPoItems.length === 0) ? (
                                                    <tr>
                                                        <td
                                                            colSpan={10}
                                                            className="px-4 py-4 text-center text-gray-500 border border-gray-200"
                                                        >
                                                            No data found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tempPoItems.map((item, index) => (
                                                        <tr
                                                            key={index}
                                                            className={`
                                                            odd:bg-white even:bg-gray-100 
                                                            hover:bg-gray-200 
                                                            transition-colors 
                                                            border-b border-gray-200 
                                                            text-[12px] py-1
                                                            `}
                                                            onClick={() => {
                                                                
                                                                if (item?.balanceQty !== 0 && item.yarnId) handleChange(item.id, item);
                                                            }}
                                                        >
                                                            {/* Checkbox */}
                                                            <td className="py-1 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isItemAdded(item.id, item)}
                                                                    disabled={
                                                                        (parseFloat(item?.requiredQty) || 0) -
                                                                        (parseFloat(item?.alreadyPoqty) || 0) ===
                                                                        0
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="w-5 border border-gray-300 px-2 py-1 text-center text-xs">
                                                                {index + 1}
                                                            </td>

                                                            <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.order?.docId}
                                                            </td>

                                                            <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                                                {item?.allColors}
                                                            </td>

                                                            {/* Yarn Name */}
                                                            <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.Yarn?.name}
                                                            </td>


                                                            <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.Color?.name}
                                                            </td>



                                                            {/* <td className="border border-gray-300 text-[11px] py-1.5 px-2">
                                                                {item?.yarnCounts?.name}
                                                            </td> */}

                                                            {/* Required Qty */}
                                                            <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {item?.requiredQty ? parseFloat(item?.requiredQty || 0).toFixed(3) : ""}
                                                            </td>

                                                            {/* Already PO Qty */}
                                                            {/* <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                { item?.alreadyPoqty ?   parseFloat(item?.alreadyPoqty || 0).toFixed(3) :  ""}
                                                            </td> */}

                                                            {/* Balance Qty */}
                                                            <td className="border border-gray-300 text-[11px] text-right py-1.5 px-2">
                                                                {item?.balanceQty
                                                                    ? parseFloat(item.balanceQty).toFixed(3)
                                                                    : ""}
                                                            </td>

                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>

                                        </table>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}















