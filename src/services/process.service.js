import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.process.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      // active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          processGroupList: true,
          laminationDetails: true,
          varnishDetails: true,
          machineDetails: true,
          processDetails: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((process) => ({
      ...process,
      childRecord:
        process._count.processGroupList +
        process._count.laminationDetails +
        process._count.varnishDetails +
        process._count.machineDetails +
        process._count.processDetails,
    })),
  };
}

async function getOne(id) {
  const data = await prisma.process.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("process");
  const processCount = await prisma.processGroupList.count({
    where: {
      processId: parseInt(id),
    },
  });
  return { statusCode: 0, data: { ...data, ...{ childRecord: processCount } } };
}

async function create(body) {
  const {
    name,
    companyId,
    active = true,
    isOutsideJob,
    departmentId,
  } = await body;

  const data = await prisma.process.create({
    data: {
      name,
      active,
      companyId: parseInt(companyId),
      isOutsideJob: Boolean(isOutsideJob),
      departmentId: parseInt(departmentId),
    },
  });

  return { statusCode: 0, data };
}



async function UpdateCurrentProcess(req) {
  const { status, processId } = req?.body;

  const data = await prisma.processRoute.update({
    where: { id: Number(processId ?? 0) },
    data: {
      status,
    },
  });

  return { statusCode: 1, data };
}


async function UpdateProcess(req) {
  const { status, jobcardId, processId,flag, type, departmentId, machineId, userId, id , completedQty} = req?.body;

  // Get current time in IST (UTC+5:30)
   const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const istISOString = istTime.toISOString();


  

  const currentDate = istTime.toISOString();       // "YYYY-MM-DD"
  const currentTime = istTime.toISOString()         //.split("T")[1].split(".")[0]; // "HH:MM:SS"

  let data;

  await prisma.$transaction(async (tx) => {
    const process_start = await tx.processRoute.update({
      where: {
        id: Number(processId || 0),
      },
      data: {
        status: status,
      },
    });


    let addMain_punch_log;
    
   if (flag === "START") {
      
      addMain_punch_log = await tx.productionempPunch.create({
       data: {
    JobCard:      { connect: { id: Number(jobcardId) } },       
    ProcessRoute: { connect: { id: Number(processId || 0) } },  
    startDate: istISOString,
    startTime: istISOString,
    User:      { connect: { id: Number(userId) } },
    deparment: { connect: { id: Number(departmentId) } },
    Machine:   { connect: { id: Number(machineId) } },
       },
      });

    } else if (flag === "STOP") {
 console.log("com",completedQty)
      if(!completedQty)  throw new Error("Completed Qty Must Be Entered")
      if (Number(completedQty ?? 0) <= 0) throw new Error("Completed Qty must be greater than 0");

         

        await tx.processRoute.update({
        where: {
        id: Number(processId || 0),
        },
        data: {
       completedQty : Number(completedQty),
        },
        });
      
      addMain_punch_log = await tx.productionempPunch.update({
        where: { id: Number(id) },  // ← real punchId from frontend
        data: {
          endDate: istISOString,
          endTime: istISOString,
          
        },
      });
    }


    
    data = { process_start, addMain_punch_log }; 
  });


   console.log("process",{statusCode:1,data});
  return {statusCode:1,data};  // ✅ return after transaction completes
}




async function UpdatePushProcess(req) {
  const {  flag, productionlogid, userId, id } = req?.body;

   const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const istISOString = istTime.toISOString();

  //const currentDate = istTime.toISOString();       
  const currentTime = istTime.toISOString()        

  let data;

 console.log("Flog",{
         
          pushtime: istISOString,
          productionlog : productionlogid,
          Userid : userId,
        });
 
  

  await prisma.$transaction(async (tx) => {

    let addMain_punch_log;
    
   if (flag === "PAUSE") {

      
      addMain_punch_log = await tx.pushLogs.create({

        data: {
         
          pushtime: istISOString,
          productionlog : productionlogid,
          Userid : userId,
        },
      });

    } else if (flag === "RESUME") {


      const lastPausedLog = await tx.pushLogs.findFirst({
  where: {
    productionlog: productionlogid,
    Userid:        userId,
    pushtime:     { not: null },   
    resumetime:    null,           
  },
  orderBy: {
    pushtime: 'desc',              
  },
});
      
      addMain_punch_log = await tx.pushLogs.update({
        where: {
    id: lastPausedLog.id,           // ✅ unique id — safe to update
       },
        data: {
          resumetime: istISOString,
        }
      });
    }


    
    data =  addMain_punch_log 
  });


   console.log("process PUSH",{statusCode:1,data});
  return {statusCode:1,data};  
}

async function update(id, body) {
  const { name, active, companyId, isOutsideJob, departmentId } = await body;
  const dataFound = await prisma.process.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("process");
  const data = await prisma.process.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      active,
      companyId: parseInt(companyId),
      isOutsideJob: Boolean(isOutsideJob),
      departmentId: parseInt(departmentId)
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.process.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove,UpdateProcess,UpdatePushProcess,UpdateCurrentProcess };
