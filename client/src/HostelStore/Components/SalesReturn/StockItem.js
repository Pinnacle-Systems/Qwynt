import React, { useEffect } from 'react'
import { useGetStockByIdQuery } from '../../../redux/services/StockService';

const StockItem = ({ id, date, item, readOnly, productId, index, setPoReturnItems, poReturnItems, uomId, purchaseOrderDetails }) => {
  const salePrice = purchaseOrderDetails.data.SalesBillItems.map((item) => item.salePrice)



  const { data: singleProduct, isFetching: isSingleProductFetching, isLoading: isSingleProductLoading } = useGetStockByIdQuery({
    params: {
      productId: productId,
      uomId,
      createdAt: id ? date : undefined,
      salePrice
    }
  }, { skip: !productId });

  console.log(singleProduct, 'singleProduct');




  return (
    <div>
      {singleProduct?.data ? (
        singleProduct.data.map((item) => (
          <div key={item.productId}>
            {item.stockQty}
          </div>
        ))
      ) : null}

    </div>
  )
}

export default StockItem