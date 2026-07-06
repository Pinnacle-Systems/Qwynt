import React from 'react';
import { useGetStockByIdQuery } from '../../../redux/services/StockService';

const StockItem = ({ id, date, item, readOnly, productId, handleInputChange, index, setPoBillItems, poBillItems, uomId, salePrice }) => {
  const { data: singleProduct, isFetching: isSingleProductFetching, isLoading: isSingleProductLoading } = useGetStockByIdQuery({
    params: {
      uomId,
      createdAt: id ? date : undefined
    }
  }, { skip: !productId, uomId });


  const singleProductData = singleProduct?.data ? singleProduct.data : [];

  return (
    <div>
      {singleProductData.map((product, id) => (
        product.salePrice == poBillItems[index].salePrice && (
          <div key={poBillItems[index].salePrice}>
            {product.stockQty}
          </div>
        )
      ))}
    </div>
  );
}

export default StockItem;
