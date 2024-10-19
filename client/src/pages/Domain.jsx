import React from "react";
import { Link } from "react-router-dom";

const Domain = () => {
  return (
    <div>
      <Link to="/healtcare">Healthcare</Link>
      <Link to="/finance">Finance</Link>
      <Link to="/it">Information Technology (IT)</Link>
    </div>
  );
};

export default Domain;
