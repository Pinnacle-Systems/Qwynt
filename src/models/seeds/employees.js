import { prisma } from "../../lib/prisma.js";

import employees from "../seed-data/employees.json" with { type: "json" };

function toPrismaDateTime(value) {
  if (!value) {
    return null;
  }

  return new Date(value.replace(" ", "T").concat("Z"));
}

export async function seedEmployees() {
  for (const employee of employees) {
    const employeeData = {
      ...employee,
      joiningDate: toPrismaDateTime(employee.joiningDate),
      dob: toPrismaDateTime(employee.dob),
      leavingDate: toPrismaDateTime(employee.leavingDate),
      createdAt: toPrismaDateTime(employee.createdAt),
      updatedAt: toPrismaDateTime(employee.updatedAt),
    };

    await prisma.employee.upsert({
      where: { id: employee.id },
      update: {
        name: employeeData.name,
        email: employeeData.email,
        regNo: employeeData.regNo,
        chamberNo: employeeData.chamberNo,
        departmentId: employeeData.departmentId,
        joiningDate: employeeData.joiningDate,
        fatherName: employeeData.fatherName,
        dob: employeeData.dob,
        gender: employeeData.gender,
        maritalStatus: employeeData.maritalStatus,
        bloodGroup: employeeData.bloodGroup,
        panNo: employeeData.panNo,
        consultFee: employeeData.consultFee,
        salaryPerMonth: employeeData.salaryPerMonth,
        commissionCharges: employeeData.commissionCharges,
        mobile: employeeData.mobile,
        accountNo: employeeData.accountNo,
        ifscNo: employeeData.ifscNo,
        branchName: employeeData.branchName,
        bankName: employeeData.bankName,
        degree: employeeData.degree,
        specialization: employeeData.specialization,
        localAddress: employeeData.localAddress,
        localCityId: employeeData.localCityId,
        localPincode: employeeData.localPincode,
        permAddress: employeeData.permAddress,
        permCityId: employeeData.permCityId,
        permPincode: employeeData.permPincode,
        active: employeeData.active,
        branchId: employeeData.branchId,
        employeeCategoryId: employeeData.employeeCategoryId,
        permanent: employeeData.permanent,
        leavingReason: employeeData.leavingReason,
        leavingDate: employeeData.leavingDate,
        canRejoin: employeeData.canRejoin,
        rejoinReason: employeeData.rejoinReason,
        createdAt: employeeData.createdAt,
        updatedAt: employeeData.updatedAt,
        employeeId: employeeData.employeeId,
      },
      create: employeeData,
    });
  }
}
