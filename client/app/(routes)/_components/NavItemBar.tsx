"use client";
import Link from "next/link";
import { navbar_list } from "../../utils/constants/nav-list";

type Props = {
  activeItem: number;
  isMobile: boolean;
  setOpenSideBar: (open: boolean) => void;
};
export const NavItemsBar = ({
  activeItem,
  isMobile,
  setOpenSideBar,
}: Props) => {
  return (
    <>
      {isMobile ? (
        <div className="800px:hidden mt-5 bg-gray-50 dark:bg-slate-800 h-screen">
          <div className="w-full py-6 text-center flex items-center flex-col gap-6">
            {navbar_list.map((item, index) => (
              <Link href={item.link} passHref key={index}>
                <span
                  onClick={() => setOpenSideBar(false)}
                  className={`${
                    activeItem === index
                      ? "text-[crimson] dark:text-[#37a39a]"
                      : "text-black dark:text-white"
                  } font-Poppins px-6 font-[400] text-[18px] mt-4`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
          <br />
          <br />
          <p className="text-center text-gray-500">
            Copyright (c) ULEARNOW 2024
          </p>
        </div>
      ) : (
        <div className="hidden 800px:flex">
          {navbar_list.map((item, index) => (
            <Link href={item.link} key={index}>
              <span
                className={`${
                  activeItem === index
                    ? "text-[crimson] dark:text-[#37a39a]"
                    : "text-black dark:text-white"
                } font-Poppins px-6 font-[400] text-[18px] mx-3`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
