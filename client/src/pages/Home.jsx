import Spline from "@splinetool/react-spline";
import React from "react";
import { Link } from "react-router-dom";
import UploadDocument from "../components/Home/Uploaddoc";

const Home = () => {
  return (
    <div>
      <div className="flex flex-row justify-around gap-4 h-screen w-screen bg-[#3076F8]">
        <div className="flex gap-4 h-screen items-center text-center">
          <Link className="bg-[#E4494D] h-fit text-white p-2 rounded-md mt-10" to="/chatbot">
            Open Chatbot
          </Link>
          <UploadDocument />
        </div>
        <div className="">
          <Spline scene="https://prod.spline.design/qXCx-M-7xEX2afLp/scene.splinecode" />
        </div>
      </div>
    </div>
  );
};

export default Home;
