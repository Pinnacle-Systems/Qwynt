import {
  getFields as _getFields,
  getOperators as _getOperators,
  seedDefaults as _seedDefaults,
  addField as _addField,
  updateField as _updateField,
  deleteField as _deleteField,
  addOperator as _addOperator,
  updateOperator as _updateOperator,
  deleteOperator as _deleteOperator,
  getModules as _getModules,
  addModule as _addModule,
  updateModule as _updateModule,
  deleteModule as _deleteModule,
} from "../services/approvalMasterData.service.js";

async function getFields(req, res, next) {
  try {
    res.json(await _getFields(req));
  } catch (err) {
    next(err);
  }
}

async function getOperators(req, res, next) {
  try {
    res.json(await _getOperators(req));
  } catch (err) {
    next(err);
  }
}

async function seedDefaults(req, res, next) {
  try {
    res.json(await _seedDefaults(req));
  } catch (err) {
    next(err);
  }
}

async function addField(req, res, next) {
  try {
    res.json(await _addField(req));
  } catch (err) {
    next(err);
  }
}

async function updateField(req, res, next) {
  try {
    res.json(await _updateField(req));
  } catch (err) {
    next(err);
  }
}

async function deleteField(req, res, next) {
  try {
    res.json(await _deleteField(req));
  } catch (err) {
    next(err);
  }
}

async function addOperator(req, res, next) {
  try {
    res.json(await _addOperator(req));
  } catch (err) {
    next(err);
  }
}

async function updateOperator(req, res, next) {
  try {
    res.json(await _updateOperator(req));
  } catch (err) {
    next(err);
  }
}

async function deleteOperator(req, res, next) {
  try {
    res.json(await _deleteOperator(req));
  } catch (err) {
    next(err);
  }
}

async function getModules(req, res, next) {
  try {
    res.json(await _getModules(req));
  } catch (err) {
    next(err);
  }
}

async function addModule(req, res, next) {
  try {
    res.json(await _addModule(req));
  } catch (err) {
    next(err);
  }
}

async function updateModule(req, res, next) {
  try {
    res.json(await _updateModule(req));
  } catch (err) {
    next(err);
  }
}

async function deleteModule(req, res, next) {
  try {
    res.json(await _deleteModule(req));
  } catch (err) {
    next(err);
  }
}

export { 
  getFields, getOperators, seedDefaults,
  addField, updateField, deleteField,
  addOperator, updateOperator, deleteOperator,
  getModules, addModule, updateModule, deleteModule
};
