"use client";
import { useEffect, useState } from "react";
import { BiLoader } from "react-icons/bi";
import { FaExclamationTriangle, FaCheck } from "react-icons/fa";

export default function Alert({
  message,
  openAlert,
  type,
}: {
  message: string;
  openAlert: boolean;
  type: string;
}) {
  const [alertColor, setAlertColor] = useState("");

  useEffect(() => {
    switch (type) {
      case "error":
        setAlertColor("red");
        break;
      case "success":
        setAlertColor("green");
        break;
      case "loading":
        setAlertColor("blue");
        break;
      default:
        break;
    }
  }, [type]);
  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]
        ${openAlert ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}
        transition-all duration-300 ease-in-out
        bg-white border-t-4 md:border-l-4 md:border-t-0 border-indigo-200 p-4
        flex items-center flex-col md:flex-row gap-x-4 gap-y-2 text-center md:text-left rounded-md shadow-lg
        max-w-2xl min-w-base  mx-auto
      `}
    >
      {type === "success" && <FaCheck className="w-6 h-6 text-green-500" />}
      {type === "error" && (
        <FaExclamationTriangle className="w-6 h-6 text-red-500" />
      )}
      {type === "loading" && <BiLoader className="w-6 h-6 animate-spin" />}
      <div className={`flex-1 text-lg font-medium text-${alertColor}-500`}>
        {message}
      </div>
    </div>
  );
}
