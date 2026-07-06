import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";
import { exclude, base64Tobuffer } from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";

const xprisma = prisma.$extends({
  result: {
    employee: {
      imageBase64: {
        needs: { image: true },
        compute(employee) {
          return employee.image
            ? new Buffer(employee.image, "binary").toString("base64")
            : null;
        },
      },
    },
  },
});

async function getPaginated(req) {
  const { pageNumber, dataPerPage, branchId, active, searchKey } = req.query;
  const totalCount = await xprisma.employee.count({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
        {
          regNo: {
            contains: searchKey,
          },
        },
        {
          EmployeeCategory: {
            name: {
              contains: searchKey,
            },
          },
        },
        {
          chamberNo: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  const data = await xprisma.employee.findMany({
    skip: (parseInt(pageNumber) - 1) * parseInt(dataPerPage),
    take: parseInt(dataPerPage),
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
        {
          regNo: {
            contains: searchKey,
          },
        },
        {
          EmployeeCategory: {
            name: {
              contains: searchKey,
            },
          },
        },
        {
          chamberNo: {
            contains: searchKey,
          },
        },
      ],
    },
    include: {
      EmployeeCategory: true,
    },
  });
  return {
    statusCode: 0,
    data: data.map((d) => exclude({ ...d }, ["image"])),
    totalCount,
  };
}

async function get(req) {
  const { branchId, active, employeeCategory } = req.query;
  const data = await xprisma.employee.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      EmployeeCategory: {
        name: employeeCategory,
      },
    },
    include: {
      department: {
        select: {
          name: true,
        },
      },
      EmployeeCategory: true,
      _count: {
        select: {
          User: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) =>
      exclude({ ...item, childRecord: item?._count?.User }, ["image"]),
    ),
  };
}

async function getOne(id) {
  const childRecord = await prisma.user.count({
    where: { employeeId: parseInt(id) },
  });

  console.log(childRecord, "childRecord");
  const data = await xprisma.employee.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      permCity: {
        select: {
          id: true,
        },
      },
      localCity: {
        select: {
          id: true,
        },
      },
      department: {
        select: {
          id: true,
        },
      },
      EmployeeCategory: true,
    },
  });
  if (!data) return NoRecordFound("Employee");
  return { statusCode: 0, data: exclude({ ...data, childRecord }, ["image"]) };
}

async function getSearch(req) {
  const searchKey = req.params.searchKey;
  const { branchId, active } = req.query;
  const data = await xprisma.employee.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
        {
          regNo: {
            contains: searchKey,
          },
        },
        {
          department: {
            name: {
              contains: searchKey,
            },
          },
        },
        {
          chamberNo: {
            contains: searchKey,
          },
        },
      ],
    },
    include: {
      department: {
        select: {
          name: true,
        },
      },
      EmployeeCategory: true,
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => exclude({ ...item }, ["image"])),
  };
}

async function create(req) {
  const image = req.file;
  const {
    branchId,
    finYearId,
    name,
    email,
    chamberNo,
    joiningDate,
    fatherName,
    dob,
    gender,
    maritalStatus,
    bloodGroup,
    panNo,
    consultFee,
    salaryPerMonth,
    commissionCharges,
    mobile,
    accountNo,
    ifscNo,
    branchName,
    degree,
    specialization,
    localAddress,
    localCity,
    localPincode,
    permAddress,
    permCity,
    permPincode,
    department,
    employeeCategoryId,
    permanent,
    active,
    bankName,
    employeeId,
  } = await req.body;

  const branch = await prisma.branch.findUnique({
    where: {
      id: parseInt(branchId),
    },
  });
  let latestData;
  let regNo;

  if (branch.prefixCategory === "Default") {
    latestData = await prisma.employee.findFirst({
      where: {
        branchId: parseInt(branchId),
      },
      orderBy: {
        id: "desc",
      },
    });
    regNo =
      branch.idPrefix +
      "/" +
      (latestData
        ? parseInt(latestData.regNo.split("/")[1]) + 1
        : parseInt(branch.idSequence) + 1);
  } else {
    latestData = await prisma.employee.findFirst({
      where: {
        branchId: parseInt(branchId),
        permanent: permanent ? JSON.parse(permanent) : false,
      },
      orderBy: {
        id: "desc",
      },
    });
    let prefix = permanent
      ? JSON.parse(permanent)
      : false
        ? branch.idPrefix
        : branch.tempPrefix;
    let sequenceNumber = latestData
      ? parseInt(latestData.regNo.split("/")[1]) + 1
      : parseInt(
          permanent
            ? JSON.parse(permanent)
            : false
              ? branch.idSequence
              : branch.tempSequence,
        ) + 1;
    regNo = prefix + "/" + sequenceNumber;
  }
  async function getEmployeeId(branchId, startTime, endTime) {
    let lastObject = await prisma.employee.findFirst({
      where: {
        branchId: parseInt(branchId),
        // isTaxBill: typeof (isTaxBill) === "undefined" ? undefined : JSON.parse(isTaxBill),
        AND: [
          {
            createdAt: {
              gte: startTime,
            },
          },
          {
            createdAt: {
              lte: endTime,
            },
          },
        ],
      },
      orderBy: {
        id: "desc",
      },
    });
    console.log(lastObject, "lastObject");
    const code = "EMP";
    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}/${code}/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}/${code}/${parseInt(lastObject.regNo.split("/").at(-1)) + 1}`;
    }
    console.log(newDocId, "newDocId");
    return newDocId;
  }

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  let Regno = finYearDate
    ? await getEmployeeId(
        branchId,
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";
  const data = await prisma.employee.create({
    data: {
      regNo: Regno,
      EmployeeCategory: { connect: { id: parseInt(employeeCategoryId) } },
      Branch: { connect: { id: parseInt(branchId) } },
      name,
      email,
      chamberNo,
      fatherName,
      dob: dob ? new Date(dob) : null,
      joiningDate: dob ? new Date(joiningDate) : null,
      gender,
      maritalStatus,
      department: department
        ? {
            connect: { id: parseInt(department) },
          }
        : undefined,
      active: active ? JSON.parse(active) : undefined,
      bloodGroup,
      panNo,
      consultFee,
      salaryPerMonth,
      commissionCharges,
      mobile: mobile ? parseInt(mobile) : null,
      accountNo: accountNo,
      ifscNo,
      branchName,
      degree,
      specialization,
      localAddress,
      localPincode: localPincode ? parseInt(localPincode) : null,
      permAddress,
      permCity: permCity ? { connect: { id: parseInt(permCity) } } : undefined,
      permPincode: permPincode ? parseInt(permPincode) : null,
      image: image ? image.buffer : undefined,
      permanent: permanent ? JSON.parse(permanent) : undefined,
      bankName: bankName ? bankName : "",
      employeeId: employeeId ? employeeId : undefined,
    },
  });
  return { statusCode: 0, data: exclude({ ...data }, ["image"]) };
}

async function update(id, req) {
  const image = req.file;
  const {
    name,
    email,
    regNo,
    chamberNo,
    joiningDate,
    fatherName,
    dob,
    gender,
    maritalStatus,
    bloodGroup,
    panNo,
    consultFee,
    salaryPerMonth,
    commissionCharges,
    mobile,
    accountNo,
    ifscNo,
    branchName,
    degree,
    specialization,
    localAddress,
    localCity,
    localPincode,
    permAddress,
    permCity,
    permPincode,
    department,
    employeeCategoryId,
    active,
    leavingReason,
    leavingDate,
    canRejoin,
    rejoinReason,
    isDeleteImage,
    bankName,
    employeeId,
  } = await req.body;
  const dataFound = await prisma.employee.findFirst({
    where: {
      id: parseInt(id),
    },
  });
  let removeImage = isDeleteImage ? JSON.parse(isDeleteImage) : false;
  if (!dataFound) return NoRecordFound("Employee");
  const data = await prisma.employee.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      email,
      regNo,
      chamberNo,
      fatherName,
      dob: dob ? new Date(dob) : undefined,
      joiningDate: dob ? new Date(joiningDate) : undefined,
      gender,

      maritalStatus,
      bloodGroup,
      panNo,
      consultFee,
      salaryPerMonth,
      commissionCharges,
      mobile: mobile ? parseInt(mobile) : undefined,
      accountNo: accountNo,
      ifscNo,
      branchName,
      degree,
      specialization,
      localAddress,
      image: image ? image.buffer : removeImage ? null : undefined,
      localCityId: localCity ? parseInt(localCity) : undefined,
      permCityId: permCity ? parseInt(permCity) : undefined,
      departmentId: department ? parseInt(department) : undefined,
      localPincode: localPincode ? parseInt(localPincode) : undefined,
      permAddress,
      permPincode: permPincode ? parseInt(permPincode) : undefined,
      employeeCategoryId: employeeCategoryId
        ? parseInt(employeeCategoryId)
        : undefined,
      active: active ? JSON.parse(active) : undefined,
      leavingDate: leavingDate ? new Date(leavingDate) : undefined,
      leavingReason,
      rejoinReason,
      canRejoin: canRejoin ? JSON.parse(canRejoin) : undefined,
      bankName: bankName ? bankName : "",
      employeeId: employeeId ? employeeId : undefined,
    },
  });
  return { statusCode: 0, data: exclude({ ...data }, ["image"]) };
}

async function remove(id) {
  const data = await prisma.employee.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getPaginated, getOne, getSearch, create, update, remove };
