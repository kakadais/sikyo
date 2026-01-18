import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ShopsPage from "./pages/ShopsPage.jsx";
import ShopMenusPage from "./pages/ShopMenusPage.jsx";

export default function App() {
  return (
    <div className="bg-neutral-950 min-h-screen font-sans antialiased text-neutral-950">
      
      {/* Header Area */}
      <header className="pt-14 pb-8 px-6 text-white text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">sikyo</h1>
      </header>

      {/* Main Content Sheet */}
      <div className="bg-white rounded-t-[40px] px-6 pt-14 pb-24 min-h-[calc(100vh-100px)]">
        <div className="mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<ShopsPage />} />
            <Route path="/shops/:shopId" element={<ShopMenusPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      
    </div>
  );
}
