import React from "react";
import { createRoot } from "react-dom/client";
import { Meteor } from "meteor/meteor";
import { BrowserRouter } from "react-router-dom";

import "./main.css";
import App from "/imports/ui/App.jsx";

Meteor.startup(() => {
  const el = document.getElementById("react-target");
  createRoot(el).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
