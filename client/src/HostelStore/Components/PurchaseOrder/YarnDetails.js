import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage'
import { HiTrash } from 'react-icons/hi'


const YarnDetails = ({ indentItems, setOrderDetails, poItems, setPoItems, gridIndex }) => {






    console.log(poItems,"poItems")





  function deleteRow(gridIndex, index) {
    setOrderDetails(prev => prev.filter((_, i) => i !== index))
  }
  function deleteSubRow(gridIndex, index) {

    setOrderDetails(prev => {
      // const updated = [...prev];
      const updated = structuredClone(prev);
      // console.log(updated[gridIndex],"deletesuybro")
      updated[gridIndex].orderSizeDetails.splice(index, 1);


      if (updated[gridIndex].orderSizeDetails.length === 0) {
        updated.splice(gridIndex, 1);
      }

      return updated;
    });
  }

  const handleInputChange = (value, index, field) => {
    console.log(gridIndex,value,"index",index ,"newBlend");
    let RaiseIndenetYarnItems = "RaiseIndenetYarnItems"
    const newBlend = structuredClone(poItems);

    newBlend[gridIndex][RaiseIndenetYarnItems][index][field] = value;


    setPoItems(newBlend);
  };
  console.log(poItems, "PoItemns")

  
  return (
    <>




      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-gray-800">{indentItems?.OrderDetails?.style?.name}</h2>
      </div>
      <tr>
        <td className="p-0">
          <div className="justify-center w-full">
            <table className="w-auto border border-gray-300">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="w-8 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">S.No</th>
                  <th className="w-72 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Yarn</th>
                  <th className="w-48 px-4 py-1.5 border border-gray-300 text-center font-medium text-xs">Color</th>
                  <th className="w-32 px-4 py-1.5 border border-gray-300  font-medium text-xs">Required Qty (Kgs) </th>
                  <th className="w-32 px-4 py-1.5 border border-gray-300  font-medium text-xs">Purchase Qty (Kgs) </th>

                </tr>
              </thead>
              <tbody>
                {(indentItems?.RaiseIndenetYarnItems ||  [])?.map((yarn, index) => (
                  <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                    <td className="py-0.5 border border-gray-300 text-[11px] text-center">
                      {index + 1}
                    </td>
                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                      {yarn?.Yarn?.name}
                    </td>
                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                      {yarn?.Color?.name}
                    </td>
                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2">
                      {(yarn.qty.toFixed(3))}
                    </td>
                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2">
                      <input
                        min="0"
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={yarn?.purchaseQty ?? 0}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange(val === "" ? 0 : val, index, "purchaseQty");
                        }}
                        onBlur={(e) => {
                          const val = e.target.value;
                          handleInputChange(val === "" ? 0 : parseFloat(val).toFixed(2), index, "purchaseQty");
                        }}
                      />
                    </td>

                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center text-xs">Total Qty</td>
                  <td colSpan={1} className="border border-gray-300 px-2 py-1 text-right font-bold text-xs"> {
                    ((indentItems?.RaiseIndenetYarnItems ||  [])?.reduce((yarnSum, yarn) => yarnSum + yarn.qty, 0))?.toFixed(3)
                  }
                  </td>
                    <td className="border border-gray-300 text-right font-bold text-[11px] py-1.5 px-2">
                      {(
                        (indentItems?.RaiseIndenetYarnItems  ||  [] )?.reduce(
                          (yarnSum, yarn) => yarnSum + Number(yarn.purchaseQty || 0),
                          0
                        ) ?? 0
                      ).toFixed(3)}
                    </td>


                </tr>
              </tbody>
            </table>
          </div>
        </td>
      </tr>


    </>
  )
}

export default YarnDetails






