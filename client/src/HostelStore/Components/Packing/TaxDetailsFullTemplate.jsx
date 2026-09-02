import { discountTypes } from '../../../Utils/DropdownData';


const TaxDetailsFullTemplate = ({ inwardItems, currentIndex: index, setCurrentSelectedIndex, readOnly, handleInputChange, id,
    onCloseFocus,
    isSupplierOutside,

}) => {

    const row = inwardItems[index];

    if (!row) return null


    let discountType = row["discountType"];
    let discountValue = isNaN(parseFloat(row["discountValue"])) ? 0 : parseFloat(row["discountValue"]);
    let taxPercent = isNaN(parseFloat(row["taxPercent"])) ? 0 : parseFloat(row["taxPercent"])












    return (
        <div className={`${(Number.isInteger(index)) ? "block" : "hidden"} bg-gray-200 z-50 overflow-auto `}>
            <div className=" flex text-sm justify-around text-center border-t border-r border-l border-gray-500 bo font-bold p-1">
                <span>
                    Tax Details
                </span>
            </div>
            <table className="border border-gray-500 w-full text-xs text-start">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="w-52 border border-gray-500">Tax Name</th>
                        <th className="w-28 border border-gray-500">Value</th>
                        <th className="w-28 border border-gray-500">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Gross Amount</td>
                        <td className="border border-gray-500  text-right" colSpan={2}
                        >
                            {parseFloat(row?.totals?.gross)?.toFixed(2)}

                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-500">Discount Type</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <select autoFocus disabled={readOnly} className='text-left w-full rounded h-8'
                                value={discountType}
                                onChange={(e) => handleInputChange(e.target.value, index, "discountType")}
                            >
                                <option value={""}>
                                    Select
                                </option>
                                {discountTypes.map((option, index) => <option key={index} value={option.value} >
                                    {option.show}
                                </option>)}
                            </select>
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Discount</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input type="text" disabled={readOnly || !discountType} className='h-7 w-full text-right' value={discountValue}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleInputChange(e.target.value, index, "discountValue")} />
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-500 py-1.5">Taxable Amount</td>
                        <td className="border border-gray-500 text-right" colSpan={2}
                        >
                            {parseFloat(row?.totals?.taxable)?.toFixed(2)}
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Tax</td>
                        <td className="border border-gray-500" colSpan={2}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setCurrentSelectedIndex("");
                                    onCloseFocus(index); // 🔥 focus back
                                }
                            }}
                        >
                            <input type="text" disabled={readOnly} className='h-7 w-full text-right'
                                value={taxPercent} onChange={(e) => { handleInputChange(e.target.value, index, "taxPercent") }}
                                onFocus={(e) => e.target.select()}
                            />
                        </td>
                    </tr>

                    {isSupplierOutside ? (
                        <tr className="h-7">
                            <td className="border border-gray-500">IGST</td>
                            <td className="border border-gray-500 text-right" colSpan={2}>
                                {row?.totals?.igst?.toFixed(2)}
                            </td>
                        </tr>
                    ) : (
                        <>
                            <tr className="h-7">
                                <td className="border border-gray-500">CGST</td>
                                <td className="border border-gray-500 text-right" colSpan={2}>
                                    {row?.totals?.cgst?.toFixed(2)}
                                </td>
                            </tr>

                            <tr className="h-7">
                                <td className="border border-gray-500">SGST</td>
                                <td className="border border-gray-500 text-right" colSpan={2}>
                                    {row?.totals?.sgst?.toFixed(2)}
                                </td>
                            </tr>
                        </>
                    )}

                    <tr className='h-7'>
                        <td className="border border-gray-500">Net Amount</td>
                        <td className="border border-gray-500  text-right" colSpan={2}
                        >
                            {(row?.totals?.net)?.toFixed(2)}

                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default TaxDetailsFullTemplate;