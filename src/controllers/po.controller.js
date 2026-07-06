import { Prisma } from "../lib/prisma.js";

import {
  get as _get,
  getOne as _getOne,
  getSearch as _getSearch,
  getPoItems as _getPoItems,
  create as _create,
  update as _update,
  remove as _remove,
  createApproveStatus as _createApproveStatus,
} from "../services/po.service.js";

async function get(req, res, next) {
  res.json(await _get(req));
  try {
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

// export async function getPoItemById(req, res, next) {
//         console.log(req.params,"getPoItemById")

//     try {
//         res.json(await _getPoItemById(req.params.id, req.params.purchaseInwardReturnId, req.params.stockId, req.params.storeId, req.params.billEntryId, req.params.poType));
//         console.log(res.statusCode);
//     } catch (err) {
//         console.error(`Error`, err.message);
//     }
// }

async function getSearch(req, res, next) {
  try {
    res.json(await _getSearch(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function create(req, res, next) {
  try {
    res.json(await _create(req.body));
  } catch (error) {
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({
        statusCode: 1,
        message:
          error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
      });
    }
  }
}

async function createApproveStatus(req, res, next) {
  try {
    res.json(await _createApproveStatus(req.body));
  } catch (error) {
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
    );
  }
}

async function update(req, res, next) {
  try {
    res.json(await _update(req.params.id, req.body));
  } catch (error) {
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.statusCode = 200;
        res.json({
          statusCode: 1,
          message: `${error.meta.target.split("_")[1].toUpperCase()} Already exists`,
        });
        console.log(res.statusCode);
      }
    } else {
      res.json({
        statusCode: 1,
        message:
          error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
      });
    }
  }
}

async function remove(req, res, next) {
  try {
    res.json(await _remove(req.params.id));
    console.log(res.statusCode);
  } catch (error) {
    if (error.code === "P2025") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: `Record Not Found` });
      console.log(res.statusCode);
    } else if (error.code === "P2003") {
      res.statusCode = 200;
      res.json({ statusCode: 1, message: "Child record Exists" });
    }
    console.error(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
    );
  }
}

async function getPoItems(req, res, next) {
  try {
    res.json(await _getPoItems(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getPoItems,
  createApproveStatus,
};
