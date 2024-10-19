import Spline from "@splinetool/react-spline";
import React from "react";
import { Link } from "react-router-dom";
import UploadDocument from "../components/Home/Uploaddoc";

const Home = () => {
  return (
    <div>
      <div className="flex flex-row justify-between h-screen w-screen bg-gradient-to-r from-purple-500 to-black">
        <div className="flex flex-col gap-4 h-screen items-center text-center">
          <h1 className="text-white font-semibold font-4xl text-justify w-96 ml-16 mt-52">
            Our dynamic bot conducts a comprehensive assessment, analyzing your network security, data protection, and
            incident response strategies. Using advanced NLP and machine learning, it calculates real-time risk scores
            and provides actionable insights to fortify your defenses.
          </h1>
          <div className="flex gap-2">
            <Link className="h-fit text-white p-2 py-4 border-2 rounded-md font-semibold" to="/chatbot">
              Open Chatbot
            </Link>
            <UploadDocument />
          </div>
        </div>
        <div className=" mr-24">
          <Spline scene="https://prod.spline.design/qXCx-M-7xEX2afLp/scene.splinecode" />
        </div>
      </div>
    </div>
  );
};

export default Home;
