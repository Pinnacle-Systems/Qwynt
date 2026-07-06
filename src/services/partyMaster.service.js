import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";
import {
  getPartyOverAllReport,
  getPartyLedgerReport,
  getPartyLedgerReportCus,
  getPartyPurchaseOverAllReport,
} from "./partyLedger.js";

async function get(req) {
  const {
    companyId,
    active,
    isPartyOverAllReport,
    searchValue,
    partyId,
    startDate,
    endDate,
    isPartyLedgerReport,
    isPartyLedgerReportCus,
    isPartyPurchaseOverAllReport,
    isParent,
    isAddessCombined,
  } = req.query;

  let data;
  if (isPartyLedgerReport) {
    const data = await getPartyLedgerReport(partyId, startDate, endDate);
    return { statusCode: 0, data };
  }
  if (isPartyLedgerReportCus) {
    const data = await getPartyLedgerReportCus(partyId, startDate, endDate);
    return { statusCode: 0, data };
  }
  if (isPartyOverAllReport) {
    const data = await getPartyOverAllReport(searchValue, startDate);
    return { statusCode: 0, data };
  }
  if (isPartyPurchaseOverAllReport) {
    const data = await getPartyPurchaseOverAllReport(searchValue);
    return { statusCode: 0, data };
  }
  data = await prisma.party.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      PurchaseBillSupplier: {
        select: {
          netBillValue: true,
          supplierId: true,
        },
      },
      SalesBillSupplier: {
        select: {
          netBillValue: true,
          supplierId: true,
          isOn: true,
        },
      },
      Payment: {
        select: {
          paidAmount: true,
          partyId: true,
          paymentType: true,
          discount: true,
        },
      },
      ledgers: true,
      PartyBranch: {
        select: {
          id: true,
          partyId: true,
          name: true,
          City: {
            select: {
              name: true,
            },
          },
        },
      },
      City: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          PoSupplier: true,
          purchaseInwards: true,
          proformaInvoices: true,
        },
      },
      BranchType: true,
    },
  });

  if (isParent) {
    data = data?.filter((i) => !i.parentId || !i.branchTypeId);
  }
  if (isAddessCombined) {
    data = data
      ?.filter((i) => i.isCustomer)
      .map((i) => ({
        ...i,
        name: `${i.name}${
          i?.BranchType?.name ? ` / ${i.BranchType.name}` : ""
        }${i?.City?.name ? ` / ${i.City.name}` : ""}`,
      }));
  }
  return {
    statusCode: 0,
    data: (data = data?.map((party) => ({
      ...party,
      childRecord:
        party?._count.PoSupplier +
        party?._count.purchaseInwards +
        party?._count.proformaInvoices,
    }))),
  };
}

export async function getNew(req) {
  const {
    companyId,
    active,
    isPartyOverAllReport,
    searchValue,
    partyId,
    startDate,
    endDate,
    isPartyLedgerReport,
    isPartyLedgerReportCus,
    isPartyPurchaseOverAllReport,
    isParent,
    isAddessCombined,
    id,
    supplierId,
  } = req.query;
  let data;
  data = await prisma.party.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      Supplier: {
        select: {
          id: true,
          DeliveryChallanItems: true,
        },
      },
      BranchType: {
        select: {
          name: true,
        },
      },
      City: {
        select: {
          name: true,
        },
      },
      DeliveryInvoice: {
        select: {
          DeliveryInvoiceItems: true,
        },
      },
    },
  });

  let filteredParties;
  if (supplierId && id) {
    filteredParties = data.filter((party) => party.id == supplierId);
  } else {
    filteredParties = data.filter((party) => {
      const deliveryQty = party.Supplier.reduce((partySum, supplier) => {
        const supplierQty = supplier.DeliveryChallanItems.reduce(
          (sum, item) => sum + (item.qty || 0),
          0,
        );
        return partySum + supplierQty;
      }, 0);

      const invoiceQty = party.DeliveryInvoice.reduce((partySum, invoice) => {
        const invoiceItemQty = invoice.DeliveryInvoiceItems.reduce(
          (sum, item) => sum + (item.invoiceQty || 0),
          0,
        );
        return partySum + invoiceItemQty;
      }, 0);

      console.log(
        {
          deliveryQty,
          invoiceQty,
        },
        "invoiceQty",
      );

      return deliveryQty > invoiceQty;
    });
  }

  if (isAddessCombined) {
    filteredParties = filteredParties
      ?.filter((i) => i.isCustomer)
      .map((i) => ({
        ...i,
        name: `${i.name} ${" "}  ${i?.BranchType?.name ? "/" + i?.BranchType?.name : ""} / ${" "} ${i.City?.name ?? ""}`,
      }));
  }
  return { statusCode: 0, data: filteredParties };
}

async function getOne(id) {
  const childRecordPo = await prisma.po.count({
    where: { supplierId: parseInt(id) },
  });
  const childRecordInward = await prisma.purchaseInward.count({
    where: { supplierId: parseInt(id) },
  });
  const childRecordPI = await prisma.proformaInvoice.count({
    where: { customerId: parseInt(id) },
  });

  const data = await prisma.party.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      attachments: true,
      City: {
        select: {
          name: true,
          state: {
            select: {
              name: true,
              country: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
      PurchaseBillSupplier: {
        select: {
          ourPrice: true,
          supplierId: true,
        },
      },
      SalesBillSupplier: {
        select: {
          netBillValue: true,
          supplierId: true,
          isOn: true,
        },
      },
      Payment: {
        select: {
          paidAmount: true,
          partyId: true,
          paymentType: true,
          discount: true,
        },
      },
      ledgers: true,
      openingBalances: true,
    },
  });
  const isCustomerExport =
    data?.City?.state?.country?.name?.toUpperCase() !== "INDIA";
  if (!data) return NoRecordFound("party");

  const totalOpeningBalance = data?.openingBalances?.reduce(
    (sum, val) => sum + (val?.amount ?? 0),
    0,
  );
  console.log(totalOpeningBalance, "openingBalancessssdddd");

  const totalPurchaseNetBillValue = data.PurchaseBillSupplier.reduce(
    (acc, bill) => acc + (bill.ourPrice || 0),
    0,
  );
  const totalSalesNetBillValue = data.SalesBillSupplier.reduce(
    (acc, bill) => (bill.isOn === true ? acc + (bill.netBillValue || 0) : acc),
    0,
  );

  const totalPaymentSalesBill = data.Payment.reduce(
    (acc, payment) =>
      payment.paymentType === "SALESBILL"
        ? acc + (payment.paidAmount || 0)
        : acc,
    0,
  );
  const totalDiscount = data.Payment.reduce(
    (acc, payment) => acc + (payment.discount || 0),
    0,
  );

  const totalPaymentPurchaseBill = data.Payment.reduce(
    (acc, payment) =>
      payment.paymentType === "PURCHASEBILL"
        ? acc + (payment.paidAmount || 0)
        : acc,
    0,
  );

  const outstanding = data?.ledgers?.reduce(
    (acc, next) =>
      next?.creditOrDebit === "Credit" ? acc + (next.amount || 0) : acc,
    0,
  );

  const totaloutstanding = outstanding + totalOpeningBalance;

  const totalPaymentAgainstInvoice = data?.Payment?.reduce(
    (acc, next) => acc + (next.paidAmount || 0),
    0,
  );

  // const childRecord = data.PurchaseBillSupplier.length + data.SalesBillSupplier.length;

  return {
    statusCode: 0,
    data: {
      ...data,
      totalPurchaseNetBillValue,
      totalSalesNetBillValue,
      totalPaymentSalesBill,
      totalPaymentPurchaseBill,
      totalDiscount,
      isCustomerExport,
      childRecord: childRecordPo + childRecordInward + childRecordPI,
      totaloutstanding,
      totalPaymentAgainstInvoice,
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.party.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
        {
          code: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const {
    name,
    code,
    aliasName,
    displayName,
    address,
    isSupplier,
    isCustomer,
    cityId,
    pincode,
    panNo,
    tinNo,
    cstNo,
    cstDate,
    cinNo,
    faxNo,
    email,
    website,
    contactPersonName,
    contactMobile,
    gstNo,
    currencyId,
    costCode,
    soa,
    coa,
    companyId,
    active,
    userId,
    landMark,
    contact,
    designation,
    department,
    contactPersonEmail,
    contactNumber,
    alterContactNumber,
    bankname,
    bankBranchName,
    accountNumber,
    ifscCode,
    attachments,
    msmeNo,
    companyAlterNumber,
    partyCode,
    parentId,
    branchTypeId,
    isBranch,
    aadharNo,
  } = await body;

  const data = await prisma.party.create({
    data: {
      name,
      code,
      aliasName,
      displayName,
      address,
      isSupplier: isSupplier ? JSON.parse(isSupplier) : false,
      isCustomer: isCustomer ? JSON.parse(isCustomer) : false,
      isBranch: isBranch ? JSON.parse(isBranch) : false,

      cityId: cityId ? parseInt(cityId) : undefined,
      pincode: pincode ? parseInt(pincode) : undefined,
      panNo,
      tinNo,
      cstNo,
      cstDate: cstDate ? new Date(cstDate) : undefined,
      cinNo,
      faxNo,
      email,
      website,
      contactPersonName,
      gstNo,
      currencyId: currencyId ? parseInt(currencyId) : undefined,
      costCode,
      createdById: userId ? parseInt(userId) : undefined,
      companyId: parseInt(companyId),
      active: active ? JSON.parse(active) : false,
      coa: coa ? parseInt(coa) : parseInt(0),
      soa: soa ? parseInt(soa) : parseInt(0),
      contactMobile: contactMobile ? parseInt(contactMobile) : undefined,
      landMark: landMark ? landMark : undefined,
      contact: contact ? contact : undefined,
      designation: designation ? designation : undefined,
      department: department ? department : undefined,
      contactPersonEmail: contactPersonEmail ? contactPersonEmail : undefined,
      contactNumber: contactNumber ? contactNumber : undefined,
      alterContactNumber: alterContactNumber ? alterContactNumber : undefined,
      bankname: bankname ? bankname : "",
      bankBranchName: bankBranchName ? bankBranchName : undefined,
      accountNumber: accountNumber ? accountNumber : undefined,
      ifscCode: ifscCode ? ifscCode : undefined,
      msmeNo: msmeNo ? msmeNo : undefined,
      companyAlterNumber: companyAlterNumber ? companyAlterNumber : "",
      partyCode: partyCode ? partyCode : "",
      branchTypeId: branchTypeId ? parseInt(branchTypeId) : undefined,
      parentId: parentId ? parentId : undefined,
      aadharNo,
      attachments:
        JSON.parse(attachments)?.length > 0
          ? {
              createMany: {
                data: JSON.parse(attachments).map((sub) => ({
                  date: sub?.date ? new Date(sub?.date) : undefined,
                  filePath: sub?.filePath ? sub?.filePath : undefined,
                  name: sub?.name ? sub?.name : undefined,
                })),
              },
            }
          : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    name,
    code,
    aliasName,
    displayName,
    address,
    isSupplier,
    isCustomer,
    cityId,
    pincode,
    panNo,
    tinNo,
    cstNo,
    cstDate,
    cinNo,
    faxNo,
    email,
    website,
    contactPersonName,
    contactMobile,
    gstNo,
    coa,
    soa,
    companyId,
    active,
    userId,
    landMark,
    contact,
    designation,
    department,
    contactPersonEmail,
    contactNumber,
    alterContactNumber,
    bankname,
    bankBranchName,
    accountNumber,
    ifscCode,
    msmeNo,
    attachments,
    companyAlterNumber,
    partyCode,
    branchTypeId,
    parentId,
    isBranch,
    aadharNo,
  } = await body;

  const parseAttachments = JSON.parse(attachments || "[]");

  // console.log(parseAttachments,'parseAttachments')
  const incomingIds = parseAttachments
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  console.log(parseAttachments, "parseAttachments");

  console.log(incomingIds, "incomingIds");

  const dataFound = await prisma.party.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("party");
  const data = await prisma.party.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      aliasName,
      displayName,
      address,
      isSupplier: isSupplier ? JSON.parse(isSupplier) : false,
      isCustomer: isCustomer ? JSON.parse(isCustomer) : false,
      cityId: cityId ? parseInt(cityId) : undefined,
      pincode: pincode ? parseInt(pincode) : undefined,
      panNo,
      tinNo,
      cstNo,
      cstDate: cstDate ? new Date(cstDate) : undefined,
      cinNo,
      faxNo,
      email,
      website,
      contactPersonName,
      gstNo,
      createdById: userId ? parseInt(userId) : undefined,
      companyId: parseInt(companyId),
      active: active ? JSON.parse(active) : false,
      contactMobile: contactMobile ? parseInt(contactMobile) : undefined,
      coa: coa ? parseInt(coa) : parseInt(0),
      soa: soa ? parseInt(soa) : parseInt(0),
      landMark: landMark ? landMark : "",
      contact: contact ? contact : undefined,
      designation: designation ? designation : undefined,
      department: department ? department : undefined,
      contactPersonEmail: contactPersonEmail ? contactPersonEmail : undefined,
      contactNumber: contactNumber ? contactNumber : undefined,
      alterContactNumber: alterContactNumber ? alterContactNumber : undefined,
      bankname: bankname ? bankname : undefined,
      bankBranchName: bankBranchName ? bankBranchName : undefined,
      accountNumber: accountNumber ? accountNumber : undefined,
      ifscCode: ifscCode ? ifscCode : undefined,
      msmeNo: msmeNo ? msmeNo : undefined,
      companyAlterNumber: companyAlterNumber ? companyAlterNumber : "",
      partyCode: partyCode ? partyCode : "",
      branchTypeId: branchTypeId ? parseInt(branchTypeId) : undefined,
      parentId: parentId ? parentId : undefined,
      isBranch: isBranch ? JSON.parse(isBranch) : false,
      aadharNo,

      attachments: {
        deleteMany: {
          ...(incomingIds.length > 0 && {
            id: { notIn: incomingIds },
          }),
        },

        update: parseAttachments
          .filter((item) => item.id)
          .map((sub) => ({
            where: { id: parseInt(sub.id) },
            data: {
              date: sub?.date ? new Date(sub?.date) : undefined,
              filePath: sub?.filePath ? sub?.filePath : undefined,
              name: sub?.name ? sub?.name : undefined,
            },
          })),

        create: parseAttachments
          .filter((item) => !item.id)
          .map((sub) => ({
            date: sub?.date ? new Date(sub?.date) : undefined,
            filePath: sub?.filePath ? sub?.filePath : undefined,
            name: sub?.name ? sub?.name : undefined,
          })),
      },
    },
  });
  return { statusCode: 0, data };
}

// async function remove(id) {
//     const data = await prisma.party.delete({
//         where: {
//             id: parseInt(id)
//         },
//     })
//     return { statusCode: 0, data };
// }

async function remove(id) {
  const data = await prisma.party.deleteMany({
    where: {
      OR: [{ id: parseInt(id) }, { parentId: id }],
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
