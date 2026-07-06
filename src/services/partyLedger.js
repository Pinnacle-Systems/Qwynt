import { Prisma } from "../lib/prisma.js";
import { prisma } from "../lib/prisma.js";

import moment from "moment"

// export async function getPartyLedgerReport(partyId, startDate, endDate) {
//     console.log(partyId,"partyId")
//     const startDateFormatted = moment(startDate).format("YYYY-MM-DD");
//     const endDateFormatted = moment(endDate).format("YYYY-MM-DD");


//     const openingBalanceResults = await prisma.$queryRaw`
//     select coalesce(sum(amount),0) as openingBalance from (select 'Sales' as type, docId as transId, selectedDate as date, coalesce(netBillValue,0) as amount,'' as discount
// from salesbill
// where isOn = 1 and supplierId = ${partyId} and (DATE(selectedDate) < ${startDateFormatted})
// union
// select 'Payment' as type, docId as transId, cvv as date, 0 - coalesce(paidAmount,0)- discount,discount as discount
// from payment
// where  partyid = ${partyId} and paymentType = 'SALESBILL' and (DATE(cvv) < ${startDateFormatted})) a
//     `;




//     const closingBalanceResults = await prisma.$queryRaw`
//     select coalesce(sum(amount),0) as closingBalance from (select 'Sales' as type, docId as transId, selectedDate as date, netBillValue as amount,'' as discount
// from salesbill
// where isOn = 1 and supplierId = ${partyId} and (DATE(selectedDate) <= ${endDateFormatted})
// union
// select 'Payment' as type, docId as transId, cvv as date, 0 - paidAmount -discount, discount as discount
// from payment
// where  partyid = ${partyId} and paymentType = 'SALESBILL' and (DATE(cvv) <= ${endDateFormatted})) a
//     `;

//     const data = await prisma.$queryRaw`
//    select * from (select 'Sales' as type, docId as transId, selectedDate as date, netBillValue as amount, '' as paymentType ,'' as paymentRefNo,'' as discount
// from salesbill
// where isOn = 1 and supplierId = ${partyId} and (DATE(selectedDate) between ${startDateFormatted} and ${endDateFormatted})
// union
// select 'Payment' as type, docId as transId, cvv as date, paidAmount+ discount,paymentMode as paymentType, paymentRefNo,discount as discount
// from payment 
// where partyid = ${partyId} and paymentType = 'SALESBILL' and (DATE(cvv) between ${startDateFormatted} and ${endDateFormatted})) a
// order by date;
//     `;
//     const partyDetails = await prisma.party.findUnique({
//         where: {
//             id: parseInt(partyId)
//         },
//         select: {
//             name: true,
//             coa: true
//         }
//     })
//     console.log(typeof partyDetails.coa)
//     return {
//         openingBalance:parseFloat(openingBalanceResults[0]?.openingBalance)  + parseFloat(partyDetails.coa) ,
//         closingBalance:parseFloat( closingBalanceResults[0]?.closingBalance) + parseFloat(partyDetails.coa),
//         data,
//         partyDetails
//     }
// }
export async function getPartyLedgerReportCus(partyId, startDate, endDate) {
    console.log(partyId, "partyIdsss")
    const startDateFormatted = moment(startDate).format("YYYY-MM-DD");
    const endDateFormatted = moment(endDate).format("YYYY-MM-DD");
    const openingBalanceResults = await prisma.$queryRaw`
    select coalesce(sum("amount"),0) as "openingBalance" from (select 'Purchase' as "type", "docId" as "transId", "selectedDate" as "date", coalesce("ourPrice",0) as "amount",'' as "discount"
from "PurchaseBill"
where  "supplierId" = ${partyId} and (DATE("selectedDate") < ${startDateFormatted})
union
select 'Payment' as "type", "docId" as "transId", "cvv" as "date", 0 - coalesce("paidAmount",0), "discount" as "discount"
from "Payment"
where  "partyId" = ${partyId} and "paymentType" = 'PURCHASEBILL' and (DATE("cvv") < ${startDateFormatted})) a
    `;

    const closingBalanceResults = await prisma.$queryRaw`
    select coalesce(sum("amount"),0) as "closingBalance" from (select 'Purchase' as "type", "docId" as "transId", "selectedDate" as "date", "ourPrice" as "amount",'' as "discount"
from "PurchaseBill"
where "supplierId" = ${partyId} and (DATE("selectedDate") <= ${endDateFormatted})
union
select 'Payment' as "type", "docId" as "transId", "cvv" as "date", 0 - "paidAmount" - "discount", "discount" as "discount"
from "Payment"
where  "partyId" = ${partyId} and "paymentType" = 'PURCHASEBILL' and (DATE("cvv") <= ${endDateFormatted})) a
    `;

    const data = await prisma.$queryRaw`
   select * from (select 'Purchase' as "type", "docId" as "transId", "selectedDate" as "date", "ourPrice" as "amount", '' as "paymentType" ,'' as "paymentRefNo",'' as "discount"
from "PurchaseBill"
where "supplierId" = ${partyId} and (DATE("selectedDate") between ${startDateFormatted} and ${endDateFormatted})
union
select 'Payment' as "type", "docId" as "transId", "cvv" as "date", "paidAmount"+ "discount","paymentMode" as "paymentType", "paymentRefNo", "discount" as "discount"
from "Payment" 
where "partyId" = ${partyId} and "paymentType" = 'PURCHASEBILL' and (DATE("cvv") between ${startDateFormatted} and ${endDateFormatted})) a
order by "date";
    `;
    const partyDetails = await prisma.party.findUnique({
        where: {
            id: parseInt(partyId)
        },
        select: {
            name: true,
            soa: true
        }
    })
    console.log(typeof partyDetails.coa)
    return {
        openingBalance: parseFloat(openingBalanceResults[0]?.openingBalance) + parseFloat(partyDetails.soa),
        closingBalance: parseFloat(closingBalanceResults[0]?.closingBalance) + parseFloat(partyDetails.soa),
        data,
        partyDetails
    }
}


// export async function getPartyOverAllReport(searchPartyName) {
//     const sql = `SELECT 
//     id, 
//     name, 
//     FORMAT(SUM(saleAmount), 2) AS saleAmount, 
//     FORMAT(SUM(paymentAmount), 2) AS paymentAmount, 
//     FORMAT(SUM(saleAmount) - SUM(paymentAmount), 2) AS balance
// FROM (
//     SELECT 
//         party.id,
//         party.name, 
//         party.coa AS saleAmount, 
//         0 AS paymentAmount 
//     FROM 
//         party
//     where 
//         isCustomer = '1'    

//     UNION ALL

//     SELECT 
//         party.id, 
//         party.name, 
//         SUM(salesbill.netBillValue) AS saleAmount, 
//         0 AS paymentAmount
//     FROM 
//         salesbill 
//     JOIN 
//         party 
//     ON 
//         party.id = salesbill.supplierId
//     WHERE 
//         salesbill.isOn = 1 AND isCustomer = 1
//     GROUP BY 
//         salesbill.supplierId, 
//         party.name

//     UNION ALL

//     SELECT 
//         party.id, 
//         party.name, 
//         0 AS saleAmount, 
//         SUM(payment.paidAmount) AS paymentAmount
//     FROM 
//         payment 
//     JOIN 
//         party 
//     ON 
//         party.id = payment.partyId
//         where paymentType = 'SALESBILL'

//     GROUP BY 
//         payment.partyId, 
//         party.name
// ) a 
// where a.name like '%${searchPartyName}%'
// GROUP BY 
//     id, 
//     name
// HAVING 
//     SUM(saleAmount) > 0 OR SUM(paymentAmount) > 0 
// ORDER BY 
//     name
// `
//     return await prisma.$queryRawUnsafe(sql)
// }
export async function getPartyPurchaseOverAllReport(searchPartyName) {
    const searchPattern = `%${searchPartyName}%`;

    return await prisma.$queryRaw`
        SELECT 
            id, 
            name, 
            ROUND(SUM("purchaseAmount")::numeric, 2) AS "purchaseAmount", 
            ROUND(SUM("paymentAmount")::numeric, 2) AS "paymentAmount", 
            ROUND((SUM("purchaseAmount") - SUM("paymentAmount"))::numeric, 2) AS "balance"
        FROM (
            SELECT 
                party.id,
                party."name", 
                party."soa" AS "purchaseAmount", 
                0 AS "paymentAmount" 
            FROM "Party" party
            WHERE party."isSupplier" = true

            UNION ALL

            SELECT 
                party.id, 
                party."name", 
                SUM("purchaseBill"."netBillValue") AS "purchaseAmount", 
                0 AS "paymentAmount"
            FROM "PurchaseBill" "purchaseBill" 
            JOIN "Party" party 
                ON party.id = "purchaseBill"."supplierId"
            WHERE party."isSupplier" = true
            GROUP BY "purchaseBill"."supplierId", party."name", party.id

            UNION ALL

            SELECT 
                party.id, 
                party."name", 
                0 AS "purchaseAmount", 
                SUM(payment."paidAmount") AS "paymentAmount"
            FROM "Payment" payment 
            JOIN "Party" party 
                ON party.id = payment."partyId"
            WHERE payment."paymentType" = 'PURCHASEBILL'
              AND party."isSupplier" = true
            GROUP BY payment."partyId", party."name", party.id
        ) a 
        WHERE a."name" LIKE ${searchPattern}
        GROUP BY id, name
        HAVING SUM("purchaseAmount") > 0 OR SUM("paymentAmount") > 0 
        ORDER BY name
    `;
}

export async function getPartyLedgerReport(partyId, startDate, endDate) {
    console.log(partyId, "partyId")
    const startDateFormatted = moment(startDate).format("YYYY-MM-DD");
    const endDateFormatted = moment(endDate).format("YYYY-MM-DD");

    //   AND DATE(createdAt) BETWEEN '${startDateFormatted}' AND '${endDateFormatted}'
    // ${partyId} 


    //     const sql = `
    // WITH opening AS (



    //     SELECT
    //     p.id AS partyId,
    //     COALESCE(p.coa, 0)
    //     + COALESCE(ld.totalLedger, 0)
    //     - COALESCE(pmt.totalPaid, 0) AS openingBalance
    // FROM Party p
    // LEFT JOIN (
    //     SELECT partyId, SUM(amount) AS totalLedger
    //     FROM Ledger
    //     WHERE DATE(createdAt) < '${startDateFormatted}'
    //     GROUP BY partyId
    // ) ld ON ld.partyId = p.id
    // LEFT JOIN (
    //     SELECT partyId, SUM(totalAmount) AS totalPaid
    //     FROM Payment
    //     WHERE DATE(createdAt) < '${endDateFormatted}'
    //     GROUP BY partyId
    // ) pmt ON pmt.partyId = p.id
    // WHERE p.id = ${partyId} 
    // ),

    // txns AS (
    //     -- Ledger transactions (DEBIT)
    //     SELECT
    //         id AS transactionId,
    //         createdAt AS txnDate,
    //         'INVOICE' AS txnType,
    //         amount AS debit,
    //         0 AS credit,
    //         partyId
    //     FROM Ledger
    //     WHERE partyId = ${partyId} 
    //       AND DATE(createdAt) BETWEEN  '${startDateFormatted}' AND  '${endDateFormatted}'

    //     UNION ALL

    //     -- Payment transactions (CREDIT)
    //     SELECT
    //         docId AS transactionId,
    //         createdAt AS txnDate,
    //         'PAYMENT' AS txnType,
    //         0 AS debit,
    //         totalAmount AS credit,
    //         partyId
    //     FROM Payment
    //     WHERE partyId = ${partyId} 
    //       AND DATE(createdAt) BETWEEN  '${startDateFormatted}' AND  '${endDateFormatted}'
    // )

    // -- 🔹 Opening Balance row (ALWAYS DEBIT)
    // SELECT
    //     NULL AS transactionId,
    //     DATE_SUB('${startDateFormatted}', INTERVAL 1 DAY) AS txnDate,
    //     'OPENING BALANCE' AS txnType,
    //     ABS(openingBalance) AS debit,
    //     NULL AS credit,
    //     openingBalance AS runningBalance
    // FROM opening

    // UNION ALL

    // -- 🔹 Transaction rows with running balance
    // SELECT
    //     t.transactionId,
    //     t.txnDate,
    //     t.txnType,
    //     t.debit,
    //     t.credit,
    //     o.openingBalance
    //     + SUM(t.credit - t.debit)
    //         OVER (
    //             ORDER BY t.txnDate, t.transactionId
    //             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    //         ) AS runningBalance
    // FROM txns t
    // CROSS JOIN opening o

    // ORDER BY
    //     txnDate,
    //     transactionId;






    //     SELECT
    //     id AS transactionId,
    //     createdAt AS txnDate,
    //     'INVOICE' AS txnType,
    //     amount AS debit,
    //     0 AS credit
    // FROM Ledger
    // WHERE partyId = ${partyId} 
    //   AND createdAt >=  '${startDateFormatted}' 
    //   AND createdAt <  DATE_ADD('${endDateFormatted}', INTERVAL 1 DAY)
    //         `

    //     const sql = `
    // WITH opening AS (
    //     SELECT
    //         p.id AS partyId,
    //         COALESCE(p.coa, 0)
    //         + COALESCE(ld.totalLedger, 0)
    //         - COALESCE(pmt.totalPaid, 0) AS openingBalance
    //     FROM Party p
    //     LEFT JOIN (
    //         SELECT partyId, SUM(amount) AS totalLedger
    //         FROM Ledger
    //         WHERE createdAt <  '${startDateFormatted}' 
    //         GROUP BY partyId
    //     ) ld ON ld.partyId = p.id
    //     LEFT JOIN (
    //         SELECT partyId, SUM(totalAmount) AS totalPaid
    //         FROM Payment
    //         WHERE cvv <  '${startDateFormatted}' 
    //         GROUP BY partyId
    //     ) pmt ON pmt.partyId = p.id
    //     WHERE p.id = ${partyId} 
    // ),

    // txns AS (
    //     -- 🔹 INVOICE / LEDGER (DEBIT)



    //           SELECT
    //         I.docId AS transactionId,
    //         L.createdAt AS txnDate,
    //         'INVOICE' AS txnType,
    //         L.amount AS debit,
    //         0 AS credit
    //     FROM Ledger L
    //     LEFT JOIN deliveryinvoice I
    //            ON I.id = L.deliveryInvoiceId
    //     WHERE L.partyId =  ${partyId} 
    //       AND L.createdAt >='${startDateFormatted}' 
    //       AND L.createdAt < DATE_ADD('${endDateFormatted}', INTERVAL 1 DAY)

    //     UNION ALL

    //     -- 🔹 PAYMENT (CREDIT)
    //     SELECT
    //         docId AS transactionId,
    //         cvv AS txnDate,
    //         'PAYMENT' AS txnType,
    //         0 AS debit,
    //         totalAmount AS credit
    //     FROM Payment
    //     WHERE partyId = ${partyId} 
    //       AND cvv >=  '${startDateFormatted}' 
    //       AND cvv <  DATE_ADD('${endDateFormatted}', INTERVAL 1 DAY)
    // )

    // -- 🔹 OPENING BALANCE ROW
    // SELECT
    //     NULL AS transactionId,
    //     DATE_SUB('${startDateFormatted}', INTERVAL 1 DAY) AS txnDate,
    //     'OPENING BALANCE' AS txnType,
    //     CASE WHEN openingBalance > 0 THEN openingBalance ELSE 0 END AS debit,
    //     CASE WHEN openingBalance < 0 THEN ABS(openingBalance) ELSE 0 END AS credit,
    //     openingBalance AS runningBalance
    // FROM opening

    // UNION ALL

    // -- 🔹 TRANSACTIONS WITH RUNNING BALANCE
    // SELECT
    //     t.transactionId,
    //     t.txnDate,
    //     t.txnType,
    //     t.debit,
    //     t.credit,
    //     o.openingBalance
    //     + SUM(t.debit - t.credit)
    //         OVER (
    //             ORDER BY t.txnDate, t.transactionId
    //             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    //         ) AS runningBalance
    // FROM txns t
    // CROSS JOIN opening o

    // ORDER BY txnDate, transactionId

    // `
    const data = await prisma.$queryRaw`
        WITH opening AS (
            SELECT
                p.id AS "partyId",
                COALESCE(p."coa", 0) + COALESCE(opl."openingBalanceAmount", 0)
                + COALESCE(ld."totalLedger", 0)
                - COALESCE(pmt."totalPaid", 0) AS "openingBalance"
            FROM "Party" p
            LEFT JOIN (
                SELECT "partyId", SUM("amount") AS "openingBalanceAmount"
                FROM "OpeningBalance"
                WHERE "date" < ${startDateFormatted}
                GROUP BY "partyId"
            ) opl ON opl."partyId" = p.id
            LEFT JOIN (
                SELECT "partyId", SUM("amount") AS "totalLedger"
                FROM "Ledger"
                WHERE "createdAt" < ${startDateFormatted}
                GROUP BY "partyId"
            ) ld ON ld."partyId" = p.id
            LEFT JOIN (
                SELECT "partyId", SUM("totalAmount") AS "totalPaid"
                FROM "Payment"
                WHERE "cvv" < ${startDateFormatted}
                GROUP BY "partyId"
            ) pmt ON pmt."partyId" = p.id
            WHERE p.id = ${partyId}
        ),
        txns AS (
            SELECT
                I."docId" AS "transactionId",
                L."createdAt" AS "txnDate",
                'INVOICE' AS "txnType",
                L."amount" AS "debit",
                0 AS "credit"
            FROM "Ledger" L
            LEFT JOIN "DeliveryInvoice" I
                ON I.id = L."deliveryInvoiceId"
            WHERE L."partyId" = ${partyId}
              AND L."createdAt" >= ${startDateFormatted}
              AND L."createdAt" < (${endDateFormatted}::date + INTERVAL '1 day')

            UNION ALL

            SELECT
                "docId" AS "transactionId",
                "cvv" AS "txnDate",
                'PAYMENT' AS "txnType",
                0 AS "debit",
                "totalAmount" AS "credit"
            FROM "Payment"
            WHERE "partyId" = ${partyId}
              AND "cvv" >= ${startDateFormatted}
              AND "cvv" < (${endDateFormatted}::date + INTERVAL '1 day')
        )
        SELECT
            NULL AS "transactionId",
            (${startDateFormatted}::date - INTERVAL '1 day') AS "txnDate",
            'OPENING BALANCE' AS "txnType",
            CASE WHEN "openingBalance" > 0 THEN "openingBalance" ELSE 0 END AS "debit",
            CASE WHEN "openingBalance" < 0 THEN ABS("openingBalance") ELSE 0 END AS "credit",
            "openingBalance" AS "runningBalance"
        FROM opening

        UNION ALL

        SELECT
            t."transactionId",
            t."txnDate",
            t."txnType",
            t."debit",
            t."credit",
            o."openingBalance"
            + SUM(t."debit" - t."credit")
                OVER (
                    ORDER BY t."txnDate", t."transactionId"
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS "runningBalance"
        FROM txns t
        CROSS JOIN opening o

        ORDER BY "txnDate", "transactionId"
    `;



    return {

        data,
    }
}


export async function getPartyOverAllReport(searchPartyName, date) {

    const DateFormatted = moment(date).format("YYYY-MM-DD");
    const searchPattern = `%${searchPartyName}%`;


    //     const sql = `
    // SELECT
    //     p.id,
    //     p.name,

    //     -- Opening balance
    //     COALESCE(p.coa, 0) AS openingBalance,

    //     -- Ledger amount (all previous + selected date)
    //     COALESCE(l.ledgerAmount, 0) AS ledgerAmount,

    //     -- Paid amount (all previous + selected date)
    //     COALESCE(pay.paidAmount, 0) AS paidAmount,

    //     -- Outstanding = Opening + Ledger - Payment
    //     (
    //         COALESCE(p.coa, 0)
    //         + COALESCE(l.ledgerAmount, 0)
    //         - COALESCE(pay.paidAmount, 0)
    //     ) AS outstandingAmount

    // FROM party p

    // -- 🔹 Ledger (all invoices till selected date)
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(amount) AS ledgerAmount
    //     FROM Ledger
    //     WHERE creditOrDebit = 'Credit'
    //       AND createdAt < DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) l ON p.id = l.partyId

    // -- 🔹 Payment (all payments till selected date)
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(totalAmount) AS paidAmount
    //     FROM Payment
    //     WHERE cvv < DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) pay ON p.id = pay.partyId

    // WHERE p.name LIKE '%${searchPartyName}%'
    // ORDER BY p.name;

    // `

    //     const sql = `
    // SELECT
    //     p.id,

    //     TRIM(
    //         CONCAT(
    //             p.name,
    //             IF(bt.name IS NOT NULL, CONCAT(' / ', bt.name), ''),
    //             IF(c.name IS NOT NULL, CONCAT(' / ', c.name), '')
    //         )
    //     ) AS name,

    //     COALESCE(p.coa, 0) AS openingBalance,

    //     COALESCE(l.ledgerAmount, 0) AS ledgerAmount,

    //     COALESCE(pay.paidAmount, 0) AS paidAmount,

    //     (
    //         COALESCE(p.coa, 0)
    //         + COALESCE(l.ledgerAmount, 0)
    //         - COALESCE(pay.paidAmount, 0)
    //     ) AS outstandingAmount

    // FROM party p

    // -- 🔹 Branch Type
    // LEFT JOIN BranchType bt ON bt.id = p.branchTypeId

    // -- 🔹 City
    // LEFT JOIN City c ON c.id = p.cityId

    // -- 🔹 Ledger
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(amount) AS ledgerAmount
    //     FROM Ledger
    //     WHERE creditOrDebit = 'Credit'
    //       AND createdAt < DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) l ON p.id = l.partyId

    // -- 🔹 Payment
    // LEFT JOIN (
    //     SELECT
    //         partyId,
    //         SUM(totalAmount) AS paidAmount
    //     FROM Payment
    //     WHERE cvv <  DATE_ADD('${DateFormatted}', INTERVAL 1 DAY)
    //     GROUP BY partyId
    // ) pay ON p.id = pay.partyId

    // WHERE p.name LIKE '%${searchPartyName}%'
    // ORDER BY name;


    // `
    return await prisma.$queryRaw`
        SELECT
            p.id,
            TRIM(
                CONCAT(
                    p."name",
                    CASE WHEN bt."name" IS NOT NULL THEN CONCAT(' / ', bt."name") ELSE '' END,
                    CASE WHEN c."name" IS NOT NULL THEN CONCAT(' / ', c."name") ELSE '' END
                )
            ) AS name,
            COALESCE(p."coa", 0) AS "openingBalance",
            COALESCE(opl."openingBalanceAmount", 0) AS "openingBalanceAmount",
            COALESCE(l."ledgerAmount", 0) AS "ledgerAmount",
            COALESCE(pay."paidAmount", 0) AS "paidAmount",
            (
                COALESCE(p."coa", 0) + COALESCE(opl."openingBalanceAmount", 0)
                + COALESCE(l."ledgerAmount", 0)
                - COALESCE(pay."paidAmount", 0) 
            ) AS "outstandingAmount"
        FROM "Party" p
        LEFT JOIN "BranchType" bt ON bt.id = p."branchTypeId"
        LEFT JOIN "City" c ON c.id = p."cityId"
        LEFT JOIN (
            SELECT 
                "partyId",
                SUM("amount") AS "openingBalanceAmount"
            FROM "OpeningBalance"
            WHERE "date" < (${DateFormatted}::date + INTERVAL '1 day')
            GROUP BY "partyId"
        ) opl ON p.id = opl."partyId"
        LEFT JOIN (
            SELECT
                "partyId",
                SUM("amount") AS "ledgerAmount"
            FROM "Ledger"
            WHERE "creditOrDebit" = 'Credit'
              AND "createdAt" < (${DateFormatted}::date + INTERVAL '1 day')
            GROUP BY "partyId"
        ) l ON p.id = l."partyId"
        LEFT JOIN (
            SELECT
                "partyId",
                SUM("totalAmount") AS "paidAmount"
            FROM "Payment"
            WHERE "cvv" < (${DateFormatted}::date + INTERVAL '1 day')
            GROUP BY "partyId"
        ) pay ON p.id = pay."partyId"
        WHERE p."name" LIKE ${searchPattern}
        ORDER BY name;
    `
}
