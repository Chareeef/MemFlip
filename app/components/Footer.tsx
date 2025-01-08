import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="py-4 text-white bg-indigo-800">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h3 className="text-xl font-bold">Youssef Charif Hamidi</h3>
          <div className="flex items-center space-x-6">
            <Link
              href="https://github.com/Chareeef"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-300 transition duration-300"
            >
              <FaGithub className="text-2xl font-bold" />
            </Link>
            <Link
              href="https://linkedin.com/in/youssef-charif-hamidi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-300 transition duration-300"
            >
              <FaLinkedin className="text-2xl font-bold" />
            </Link>
            <Link
              href="https://x.com/YoussefCharifH2"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-300 transition duration-300"
            >
              <span className="text-2xl font-bold">𝕏</span>
            </Link>
          </div>
          <p className="text-base font-semibold">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
