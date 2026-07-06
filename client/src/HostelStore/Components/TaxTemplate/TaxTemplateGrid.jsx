import React, { useEffect } from 'react';
import { useGetTaxTermMasterQuery } from '../../../redux/services/TaxTermMasterServices';
import { toast } from 'react-toastify';
import { Loader } from '../../../Basic/components';
import { DELETE, PLUS } from '../../../icons';

const TaxTemplateGrid = ({ taxTemplateItems, setTaxTemplateItems, readOnly, params }) => {
    function handleOnClick(index, value) {
        console.log(taxTemplateItems, "taxTemplat")
        if (readOnly) return
        let newList = structuredClone(taxTemplateItems);
        newList[index]["additionalTax"] = value
        setTaxTemplateItems(newList);
    }

    const handleInputChange = (event, index, field) => {
        const value = event.target.value;
        const newBlend = structuredClone(taxTemplateItems);
        newBlend[index][field] = value;
        setTaxTemplateItems(newBlend);
    };

    const addRow = () => {
        if (taxTemplateItems.length >= TaxTermList.data.length) {
            toast.info("No More Tax Values", { position: 'top-center' })
            return
        }
        const newRow = { taxTermId: "", displayName: "", value: "", amount: "" };
        setTaxTemplateItems([...taxTemplateItems, newRow]);
    };
    const handleDeleteRow = id => {
        setTaxTemplateItems(tax => tax.filter((row, index) => index !== parseInt(id)));
    };

    const { data: TaxTermList, isLoading, isFetching } =
        useGetTaxTermMasterQuery({ params: { ...params, active: true } });

    function findIdInTaxTerms(id) {
        return taxTemplateItems ? taxTemplateItems.find(taxItems => parseInt(taxItems.taxTermId) === parseInt(id)) : false
    }

    useEffect(() => {
        if (readOnly) return
        else {
            if (taxTemplateItems.length === 0) {
                setTaxTemplateItems([
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                ]);
            }
        }
    }, [taxTemplateItems])
    if (!TaxTermList || isLoading || isFetching) return <Loader />

    return (
        <>
            {
                taxTemplateItems.length !== 0 ?
                    <>
                        <div className={`w-full overflow-y-auto p-3 `}>
                            <table className="border-collapse border border-slate-300 text-xs table-auto w-full rounded-sm shadow-sm bg-white">
                                <thead className='bg-slate-100 text-slate-700 top-0'>
                                    <tr>
                                        <th className="table-data border border-slate-300 w-28 py-1.5 font-semibold">Tax Name</th>
                                        <th className="table-data border border-slate-300 w-32 py-1.5 font-semibold">Display Name</th>
                                        <th className="table-data border border-slate-300 py-1.5 font-semibold">Value</th>
                                        <th className="table-data border border-slate-300 py-1.5 font-semibold">Amount</th>
                                        <th className={`border border-slate-300 ${readOnly ? "hidden" : "w-10"}`}>
                                            {!readOnly && (
                                                <div onClick={addRow}
                                                    className='hover:cursor-pointer mx-auto w-6 h-6 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm shadow-sm transition-colors' title="Add Row">
                                                    {PLUS}
                                                </div>
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxTemplateItems.map((row, index) => (
                                        <tr key={index} className="w-full hover:bg-slate-50 transition-colors">
                                            <td className='border border-slate-300 '>
                                                <select
                                                    disabled={readOnly}
                                                    className='text-left w-auto rounded-sm border border-slate-300 h-8 px-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 transition-all bg-white'
                                                    value={row.taxTermId}
                                                    onChange={(e) => handleInputChange(e, index, "taxTermId")}
                                                >
                                                    <option hidden value="">Select</option>
                                                    {TaxTermList.data.map((taxItems) =>
                                                        <option value={taxItems.id} key={taxItems.id} hidden={findIdInTaxTerms(taxItems.id)}>
                                                            {taxItems.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='border border-slate-300'>
                                                <input
                                                    type="text"
                                                    className="border border-slate-300 text-center rounded-sm h-8 w-full px-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 transition-all font-medium text-slate-700 bg-white"
                                                    value={row.displayName}
                                                    disabled={readOnly}
                                                    onChange={(event) => handleInputChange(event, index, "displayName")}
                                                />
                                            </td>
                                            <td className='border border-slate-300'>
                                                <input
                                                    type="text"
                                                    className="border border-slate-300 text-center rounded-sm h-8 w-full px-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 transition-all font-medium text-slate-700 bg-white"
                                                    value={row.value}
                                                    disabled={readOnly}
                                                    onChange={(event) => handleInputChange(event, index, "value")}
                                                />
                                            </td>
                                            <td className='border border-slate-300 '>
                                                <input
                                                    type="text"
                                                    className="border border-slate-300 text-center rounded-sm h-8 w-full px-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 transition-all font-medium text-slate-700 bg-white"
                                                    value={row.amount}
                                                    disabled={readOnly}
                                                    onChange={(event) => handleInputChange(event, index, "amount")}
                                                />
                                            </td>
                                            <td className={`border border-slate-300  align-middle ${readOnly ? "hidden" : ""} `}>
                                                {!readOnly && (
                                                    <div tabIndex={-1} onClick={() => handleDeleteRow(index)} className='hover:cursor-pointer mx-auto flex justify-center h-7 w-7 items-center rounded-sm bg-rose-100 text-rose-600 hover:bg-rose-200 hover:text-white transition-colors'>
                                                        {DELETE}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                    :
                    <div></div>
            }
        </>
    )
}

export default TaxTemplateGrid