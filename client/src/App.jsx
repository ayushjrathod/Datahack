import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Chatbot from "./pages/Chatbot";
import Compliance from "./pages/Compliance";
import Finance from "./pages/Finance";
import Healthcare from "./pages/Healthcare";
import Home from "./pages/Home";
import It from "./pages/It";
import PhasedQuestionnaire from "./pages/PhasedQuestionnaire";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/compliance-check" element={<Compliance />} />
          <Route path="/questionnaire" element={<PhasedQuestionnaire />} />
          <Route path="/healthcare" element={<Healthcare />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/it" element={<It />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
