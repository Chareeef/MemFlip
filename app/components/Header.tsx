"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiHome, FiMenu, FiPlus, FiX } from "react-icons/fi";

const signedInLinks = [
  { href: "/home", label: "Library", icon: FiHome },
  { href: "/generate_flashcards", label: "Create", icon: FiPlus },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isNoAuthPage =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const linkClass = (href: string) => {
    const active =
      pathname === href || (href === "/home" && pathname.startsWith("/decks/"));
    return `inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-sm font-semibold transition-colors duration-150 ${
      active
        ? "bg-brand-50 text-brand-800"
        : "text-ink-700 hover:bg-surface-subtle hover:text-ink-900"
    }`;
  };

  const mobileMenuButton = (
    <button
      type="button"
      className="icon-button"
      aria-expanded={mobileOpen}
      aria-controls="mobile-navigation"
      aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
      onClick={() => setMobileOpen((open) => !open)}
    >
      {mobileOpen ? (
        <FiX className="size-5" aria-hidden="true" />
      ) : (
        <FiMenu className="size-5" aria-hidden="true" />
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-control"
          aria-label="MemFlip home"
        >
          <Image
            src="/icons/icon.png"
            alt=""
            width={44}
            height={44}
            priority
            className="size-10 rounded-[0.65rem] shadow-soft transition-transform duration-150 ease-product group-active:translate-y-px"
          />
          <span className="min-w-0">
            <span className="block text-[1.05rem] font-extrabold leading-5 tracking-[-0.025em] text-ink-900">
              MemFlip
            </span>
            <span className="hidden text-xs leading-4 text-ink-500 md:block">
              Learn with clarity
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <SignedIn>
            <nav className="flex items-center gap-1" aria-label="Main navigation">
              {signedInLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkClass(link.href)}
                    aria-current={
                      pathname === link.href ||
                      (link.href === "/home" &&
                        pathname.startsWith("/decks/"))
                        ? "page"
                        : undefined
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-2 flex min-h-10 items-center border-l border-[var(--border)] pl-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            {isNoAuthPage && (
              <>
                <Link
                  href="/sign-in"
                  className="inline-flex min-h-10 items-center rounded-control px-3 text-sm font-semibold text-ink-700 hover:bg-surface-subtle"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex min-h-10 items-center rounded-control bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Get started
                </Link>
              </>
            )}
          </SignedOut>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          {isNoAuthPage ? (
            mobileMenuButton
          ) : (
            <SignedIn>{mobileMenuButton}</SignedIn>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[var(--border)] bg-white px-4 py-3 shadow-soft sm:hidden"
        >
          <SignedIn>
            <nav
              className="grid gap-1"
              aria-label="Mobile main navigation"
            >
              {signedInLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkClass(link.href)}
                    aria-current={
                      pathname === link.href ||
                      (link.href === "/home" &&
                        pathname.startsWith("/decks/"))
                        ? "page"
                        : undefined
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </SignedIn>
          <SignedOut>
            {isNoAuthPage && (
              <nav className="grid gap-2" aria-label="Account navigation">
                <Link href="/sign-in" className={linkClass("/sign-in")}>
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex min-h-11 items-center justify-center rounded-control bg-brand-600 px-4 text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </nav>
            )}
          </SignedOut>
        </div>
      )}
    </header>
  );
}
