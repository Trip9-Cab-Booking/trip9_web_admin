"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSidebar } from "@/context/SidebarContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { UserData } from "@/store/authSlice";
import AccountMenu from "@/components/ProfileMenu";


const AppHeader: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<UserData>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(user){
        setCurrentUser(user);
    }
  }, []);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col justify-between lg:flex-row lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between w-full px-3 py-3 border-b border-gray-200 dark:border-gray-800 lg:py-4 lg:border-b-0 lg:px-0">
          {/* Sidebar Toggle */}
          <button
            onClick={handleToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:h-11 lg:w-11 lg:border dark:border-gray-800"
            aria-label="Toggle sidebar"
          >
            {isMobileOpen ? (
              // Close (X) icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.28a.75.75 0 011.06 0L12 11.94l4.72-4.72a.75.75 0 111.06 1.06L13.06 13l4.72 4.72a.75.75 0 01-1.06 1.06L12 14.06l-4.72 4.72a.75.75 0 11-1.06-1.06L10.94 13 6.22 8.28a.75.75 0 010-1.06z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.58 1c0-.41.34-.75.75-.75h13.33c.41 0 .75.34.75.75s-.34.75-.75.75H1.33a.75.75 0 01-.75-.75zM0.58 11c0-.41.34-.75.75-.75h13.33c.41 0 .75.34.75.75s-.34.75-.75.75H1.33a.75.75 0 01-.75-.75zM1.33 5.25a.75.75 0 000 1.5h6.67a.75.75 0 000-1.5H1.33z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Logo (mobile only) */}
          <Link href="/" className="lg:hidden">
            <Image
              src="/images/logo/logo.svg"
              alt="Logo"
              width={154}
              height={32}
              className="dark:hidden"
              priority
            />
            <Image
              src="/images/logo/logo-dark.svg"
              alt="Dark Logo"
              width={154}
              height={32}
              className="hidden dark:block"
              priority
            />
          </Link>

          {/* App Menu Toggle (mobile) */}
          <button
            onClick={toggleApplicationMenu}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle app menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm12 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
                fill="currentColor"
              />
            </svg>
          </button>

        </div>

        {/* Right Section */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } lg:flex items-center justify-between w-full gap-4 px-5 py-4 lg:justify-end lg:px-0`}
        >
          <div className="flex items-center">
            <ThemeToggleButton />
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
