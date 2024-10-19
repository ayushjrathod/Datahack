import React from "react";
import { Link } from "react-router-dom";
import UploadDocument from "../components/Home/Uploaddoc";

const Home = () => {
  return (
    <div className="flex flex-row gap-4">
      <Link to="/chatbot">Open Chatbot</Link>
      <UploadDocument />
      <Link to="/questionnaire">Questionnaire</Link>
      <Link to="/compliance-check">Compliance Check</Link>
    </div>
  );
};

export default Home;
