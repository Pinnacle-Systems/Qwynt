import { Prisma } from "../lib/prisma.js";
import {
  get as _get,
  getOne as _getOne,
  create as _create,
  update as _update,
  remove as _remove,
  getJobCardList as _getJobCardList,
  get_mob_joblist  as _get_mob_joblist,
  get_mob_jobcard as _get_mob_jobcard,
  getMachinebydep  as _getMachinebydep,
  getEmployeeTakenJobcard as _getEmployeeTakenJobcard,
  get_mob_compl_jobcard   as _get_mob_compl_jobcard

} from "../services/JobCard.service.js";

async function get(req, res, next) {
  try {
    res.json(await _get(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getEmployeeTakenJobcard(req, res, next) {

   try {
    res.json(await _getEmployeeTakenJobcard(req));
  } catch (err) {
    console.error(`Error `, err.message);
     res.statusCode(500).json({ statusCode: 0,
  data: null,
  message: err.message,})
  }
  
}


async function getMachinebydep(req, res, next) {

   try {
    res.json(await _getMachinebydep(req));
  } catch (err) {
   
    console.error(`Error `, err.message);
      res.status(500).json({ statusCode: 0,
  data: null,
  message: err.message,})
  }
  
}





async function get_mob_compl_jobcard(req, res, next) {
  try {
    res.json(await _get_mob_compl_jobcard(req));
  } catch (err) {
    console.error(`Error `, err.message);
    
    res.status(500).json({ statusCode: 0,
  data: null,
  message: err.message,})
  }
}


async function get_mob_jobcard(req, res, next) {
  try {
    res.json(await _get_mob_jobcard(req));
  } catch (err) {
    console.error(`Error `, err.message);
    
    res.status(500).json({ statusCode: 0,
  data: null,
  message: err.message,})
  }
}

async function get_mob_joblist(req, res, next) {
  try {
    res.json(await _get_mob_joblist(req));
  } catch (err) {
    
    console.error(`Error `, err.message);
     res.status(500).json({ statusCode: 0,
  data: null,
  message: err.message,})
  }
}


async function getJobCardList(req, res, next) {
  try {
    res.json(await _getJobCardList(req));
  } catch (err) {
  
    console.error(`Error `, err.message);
       res.status(500).json({message:err})
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}
async function create(req, res, next) {
  try {
    console.log("TYPE OF BODY:", typeof req.body);
    console.log("BODY:", req.body);
    res.json(await _create(req.body));
  } catch (error) {
    console.error(`Error`, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({ statusCode: 1, message: error.message });
    }
  }
}
async function update(req, res, next) {
  try {
    res.json(await _update(req.params.id, req.body));
  } catch (error) {
    console.error(`Error`, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({ statusCode: 1, message: error.message });
    }
  }
}

async function remove(req, res, next) {
  try {
    res.json(await _remove(req.params.id));
  } catch (error) {
    if (error.code === "P2025") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: `Record Not Found` });
      console.log(res.statusCode);
    } else if (error.code === "P2003") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: "Child record Exists" });
    }
    console.log(`Error`, error.message);
  }
}

export { get, getOne, create, update, remove, getJobCardList,get_mob_joblist, get_mob_jobcard, getMachinebydep , getEmployeeTakenJobcard , get_mob_compl_jobcard};
