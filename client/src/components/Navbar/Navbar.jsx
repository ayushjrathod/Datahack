import "boxicons/css/boxicons.min.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <div className=" bg-gray-200 w-full h-fit flex px-[10px] justify-between select-none border-b-2">
        <a className="font-logo text-white py-[9px] text-2xl flex" href="/">
          <img src="../src/assets/images/OutOfBounds.png" className="w-24 h-6" />
        </a>
        <div className="flex mt-1">
          <div className="text-black text-xl font-roboto tracking-wide flex gap-6 py-1 mr-6">
            <Link className="" to="/recommend">
              <p className="py-2 mr-2">About Us</p>
            </Link>
            <Link className="" to="/resources">
              <p className="mr-2 py-2">Resources</p>
            </Link>
            <Link className="" to="/contact">
              <p className="mr-2 py-2">Contact Us</p>
            </Link>
          </div>
          <div className="flex">
            <img src="../src/assets/Avatar.png" className="size-12 r-2 mt-1" />
            <div className="flex flex-col py-1 mx-4 font-roboto tracking-wide">
              <p className="font-bold text-gray-600">Admin</p>
              <p className="font-bold text-xs text-gray-500">P1 Access</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
