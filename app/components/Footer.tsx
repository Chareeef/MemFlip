import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-ink-500 sm:flex-row sm:px-8">
        <p>
          <span className="font-semibold text-ink-700">MemFlip</span>
          <span aria-hidden="true"> · </span>
          Built for focused learning
        </p>
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden sm:inline">
            © {new Date().getFullYear()} Youssef Charif Hamidi
          </span>
          <Link
            href="https://github.com/Chareeef"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button !size-10"
            aria-label="Youssef Charif Hamidi on GitHub (opens in a new tab)"
          >
            <FaGithub className="size-[1.1rem]" aria-hidden="true" />
          </Link>
          <Link
            href="https://linkedin.com/in/youssef-charif-hamidi"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button !size-10"
            aria-label="Youssef Charif Hamidi on LinkedIn (opens in a new tab)"
          >
            <FaLinkedin className="size-[1.1rem]" aria-hidden="true" />
          </Link>
          <Link
            href="https://x.com/YoussefCharifH2"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button !size-10 text-base font-bold"
            aria-label="Youssef Charif Hamidi on X (opens in a new tab)"
          >
            <span aria-hidden="true">𝕏</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
