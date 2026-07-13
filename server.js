import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

import {
  employees,
  states,
  countries,
  cities,
  departments,
  companies,
  branches,
  users,
  pages,
  roles,
  subscriptions,
  finYear,
  employeeCategories,
  pageGroup,
  party,
  partyCategories,
  productBrand,
  productCategory,
  product,
  purchaseBill,
  OpeningStock,
  stock,
  salesBill,
  purchaseReturn,
  salesReturn,
  payments,
  uom,
  style,
  styleItem,
  deliveryChallan,
  deliveryInvoice,
  color,
  taxTerm,
  taxTemplate,
  hsn,
  partyBranch,
  branchType,
  openingBalance,
  po,
  termsAndCondition,
  payTerm,
  location,
  purchaseInwardEntry,
  purchaseCancel,
  purchaseBillEntry,
  size,
  gsm,
  itemGroup,
  Sizetemplate,
  purchaseReport,
  approvalConfig,
  approvalMasterData,
  orderEntry,
  processMaster,
  processGroup,
  plateMaster,
  dieMaster,
  jobCard,
  board,
  ProformaInvoice,
  currency,
  bank,
  productionAllocation,
  notification,
  machine,
  productionOutward,
  productionInward,
  processBill,
  salesDelivery,
  modelName,
  printingDesign,
  styleMaster,
  itemVariantMaster,
} from "./src/routes/index.js";
import { setIo } from "./src/utils/notificationHelper.js";
import { socketMain } from "./src/sockets/socket.js";

const app = express();
// app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  next();
});
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());

const path = __dirname + "/client/dist/";

app.use(express.static(path));

app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

BigInt.prototype["toJSON"] = function () {
  return parseInt(this.toString());
};

app.use("/employees", employees);
app.use("/countries", countries);
app.use("/states", states);
app.use("/cities", cities);
app.use("/departments", departments);
app.use("/companies", companies);
app.use("/branches", branches);
app.use("/users", users);
app.use("/pages", pages);
app.use("/pageGroup", pageGroup);
app.use("/roles", roles);
app.use("/subscriptions", subscriptions);
app.use("/finYear", finYear);
app.use("/employeeCategories", employeeCategories);
app.use("/partyCategories", partyCategories);
app.use("/party", party);
app.use("/productBrand", productBrand);
app.use("/productCategory", productCategory);
app.use("/product", product);
app.use("/purchaseBill", purchaseBill);
app.use("/OpeningStock", OpeningStock);
app.use("/color", color);
app.use("/size", size);
app.use("/gsm", gsm);
app.use("/itemGroup", itemGroup);
app.use("/purchaseInwardEntry", purchaseInwardEntry);
app.use("/stock", stock);
app.use("/salesBill", salesBill);
app.use("/purchaseReturn", purchaseReturn);
app.use("/purchaseCancel", purchaseCancel);
app.use("/salesReturn", salesReturn);
app.use("/uom", uom);
app.use("/payments", payments);
app.use("/style", style);
app.use("/styleItem", styleItem);
app.use("/deliveryChallan", deliveryChallan);
app.use("/deliveryInvoice", deliveryInvoice);
app.use("/taxTerm", taxTerm);
app.use("/taxTemplate", taxTemplate);
app.use("/hsn", hsn);
app.use("/partyBranch", partyBranch);
app.use("/branchType", branchType);
app.use("/openingBalance", openingBalance);
app.use("/po", po);
app.use("/termsconditions", termsAndCondition);
app.use("/payTerm", payTerm);
app.use("/location", location);
app.use("/purchaseBillEntry", purchaseBillEntry);
app.use("/sizeTemplate", Sizetemplate);
app.use("/purchaseReport", purchaseReport);
app.use("/approval", approvalConfig);
app.use("/approvalMasterData", approvalMasterData);
app.use("/orderEntry", orderEntry);
app.use("/process", processMaster);
app.use("/processGroup", processGroup);
app.use("/plate", plateMaster);
app.use("/die", dieMaster);
app.use("/jobCard", jobCard);
app.use("/board", board);
app.use("/proformaInvoice", ProformaInvoice);
app.use("/currency", currency);
app.use("/bank", bank);
app.use("/productionAllocation", productionAllocation);
app.use("/notification", notification);
app.use("/machine", machine);
app.use("/productionOutward", productionOutward);
app.use("/productionInward", productionInward);
app.use("/processBill", processBill);
app.use("/salesDelivery", salesDelivery);
app.use("/modelName", modelName);
app.use("/printingDesign", printingDesign);
app.use("/styleMaster", styleMaster);
app.use("/itemVariant", itemVariantMaster);

app.get("/retreiveFile/:fileName", (req, res) => {
  const { fileName } = req.params;
  res.sendFile(__dirname + "/uploads/" + fileName);
});

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
setIo(io);
io.on("connection", socketMain);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
