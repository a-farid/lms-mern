import { Poppins, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./utils/theme-provider";
import { Header } from "./components/Header";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-Poppins",
});
const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-Josefin",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${josefin.variable} bg-gray-50 dark:bg-slate-800 bg-no-repeat dark:bg-gradient-to-b dark:from-gray-900 dark:to-dark-800 duration-300 dark:text-white text-black transition-colors `}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
