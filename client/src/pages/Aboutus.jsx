import React from "react";

const AboutUsPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        <p className="text-lg text-gray-700 mb-8">
          We are <strong>Team Out of Bounds</strong> from the AI and DS department at Vishwakarma Institute of
          Information Technology. Our team is dedicated to pushing the boundaries of artificial intelligence, data
          science, and cybersecurity, developing innovative solutions for real-world challenges.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Meet the Team</h2>
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900">Prathamesh Mahale</h3>
            <p className="text-gray-700">Team Lead</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900">Samyak Nahar</h3>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900">Ayush Rathod</h3>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900">Neha Rajurkar</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
