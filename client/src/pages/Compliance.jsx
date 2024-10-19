import React from "react";
import { Link } from "react-router-dom";

const Compliance = () => {
  return (
    <div className="flex flex-row gap-4">
      <Link to="/healthcare">Healthcare</Link>
      <Link to="/finance">Finance</Link>
      <Link to="/it">Information Technology (IT)</Link>
    </div>
  );
};

export default Compliance;
