import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full text-white bg-indigo-600 shadow-md">
      <div className="px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between py-4 sm:flex-row gap-4 sm:gap-0">
          <Link
            href="/"
            className="flex flex-col items-center text-lg md:flex-row gap-2"
          >
            <Image
              src="/icons/icon.png"
              alt="MemFlip Logo"
              width={590}
              height={590}
              className="rounded-lg size-[3rem] shadow-sm"
            />
            <div className="flex flex-col justify-center text-center md:text-left">
              <h1 className="text-xl font-bold">MemFlip</h1>
              <p className="hidden text-xs italic sm:text-sm md:text-base sm:block">
                Generate your flashcards in a snap!
              </p>
            </div>
          </Link>
          <nav className="flex items-center text-sm space-x-4 md:text-base">
            <SignedOut>
              <Link
                href="/sign-in"
                className="p-2 hover:text-indigo-200 transition duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="p-2 text-indigo-600 bg-white rounded-md hover:bg-indigo-100 transition duration-300"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/home"
                className="hover:text-indigo-200 transition duration-300"
              >
                Home
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
}
