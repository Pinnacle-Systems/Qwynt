import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';



async function get(req) {
    const { companyId, active, partyId } = req.query
    const data = await prisma.party.findMany({


        where: {
            active: active ? Boolean(active) : undefined,
            parentId: partyId
        }
    });

    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.party.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            attachments: true,
            City: {
                select: {
                    name: true,
                    state: true
                }
            },
            PurchaseBillSupplier: {
                select: {
                    ourPrice: true,
                    supplierId: true
                }
            },
            SalesBillSupplier: {
                select: {
                    netBillValue: true,
                    supplierId: true,
                    isOn: true
                }
            },
            Payment: {
                select: {
                    paidAmount: true,
                    partyId: true,
                    paymentType: true,
                    discount: true
                }
            },
            ledgers: true,

        }
    });

    if (!data) return NoRecordFound("party");




    return {
        statusCode: 0,
        data: {
            ...data,




        }
    };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.partyBranch.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    console.log(body, "body")
    const { name, code, aliasName, displayName, address, isSupplier, isCustomer,
        cityId, pincode, panNo, tinNo, cstNo, cstDate,
        cinNo, faxNo, email, website, contactPersonName, contactMobile,
        gstNo, currencyId, costCode, soa, coa,
        companyId, active, userId,
        landMark, contact, designation, department, contactPersonEmail, contactNumber, alterContactNumber, bankname,
        bankBranchName, accountNumber, ifscCode, attachments, msmeNo, companyAlterNumber, partyCode, branchTypeId, partyId } = await body
    const data = await prisma.party.create(
        {
            data: {
                // partyId: partyId ? parseInt(partyId) : undefined,
                name,
                code,
                aliasName,
                displayName,
                address,
                isSupplier: isSupplier ? JSON.parse(isSupplier) : false,
                isCustomer: isCustomer ? JSON.parse(isCustomer) : false,

                cityId: cityId ? parseInt(cityId) : undefined,
                pincode: pincode ? parseInt(pincode) : undefined,
                panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
                cinNo, faxNo, email, website, contactPersonName,
                gstNo, currencyId: currencyId ? parseInt(currencyId) : undefined, costCode,
                createdById: userId ? parseInt(userId) : undefined,
                companyId: parseInt(companyId),
                active: active ? JSON.parse(active) : false,
                coa: coa ? parseInt(coa) : parseInt(0), soa: soa ? parseInt(soa) : parseInt(0),
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
                companyAlterNumber: companyAlterNumber ? companyAlterNumber : '',
                partyCode: partyCode ? partyCode : "",
                branchTypeId: branchTypeId ? parseInt(branchTypeId) : undefined,
                parentId: partyId ? partyId : undefined,
                attachments: JSON.parse(attachments)?.length > 0
                    ? {
                        createMany: {
                            data: JSON.parse(attachments).map((sub) => ({
                                date: sub?.date ? new Date(sub?.date) : undefined,
                                filePath: sub?.filePath ? sub?.filePath : undefined,
                                name: sub?.name ? sub?.name : undefined

                            })),
                        },
                    }
                    : undefined,

            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, aliasName, displayName, address, isSupplier, isCustomer, currencyId,
        cityId, pincode, panNo, tinNo, cstNo, cstDate,
        cinNo, faxNo, email, website, contactPersonName, contactMobile, costCode,
        gstNo, coa, soa,
        companyId, active, userId, landMark, contact, designation, department, contactPersonEmail, contactNumber,
        alterContactNumber, bankname, bankBranchName, accountNumber, ifscCode, msmeNo, attachments, companyAlterNumber, partyCode,
        branchTypeId, partyId } = await body


    const parseAttachments = JSON.parse(attachments || "[]");

    // console.log(parseAttachments,'parseAttachments')
    const incomingIds = parseAttachments?.filter(i => i.id).map(i => parseInt(i.id));


    const dataFound = await prisma.party.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("partyBranch");
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
            panNo, tinNo, cstNo, cstDate: cstDate ? new Date(cstDate) : undefined,
            cinNo, faxNo, email, website, contactPersonName,
            gstNo, currencyId: currencyId ? parseInt(currencyId) : undefined, costCode,
            createdById: userId ? parseInt(userId) : undefined,
            companyId: parseInt(companyId),
            active: active ? JSON.parse(active) : false,
            coa: coa ? parseInt(coa) : parseInt(0), soa: soa ? parseInt(soa) : parseInt(0),
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
            companyAlterNumber: companyAlterNumber ? companyAlterNumber : '',
            partyCode: partyCode ? partyCode : "",
            branchTypeId: branchTypeId ? parseInt(branchTypeId) : undefined,
            parentId: partyId ? partyId : undefined,



            attachments: {
                deleteMany: {
                    ...(incomingIds.length > 0 && {
                        id: { notIn: incomingIds }
                    })
                },

                update: parseAttachments
                    .filter(item => item.id)
                    .map((sub) => ({
                        where: { id: parseInt(sub.id) },
                        data: {
                            date: sub?.date ? new Date(sub?.date) : undefined,
                            filePath: sub?.filePath ? sub?.filePath : undefined,
                            name: sub?.name ? sub?.name : undefined




                        },
                    })),

                create: parseAttachments
                    .filter(item => !item.id)
                    .map((sub) => ({
                        date: sub?.date ? new Date(sub?.date) : undefined,
                        filePath: sub?.filePath ? sub?.filePath : undefined,
                        name: sub?.name ? sub?.name : undefined



                    })),
            },


        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.party.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
