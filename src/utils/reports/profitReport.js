// import prisma from "../../models/getPrisma";
import { prisma } from '../../lib/prisma.js'

export default async function profitReport(startDateStartTime, endDateEndTime) {
    return await prisma.$queryRaw`
   select "Product", "Qty", ROUND("purchaseAmount"::numeric, 2) as "Purchase Amount", ROUND("saleAmount"::numeric, 2) as "Sale Amount", ROUND(("saleAmount" - "purchaseAmount")::numeric, 2) as "Profit" from (SELECT 
    product."name" AS "Product",
    sum(salesbillitemsout."qty") as "Qty",
    sum(salesbillitemsout."price" * salesbillitemsout."qty") as "saleAmount",
    ROUND((SELECT 
                    SUM(e."purchaseAmount")
                FROM
                    (SELECT 
                        d."product",
                            d."purchaseRate",
                            d."qty",
                            d."purchaseRate" * d."qty" AS "purchaseAmount"
                    FROM
                        (SELECT 
                        product."name" AS "product",
                            salesbillitems."qty",
                            (SELECT 
                                    SUM(e."amount") / NULLIF(SUM(e."qty"), 0)
                                FROM
                                    (SELECT 
                                    pobillitems."price",
                                        pobillitems."qty",
                                        pobillitems."price" * pobillitems."qty" AS "amount" 
                                FROM
                                    "PoBillItems" pobillitems
                                JOIN "PurchaseBill" pb ON pb.id = pobillitems."purchaseBillId"
                                WHERE
                                    pb."createdAt" < sb."createdAt"
                                        AND pobillitems."productId" = salesbillitems."productId"
                                      ) e) AS purchaseRate
                            
                    FROM
                        "SalesBillItems" salesbillitems
                    JOIN "SalesBill" sb ON sb.id = salesbillitems."salesBillId"
                    LEFT JOIN "Product" product ON product.id = salesbillitems."productId"
                    WHERE
                        salesbillitems."productId" = salesbillitemsout."productId" AND sb."isOn" = true
                            AND
                sb."createdAt" BETWEEN ${startDateStartTime} AND ${endDateEndTime}
                            ) d) e),
            2) AS purchaseAmount
FROM
    "SalesBillItems" salesbillitemsout
        LEFT JOIN
    "Product" product ON product.id = salesbillitemsout."productId"
    LEFT JOIN
    "SalesBill" salebill ON salebill.id = salesbillitemsout."salesBillId"
    WHERE salebill."createdAt" BETWEEN ${startDateStartTime} AND ${endDateEndTime} AND salebill."isOn" = true
GROUP BY salesbillitemsout."productId" , product."name" )f
    ORDER BY "Product"
    `
}
