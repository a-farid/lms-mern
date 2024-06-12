"use client";
import { BiMoon, BiSun } from "react-icons/bi";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

type Props = {};
export const ThemeSwitcher = ({}: Props) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="hover:bg-blue cursor-pointer">
      {theme === "light" ? (
        <BiSun size={24} fill="black" onClick={() => setTheme("dark")} />
      ) : (
        <BiMoon size={24} onClick={() => setTheme("light")} />
      )}
    </div>
  );
};
