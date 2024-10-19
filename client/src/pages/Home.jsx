import React from "react";
import { Link } from "react-router-dom";
import UploadDocument from "../components/Home/Uploaddoc";

const Home = () => {
  return (
    <div className="flex flex-row gap-4 h-screen w-screen bg-[#3076F8]">
      <Link to="/chatbot">Open Chatbot</Link>
      <UploadDocument />
    </div>
  );
};

export default Home;
