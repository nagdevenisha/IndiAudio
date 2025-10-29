import React from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';
import {Link} from "react-router-dom";

function Navbar() {


  
  return (
    <div className="mb-6 mt-4 shadow-md">
      {/* Top row: Back button + Logout */}
      <div className="flex items-center justify-between mb-2 pb-2 px-2">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition"
        >
          <ChevronLeft className="mr-1 w-5 h-5" />
          Back to Teams
        </button>

        {/* Logout Icon + Text */}
        <Link to="/">
        <div className="flex flex-col items-center">
          <LogOut className="text-purple-700" />
          <span className="text-sm text-purple-700 mt-1">Logout</span>
        </div>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
