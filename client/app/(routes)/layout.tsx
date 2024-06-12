import { Navbar } from "./_components/Navbar";
import Heading from "../utils/Heading";

import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-row h-full">
      <div className="h-[80px] fixed w-full inset-y-0 z-50">
        <Heading
          title="ULEARNOW"
          description="Page description"
          keywords="Page keywords"
        />
        <Navbar />
      </div>
      {/* <div className="hidden md:flex h-full w-56 mt-[80px] fixed left-0 flex-col inset-y-0 z-50 border">
        add md:ml-56 to the class above
      </div> */}
      <div className=" mt-[80px] p-4 w-full">{children}</div>
    </div>
  );
};

export default DashboardLayout;
