"use client";

import { BiLoaderAlt } from "react-icons/bi";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";

export type AlertType = "error" | "success" | "loading" | "info" | "";

const styles: Record<Exclude<AlertType, "">, string> = {
  success: "border-emerald-200 text-emerald-900",
  error: "border-red-200 text-red-900",
  loading: "border-brand-200 text-brand-900",
  info: "border-blue-200 text-blue-900",
};

export default function Alert({
  message,
  openAlert,
  type,
}: {
  message: string;
  openAlert: boolean;
  type: AlertType | string;
}) {
  const safeType: Exclude<AlertType, ""> =
    type === "success" ||
    type === "error" ||
    type === "loading" ||
    type === "info"
      ? type
      : "info";

  const icon = {
    success: <FiCheckCircle className="size-5 text-emerald-600" />,
    error: <FiAlertCircle className="size-5 text-red-600" />,
    loading: <BiLoaderAlt className="size-5 animate-spin text-brand-600" />,
    info: <FiInfo className="size-5 text-blue-600" />,
  }[safeType];

  return (
    <div
      role={safeType === "error" ? "alert" : "status"}
      aria-live={safeType === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={`fixed left-1/2 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-card border bg-white px-4 py-3 shadow-floating transition-[opacity,transform] duration-200 ease-emphasized ${styles[safeType]} ${
        openAlert
          ? "toast-enter pointer-events-auto opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <p className="text-sm font-semibold leading-6">{message}</p>
    </div>
  );
}
