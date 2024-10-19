import "boxicons/css/boxicons.min.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <div className=" bg-[#3076F8] w-full h-fit flex px-[10px] justify-between select-none">
        <a className="font-logo text-white py-[9px] text-2xl flex" href="/">
          <img src="../src/assets/images/OutOfBounds.png" className="w-24 h-6" />
        </a>
        <div className="flex mt-1">
          <div className="text-black text-xl font-roboto tracking-wide flex gap-6 py-1 mr-6">
            <Link className="text-white font-semibold hover:text-black" to="/recommend">
              <p className="py-2 mr-2">About Us</p>
            </Link>
            <Link className="text-white font-semibold hover:text-black" to="/resources">
              <p className="mr-2 py-2">Resources</p>
            </Link>
            <Link className="text-white font-semibold hover:text-black" to="/contact">
              <p className="mr-2 py-2">Contact Us</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
