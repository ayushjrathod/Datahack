import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-row gap-4">
      <Link to="/chatbot">Open Chatbot</Link>
      <Link to="/upload">Upload Document</Link>
      <Link to="/select-domain">Questionnaire</Link>
    </div>
  );
};

export default Home;
