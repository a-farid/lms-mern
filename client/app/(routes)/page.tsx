import Image from "next/image";
import { FC } from "react";

interface Props {}
const Page: FC<Props> = (props) => {
  return (
    <div className="grid w-full md:grid-cols-2 mt-11">
      <Image
        className="border rounded-full w-[80%] p-5 mx-auto md:h-[400px]"
        src="/assets/hero.png"
        alt="ULEARNOW"
        width={200}
        height={200}
      />
      <div className="flex items-center justify-center flex-col text-justify md:h-[400px] md:p-3">
        <h1 className="text-2xl font-bold text-justify ">
          Learning with new way and improve your online Learning Experience
          better
        </h1>
        <h3 className="text-xs text-gray-600  dark:text-gray-300 mt-4">
          We have a lot of online courses with the best learning addicted
          students, start learning with us now
        </h3>
        <div className="w-full flex items-center justify-center gap-2 mt-8">
          <input
            type="text"
            placeholder="Search for courses"
            className="p-2 w-full h-full rounded-md focus:bg-blue-100 focus:border focus:border-blue-600"
          />
          <button className="bg-blue-600 text-white p-2 rounded-md">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
