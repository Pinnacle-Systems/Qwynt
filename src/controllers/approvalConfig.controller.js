import { Prisma } from "../lib/prisma.js";

import {
  get as _get,
  getPendingApproval as _getPendingApproval,
  getOne as _getOne,
  create as _create,
  update as _update,
  remove as _remove,
  markApprovalRead as _markApprovalRead,
} from "../services/approvalConfig.service.js";

async function get(req, res, next) {
  try {
    res.json(await _get(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function getPendingApproval(req, res, next) {
  try {
    res.json(await _getPendingApproval(req));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

// ✅ FIX: removed duplicate — just delegates to service like all other functions
async function markApprovalRead(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    res.json(await _markApprovalRead(id, userId));
  } catch (error) {
    if (error.code === "P2025") {
      res.json({ statusCode: 1, message: "Record Not Found" });
    } else {
      res.json({ statusCode: 400, message: error.message });
    }
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
    console.log(res.statusCode);
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

async function create(req, res, next) {
  try {
    res.json(await _create(req.body));
    console.log(res.statusCode);
  } catch (error) {
    console.error(`Error`, error?.message);
    res.json({
      statusCode: 1,
      message:
        error?.message?.match(/message: "(.*?)"/)?.[1] ||
        error?.message ||
        "Something went wrong",
    });
  }
}
// approvalConfig.controller.js — add this function

async function update(req, res, next) {
  try {
    res.json(await _update(req.params.id, req.body));
    console.log(res.statusCode);
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
    console.log(
      `Error`,
      error?.message?.match(/message: "(.*?)"/)?.[1] || error?.message,
    );
  }
}

export {
  get,
  getOne,
  create,
  update,
  remove,
  getPendingApproval,
  markApprovalRead,
};
