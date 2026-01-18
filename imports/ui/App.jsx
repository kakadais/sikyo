import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import JoinPage from "./pages/JoinPage.jsx";
import ShopsPage from "./pages/ShopsPage.jsx";
import ShopMenusPage from "./pages/ShopMenusPage.jsx";

export default function App() {
  return (
    <div className="min-h-dvh bg-white dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/shops" element={<ShopsPage />} />
        <Route path="/shops/:shopId" element={<ShopMenusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
