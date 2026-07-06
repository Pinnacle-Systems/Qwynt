import { Loader } from "../../../Basic/components"
import useTaxDetailsHook from "../../../CustomHooks/TaxHookDetails"
import { discountTypes } from "../../../Utils/DropdownData"
import numberToWords from "number-to-words";
import { numberToText } from "number-to-text";
import { amountInWords, formatAmountIN } from "../../../Utils/helper";

const PoSummary = ({ poItems, readOnly, taxTypeId, isSupplierOutside, discountType, setDiscountType, discountValue, setDiscountValue, remarks, setRemarks }) => {

    console.log(poItems, "poItems")



    const totalAmount = poItems?.reduce((sum, item) => {
        const qty = Number(item?.invoiceQty ?? 0);
        const price = Number(item?.price ?? 0);
        return sum + qty * price;
    }, 0);

    // 2️⃣ Discount Amount
    let discountAmount = 0;

    if (discountType == "Percentage") {
        discountAmount = (totalAmount * Number(discountValue || 0)) / 100;
    }
    else if (discountType == "Flat") {
        discountAmount = Number(discountValue || 0);
    }


    const gstSummary = {};

    poItems.forEach(item => {
        const amount = item.invoiceQty * item.price;
        const tax = item?.Hsn?.tax
        const halfGst = tax / 2;


        if (!gstSummary[tax]) {
            gstSummary[tax] = {
                cgstRate: halfGst,
                sgstRate: halfGst,
                cgstAmount: 0,
                sgstAmount: 0
            };
        }
        console.log({
            halfGst,
            amount
        },'halfGst')

        gstSummary[tax].cgstAmount += amount * (halfGst / 100);
        gstSummary[tax].sgstAmount += amount * (halfGst / 100);
    });

    const gstArray = Object.keys(gstSummary).map(tax => {
        return {
            taxRate: Number(tax),
            cgstRate: gstSummary[tax].cgstRate,
            sgstRate: gstSummary[tax].sgstRate,
            cgstAmount: gstSummary[tax].cgstAmount,
            sgstAmount: gstSummary[tax].sgstAmount,
            totalTax: gstSummary[tax].cgstAmount + gstSummary[tax].sgstAmount
        };
    });

    const result = poItems.reduce(
        (acc, item) => {
            const amount = item.invoiceQty * item.price;
            const tax = item?.Hsn?.tax
            const halfGst = tax / 2;

            const cgstAmount = amount * (halfGst / 100);
            const sgstAmount = amount * (halfGst / 100);
            const itemTax = cgstAmount + sgstAmount;



            // acc.items.push({
            //   ...item,
            //   amount,
            //   cgstRate: halfGst,
            //   sgstRate: halfGst,
            //   cgstAmount,
            //   sgstAmount,
            //   itemTax
            // });

            acc.totalCgst += cgstAmount;
            acc.totalSgst += sgstAmount;
            acc.overallTax += itemTax;
            acc.subTotal += amount;

            return acc;
        },
        {
            // items: [],
            totalCgst: 0,
            totalSgst: 0,
            overallTax: 0,
            subTotal: 0
        }
    );


  
    console.log(gstArray, "gstArray");
    console.log(result,'result')
    console.log(gstSummary, "gstSummary")
    const netAmount = Math.max(totalAmount - discountAmount, 0) + (parseFloat(result?.totalSgst) + parseFloat(result?.totalCgst))
    const roundedNetAmount = Math.round(netAmount);
    const roundOff = Number((roundedNetAmount - netAmount).toFixed(2));
    const overallAmount = parseFloat(parseFloat(netAmount) + parseFloat(roundOff)).toFixed(2)

 console.log({
            netAmount,
            totalAmount,
            
        },'netAmountnetAmount')




    console.log(roundedNetAmount, "roundedNetAmount", netAmount)
    console.log(discountType, "roundOff", roundOff, netAmount, roundOff)
    return (
        <div className={`bg-gray-200 rounded z-50 w-[700px] `}>
            <table className="border border-gray-500 w-full text-xs text-start">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="w-36 border border-gray-500">Tax Name</th>
                        <th className="w-28 border border-gray-500">Value</th>
                        <th className="w-28 border border-gray-500">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {/* <tr>
                        <td className="border border-gray-500">Remarks</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input type="text" name='value' disabled={readOnly} className='h-7 w-full' value={remarks}
                                onChange={(e) => { setRemarks(e.target.value) }}
                            />
                        </td>
                    </tr> */}
                    <tr>
                        <td className="border border-gray-500 py-1">Gross Amount</td>
                        <td className="border border-gray-500 text-right" colSpan={2}
                        >
                            {formatAmountIN(parseFloat(totalAmount).toFixed(2))}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-500">Discount Type</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <select autoFocus name='type' disabled={readOnly} className='text-left w-full rounded h-8'
                                value={discountType}
                                onChange={(e) => { setDiscountType(e.target.value); setDiscountValue(0) }}
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
                        <td className="border border-gray-500"
                        >
                            <input type="text" name='value' disabled={readOnly || !discountType} className='h-7 w-full' value={discountValue}
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { setDiscountValue(0) }
                                }}
                                min={"0"}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    if (discountType == "Percentage") {
                                        if (e.target.value > 100) {
                                            return
                                        } else {
                                            setDiscountValue(e.target.value)
                                        }
                                    } else {
                                        setDiscountValue(e.target.value)

                                    }

                                }}
                            />
                        </td>
                        <td className="border border-gray-500"
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={formatAmountIN(discountAmount)}
                            />
                        </td>
                    </tr>
                    {gstArray?.map(i => (
                        <>
                            <tr className='h-7'>
                                <td className="border border-gray-500">CGST @{i.cgstRate}%</td>
                                <td className="border border-gray-500" colSpan={2}
                                >
                                    <input disabled type="text" name='value' className='h-7 w-full text-right'
                                        value=
                                        {i.cgstAmount.toFixed(2)}

                                    />
                                </td>
                            </tr>
                            <tr className='h-7'>
                                <td className="border border-gray-500">SGST @{i.sgstRate}%</td>
                                <td className="border border-gray-500" colSpan={2}
                                >
                                    <input disabled type="text" name='value' className='h-7 w-full text-right'
                                        value={formatAmountIN(i.sgstAmount.toFixed(2))}

                                    />
                                </td>
                            </tr>
                        </>

                    ))}

                    <tr className='h-7'>
                        <td className="border border-gray-500">IGST Amount</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                            // value={
                            //     parseFloat(taxDetails?.igstAmount) 
                            // }
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Round Off</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    parseFloat(roundOff).toFixed(2)
                                }
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Net Amount</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    formatAmountIN(parseFloat(overallAmount).toFixed(2))
                                }
                            />
                        </td>
                    </tr>

                    <tr className='h-7'>
                        <td className="border border-gray-500">Amount in Words</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                          
                            {/* {numberToWords.toWords(roundedNetAmount)} only */}
                            {amountInWords(roundedNetAmount)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default PoSummary;
