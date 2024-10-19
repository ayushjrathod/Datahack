import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Chatbot from "./pages/Chatbot";
import Domain from "./pages/Domain";
import Finance from "./pages/Finance";
import PhasedQuestionnaire from "./pages/Healthcare";
import Home from "./pages/Home";
import It from "./pages/It";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/select-domain" element={<Domain />} />
          <Route path="/healthcare" element={<PhasedQuestionnaire />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/it" element={<It />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
