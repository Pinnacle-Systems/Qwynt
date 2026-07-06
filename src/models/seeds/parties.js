import { prisma } from "../../lib/prisma.js";

import parties from "../seed-data/parties.json" with { type: "json" };

function parseSqlDateTime(value) {
  if (!value) {
    return null;
  }

  return new Date(value.replace(" ", "T") + "Z");
}

export async function seedParties() {
  for (const party of parties) {
    await prisma.party.upsert({
      where: { id: party.id },
      update: {
        name: party.name,
        code: party.code,
        aliasName: party.aliasName,
        displayName: party.displayName,
        address: party.address,
        cityId: party.cityId,
        pincode: party.pincode,
        panNo: party.panNo,
        tinNo: party.tinNo,
        cstNo: party.cstNo,
        cstDate: parseSqlDateTime(party.cstDate),
        cinNo: party.cinNo,
        faxNo: party.faxNo,
        email: party.email,
        website: party.website,
        contactPersonName: party.contactPersonName,
        gstNo: party.gstNo,
        costCode: party.costCode,
        active: party.active,
        contactMobile: party.contactMobile,
        companyId: party.companyId,
        yarn: party.yarn,
        fabric: party.fabric,
        accessoryGroup: party.accessoryGroup,
        createdAt: parseSqlDateTime(party.createdAt),
        updatedAt: parseSqlDateTime(party.updatedAt),
        createdById: party.createdById,
        updatedById: party.updatedById,
        isSupplier: party.isSupplier,
        isCustomer: party.isCustomer,
        coa: party.coa,
        soa: party.soa,
        accountNumber: party.accountNumber,
        alterContactNumber: party.alterContactNumber,
        bankBranchName: party.bankBranchName,
        bankname: party.bankname,
        contact: party.contact,
        contactNumber: party.contactNumber,
        contactPersonEmail: party.contactPersonEmail,
        department: party.department,
        designation: party.designation,
        ifscCode: party.ifscCode,
        landMark: party.landMark,
        msmeNo: party.msmeNo,
        companyAlterNumber: party.companyAlterNumber,
        partyCode: party.partyCode,
        parentId: party.parentId,
        branchTypeId: party.branchTypeId,
        isBranch: party.isBranch,
        aadharNo: party.aadharNo,
      },
      create: {
        ...party,
        cstDate: parseSqlDateTime(party.cstDate),
        createdAt: parseSqlDateTime(party.createdAt),
        updatedAt: parseSqlDateTime(party.updatedAt),
      },
    });
  }
}
