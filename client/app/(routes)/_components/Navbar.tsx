"use client";
import Link from "next/link";
import { useState } from "react";
import { ThemeSwitcher } from "../../utils/themeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import { NavItemsBar } from "./NavItemBar";

type Props = {};
export const Navbar = ({}: Props) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 80) {
        setActive(true);
      } else {
        setActive(false);
      }
    });
  }
  return (
    <div className="w-full relative ">
      <div
        className={`dark:border-gray-900  transition duration-500 fixed top-0 left-0 ${
          active
            ? `w-full bg-slate-700 border-b dark:border-gray-800 dark:bg-opacity-50 bg-gradient-to-b dark:from-gray-900 dark:to-dark shadow-xl h-[80px] z-50`
            : `w-full dark:bg-slate-700 bg-inherit border-b dark:border-gray-800 dark:shadow h-[80px] z-50`
        }`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
          <div className="w-full h-full flex items justify-between p-3">
            <div>
              <Link
                href={"/"}
                className="text-[25px] font-Poppins font-[500] dark:text-white light:text-black"
              >
                ULEARNOW
              </Link>
            </div>
            <div className="flex items-center">
              <NavItemsBar
                activeItem={activeItem}
                setOpenSideBar={setOpenSideBar}
                isMobile={false}
              />
              <ThemeSwitcher />
              {/* Only for mobile */}
              <div className="800px:hidden">
                <HiOutlineMenuAlt3
                  className="text-3xl cursor-pointer ml-3"
                  onClick={() => setOpenSideBar(!openSideBar)}
                />
              </div>
              <HiOutlineUserCircle
                className="text-3xl cursor-pointer ml-3"
                onClick={() => setOpen(!open)}
              />
            </div>
            {openSideBar && (
              <div className="800px:hidden absolute top-[80px] left-0  w-full h-screen">
                <NavItemsBar
                  activeItem={activeItem}
                  setOpenSideBar={setOpenSideBar}
                  isMobile={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
