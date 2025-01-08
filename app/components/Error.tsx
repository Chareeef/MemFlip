import { FaExclamationTriangle } from "react-icons/fa";

export default function ErrorAlert({
  error,
  openError,
}: {
  error: string;
  openError: boolean;
}) {
  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        ${openError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}
        transition-all duration-300 ease-in-out
        bg-red-50 border-t-4 md:border-l-4 md:border-t-0 border-red-500 p-4
        flex items-center flex-col md:flex-row gap-x-4 gap-y-2 text-center md:text-left rounded-md shadow-lg
        max-w-2xl min-w-base  mx-auto
      `}
    >
      <FaExclamationTriangle className="w-6 h-6 text-red-500" />
      <div className="flex-1 text-red-700">{error}</div>
    </div>
  );
}
