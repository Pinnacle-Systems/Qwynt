import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import { Login, Home } from "../Basic/pages";
import { ProtectedRoute } from "../Basic/components";
import { LOGIN, HOME_PATH, PRODUCT_ADMIN_HOME_PATH } from "./urlPaths";

export default function Routing() {
  return (
    <HashRouter>
      <Routes>
        <Route path={LOGIN} element={<Login />} />
        <Route
          path={HOME_PATH}
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path={PRODUCT_ADMIN_HOME_PATH}
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
