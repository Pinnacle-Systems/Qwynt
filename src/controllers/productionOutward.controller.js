import { Prisma } from "../lib/prisma.js";
import {
  get as _get,
  getOne as _getOne,
  create as _create,
  update as _update,
  remove as _remove,
  getOutwardJobCardDtls as _getOutwardJobCardDtls,
} from "../services/productionOutward.service.js";

async function get(req, res, next) {
  try {
    res.json(await _get(req));
  } catch (err) {
    console.error(`Error `, err.message);
    res.status(500).json({ statusCode: 1, message: err.message });
  }
}

async function getOne(req, res, next) {
  try {
    res.json(await _getOne(req.params.id));
  } catch (err) {
    console.error(`Error`, err.message);
    res.status(500).json({ statusCode: 1, message: err.message });
  }
}

async function create(req, res, next) {
  try {
    res.json(await _create(req.body));
  } catch (error) {
    console.error(`Error`, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
      }
    } else {
      res.json({ statusCode: 1, message: error.message });
    }
  }
}

async function update(req, res, next) {
  try {
    res.json(await _update(req.params.id, req.body, req.files));
  } catch (error) {
    console.error(`Error`, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.json({
          statusCode: 1,
          message: `${error.meta.target
            .split("_")[1]
            .toUpperCase()} Already exists`,
        });
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
      res.json({ statusCode: 1, message: `Record Not Found` });
    } else if (error.code === "P2003") {
      res.json({ statusCode: 1, message: "Child record Exists" });
    } else {
      res.json({ statusCode: 1, message: error.message });
    }
    console.log(`Error`, error.message);
  }
}

async function getOutwardJobCardDtls(req, res, next) {
  try {
    res.json(await _getOutwardJobCardDtls(req));
  } catch (err) {
    console.error(`Error`, err.message);
  }
}

export { get, getOne, create, update, remove, getOutwardJobCardDtls };
