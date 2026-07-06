import React from 'react'
import { DELETE, PLUS } from '../../../icons'
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { getCommonParams } from '../../../Utils/helper';

const Portion = ({ ProductUomPriceDetails, setProductUomPriceDetails, readonly }) => {
    const params = getCommonParams()
    const { data: uomData } = useGetUomQuery({ params });

    function addRow() {
        setProductUomPriceDetails(prev => [...prev, { uomId: "" }])
    }
    function deleteRow(index) {
        setProductUomPriceDetails(prev => prev.filter((_, i) => i !== index))
    }
    function handleOnChange(index, field, value) {
        setProductUomPriceDetails(prev => {
            let newDetails = structuredClone(prev);
            newDetails[index][field] = value;
            return newDetails
        })
    }
    return (
        <div  >
            <table className="border border-gray-500 w-[20rem]">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="border border-gray-500 w-24 text-xs p-0.5">UOM type </th>
                        <th className="border border-gray-500 w-24 text-xs p-0.5">Price</th>
                        {!readonly &&
                            <th className="border border-gray-500 w-16 text-xs p-0.5">
                                <button type='button' className="text-green-700 text-xs " onClick={addRow} >
                                    {PLUS}
                                </button>
                            </th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {ProductUomPriceDetails.map((value, valueIndex) =>
                        <tr key={valueIndex}>
                            {console.log(ProductUomPriceDetails, 'uom d')}
                            <td className="border border-gray-500 text-xs ">
                                <select
                                    disabled={readonly}
                                    id='dd'
                                    name="name" className='input-field border border-gray-500 md:col-span-2 col-span-1 rounded'
                                    value={value.uomId} onChange={(e) => { handleOnChange(valueIndex, "uomId", e.target.value); }} >
                                    <option value=""></option>
                                    {(uomData?.data ? uomData?.data : []).map((option, index) => <option key={index} value={option.id} >
                                        {option.name}
                                    </option>)}
                                </select>
                            </td>
                            <td className="border border-gray-500 text-xs text-center ">
                                <input className='w-24 p-1' type="number" value={value.price} onChange={(e) => { handleOnChange(valueIndex, "price", e.target.value); }} />
                            </td>
                            {!readonly &&
                                <td className="border border-gray-500 text-xs text-center">
                                    <button
                                        type='button'
                                        onClick={() => {
                                            deleteRow(valueIndex)
                                        }}
                                        className='text-xs text-red-600 '>{DELETE}
                                    </button>
                                </td>
                            }
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Portion
