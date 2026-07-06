import React, { useEffect, useState } from 'react';
import { PLUS } from '../../../icons';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';
import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { useGetPurchaseBillByIdQuery } from '../../../redux/services/PurchaseBillService';
import StockItem from './StockItem';
import { toast } from 'react-toastify';
import { findFromList, substract } from '../../../Utils/helper';


const PoBillItems = ({ purchaseOrderDetails, purchaseOrderId, id, readOnly, setPoReturnItems, poReturnItems, date }) => {
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: productBrandList } =
        useGetProductBrandQuery({ params });

    const { data: supplierList } =
        useGetPartyQuery({ params });

    const { data: productCategoryList } =
        useGetProductCategoryQuery({ params });

    const { data: productList } = useGetProductQuery({ params });
    function getProductUomPriceDetails(productId) {
        const items = findFromList(productId, productList?.data ? productList?.data : [], "ProductUomPriceDetails")
        return items ? items : []
    }




    function handleInputChange(value, index, field, stockQty, salesQty) {
        const newBlend = structuredClone(poReturnItems);
        newBlend[index][field] = value;
        if (field === "qty") {
            let minValue = Math.min(stockQty, salesQty)
            if (parseFloat(minValue) < parseFloat(value)) {
                toast.info("Return Qty Can not be more than Stock Qty", { position: 'top-center' })
                return
            }
        }
        setPoReturnItems(newBlend);
    };






    if (!productBrandList || !productCategoryList || !productList) return <Loader />

    return (
        <>

            <div className={` relative w-full overflow-y-auto py-1`}>
                <table className=" border border-gray-500 text-xs table-auto  w-full">
                    <thead className='bg-emerald-800 text-white text-sm p-2 top-0 border-b border-gray-500'>
                        <tr className=''>
                            <th className="table-data  w-2 text-center p-2">S.no</th>
                            <th className="table-data p-2 ">Product Name</th>
                            <th className="table-data p-2 w-20">sales.Qty</th>

                            <th className="table-data p-2  w-20">Bal.Qty</th>

                            <th className="table-data p-2 w-16 ">Ret.Qty</th>


                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>


                        {(poReturnItems ? poReturnItems : []).map((item, index) =>

                            <tr key={index} className="w-full table-row">{console.log(poReturnItems, 'po retunitems')}
                                <td className="table-data w-2 text-left px-1 py-1">
                                    {index + 1}
                                </td>

                                 <td className='table-data'>
                                    {item.Product.name}
                                </td>
                                <td className='table-data text-right pr-1'>
                                    {item?.salesQty}

                                </td>

                                <td className='table-data text-right pr-1'>
                                    {parseInt(item?.salesQty) - (item?.alreadyReturnQty
                                    ) || item?.salesQty}
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-16 table-data-input"
                                        value={(!item.qty) ? 0 : item.qty}

                                        disabled={readOnly}
                                        onChange={(e) => {
                                            if ((substract(item?.salesQty, item?.alreadyReturnQty)) < parseInt(e.target.value)) {
                                                return toast.info("Cannot be more than Allowed Rtn Qty...!")
                                            }
                                            handleInputChange(e.target.value, index, "qty", item?.stockQty, item.poQty)
                                        }
                                        }
                                        onBlur={(e) => {

                                            handleInputChange(parseFloat(e.target.value).toFixed(2), index, "qty", item.stockQty, item.salesQty);

                                        }
                                        }
                                    />
                                </td>

                            </tr>
                        )}

                        {Array.from({ length: 10 - poReturnItems.length }).map(i =>
                            <tr className='w-full font-bold h-6 border-gray-400 border table-row'>
                                <td className='table-data'>
                                </td>


                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                            



                            </tr>)
                        }


                    </tbody>
                </table>
            </div>
        </>
    )
}

export default PoBillItems