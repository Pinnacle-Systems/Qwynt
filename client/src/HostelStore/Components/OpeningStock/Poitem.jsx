import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices';
import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService';
import {useGetProductQuery} from "../../../redux/services/ProductMasterService"
import secureLocalStorage from 'react-secure-storage';
import { useGetProductByIdQuery } from '../../../redux/services/ProductMasterService';
import { useMemo } from 'react';
import { findFromList } from '../../../Utils/helper';


const PoItem = ({ item, index, handleInputChange, id, readOnly }) => {
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: productBrandList } =
        useGetProductBrandQuery({ params});
    const { data: productList } =
    useGetProductQuery({ params :{...params, productBrandId: item.productBrandId, 
        productCategoryId: item.productCategoryId}  });
    const { data: productCategoryList } =
    useGetProductCategoryQuery({ params });
    const {data:singleProduct} = useGetProductByIdQuery(item.productId, {skip:!item?.productId})
    function setPrice(){
        console.log("price")
        const uomOptions = singleProduct?.data?.ProductUomPriceDetails ? singleProduct?.data?.ProductUomPriceDetails : [];
        const price = findFromList(item.uomId,uomOptions, "price")
    }
    
    return (
        <tr key={index} className="w-full table-row">
        <td className="table-data w-2 text-left px-1 py-1">
            {index + 1}
        </td>
    
            <td className='table-data'>
                <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "productBrandId") } }}
                    className='text-left w-full rounded py-1 table-data-input'
                    value={item.productBrandId}
                    onChange={(e) => handleInputChange(e.target.value, index, "productBrandId")}
                    onBlur={(e) => {
                        handleInputChange((e.target.value), index, "productBrandId")
                    }
                    }
                >
                    <option hidden>
                    </option>
                    {(id ? (productBrandList?.data ? productBrandList?.data : []) : (productBrandList?.data ? productBrandList?.data : []).filter(item => item.active)).map((brand) =>
                        <option value={brand.id} key={brand.id}>
                            {brand.name}
                        </option>)}
                </select>
            </td>
            <td className='table-data'>
                <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "productCategoryId") } }}
                    className='text-left w-full rounded py-1 table-data-input'
                    value={item.productCategoryId}
                    onChange={(e) => handleInputChange(e.target.value, index, "productCategoryId")}
                    onBlur={(e) => {
                        handleInputChange((e.target.value), index, "productCategoryId")
                    }
                    }
                >
                    <option hidden>
                    </option>
                    {(id ? productCategoryList.data : productCategoryList.data.filter(item => item.active)).map((brand) =>
                        <option value={brand.id} key={brand.id}>
                            {brand.name}
                        </option>)}
                </select>
            </td>
            { productList? (
    <td className='table-data'>

        <select
            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "productId") } }}
            className='text-left w-full rounded py-1 table-data-input'
            value={item.productId}
            onChange={(e) => handleInputChange(e.target.value, index, "productId")}
            onBlur={(e) => {
                handleInputChange((e.target.value), index, "productId")
            }}
        >
            <option hidden>
            </option>
            {(id ? productList?.data : productList?.data.filter(item => item.active)).map((prod) =>
                <option value={prod.id} key={prod.id}>
                    {prod.name}
                </option>)}
        </select>
    </td>
):''}
            <td className='table-data'>
                <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId"); setPrice() } }}
                    className='text-left w-full rounded py-1 table-data-input'
                    value={item.uomId}
                    onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                    onBlur={(e) => {
                        handleInputChange((e.target.value), index, "uomId")
                    }
                    }
                >
                    <option hidden>
                    </option>
                         {(singleProduct?.data?.ProductUomPriceDetails ? singleProduct?.data?.ProductUomPriceDetails : []).map(uom => 
                        <option value={uom.uomId} key={uom.uomId} > 
                        {uom?.Uom?.name}  
                        </option>
                            )}
                </select>
            </td> 
            <td className='table-data'>
                <input
                    type="number"
                    className="text-right rounded py-1 px-1 w-16 table-data-input"

                    value={(!item.qty) ? 0 : item.qty}
                    disabled={readOnly}
                    onChange={(e) =>
                        handleInputChange(e.target.value, index, "qty")
                    }
                    onBlur={(e) => {
                        handleInputChange(parseFloat(e.target.value).toFixed(2), index, "qty");
                    }
                    }
                />
            </td>
            <td className='table-data'>
                <input
                    type="number"
                    className="text-right rounded py-1 px-1 w-16 table-data-input"
                    value={item.price}
                    disabled={readOnly}
                    onChange={(e) =>
                        handleInputChange(e.target.value, index, "price")
                    }
                />
            </td>
            <td className='table-data'>
                <input
                    type="number"
                    className="text-right rounded py-1 px-1 w-16 table-data-input"

                    value={(!item.qty || !item.price) ? 0 : (parseFloat(item.qty) * parseFloat(item.price)).toFixed(2)}
                    disabled={readOnly}
                />
            </td>

        </tr>
    );
}
export default PoItem






// import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices';
// import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
// import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService';
// import secureLocalStorage from 'react-secure-storage';

// const PoItem = ({ item, index, handleInputChange, productList, uomList, id, readOnly }) => {
//     const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") };

//     console.log(productList, 'list');

//     const { data: productBrandList } = useGetProductBrandQuery({ params });
//     const { data: supplierList } = useGetPartyQuery({ params });
//     const { data: productList } = useGetProductCategoryQuery({ params });

//     return (
//         <tr key={index} className="w-full table-row">
//             <td className="table-data w-2 text-left px-1 py-1">
//                 {index + 1}
//             </td>
         
//             {/* Add the rest of your JSX elements here */}
//             {/* For example, uncomment and modify the following lines as needed */}
//             {/* <td className='table-data'>
//                 <select
//                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "productBrandId") } }}
//                     className='text-left w-full rounded py-1 table-data-input'
//                     value={item.productBrandId}
//                     onChange={(e) => handleInputChange(e.target.value, index, "productBrandId")}
//                     onBlur={(e) => {
//                         handleInputChange((e.target.value), index, "productBrandId")
//                     }
//                     }
//                 >
//                     <option hidden></option>
//                     {(id ? productBrandList.data : productBrandList.data.filter(item => item.active)).map((brand) =>
//                         <option value={brand.id} key={brand.id}>
//                             {brand.name}
//                         </option>)}
//                 </select>
//             </td> */}
//             {/* Continue with other JSX elements */}
//         </tr>
//     );
// }

// export default PoItem;
