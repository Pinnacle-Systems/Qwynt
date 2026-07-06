import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const apiRoutes = [
  "/employees",
  "/countries",
  "/states",
  "/cities",
  "/departments",
  "/companies",
  "/branches",
  "/users",
  "/pages",
  "/pageGroup",
  "/roles",
  "/subscriptions",
  "/finYear",
  "/employeeCategories",
  "/partyCategories",
  "/party",
  "/productBrand",
  "/productCategory",
  "/product",
  "/purchaseBill",
  "/OpeningStock",
  "/color",
  "/size",
  "/gsm",
  "/itemGroup",
  "/purchaseInwardEntry",
  "/stock",
  "/salesBill",
  "/purchaseReturn",
  "/purchaseCancel",
  "/salesReturn",
  "/uom",
  "/payments",
  "/style",
  "/styleItem",
  "/deliveryChallan",
  "/deliveryInvoice",
  "/taxTerm",
  "/taxTemplate",
  "/hsn",
  "/partyBranch",
  "/branchType",
  "/openingBalance",
  "/po",
  "/termsconditions",
  "/payTerm",
  "/location",
  "/purchaseBillEntry",
  "/sizeTemplate",
  "/purchaseReport",
  "/approval",
  "/retreiveFile",
  "/socket.io",
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET ?? "http://localhost:8080";

  return {
    plugins: [react({ include: /\.(js|jsx|ts|tsx)$/ })],
    define: {
      "process.env.REACT_APP_SERVER_URL": JSON.stringify(
        env.REACT_APP_SERVER_URL ?? "/",
      ),
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    build: {
      outDir: "dist",
    },
    server: {
      host: "0.0.0.0",
      proxy: Object.fromEntries(
        apiRoutes.map((route) => [
          route,
          {
            target: apiTarget,
            changeOrigin: true,
            ws: route === "/socket.io",
          },
        ]),
      ),
    },
  };
});
