"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  Drive,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon
} from "../icons/index";
import SidebarWidget from "./SidebarFooter";
import { Ambulance } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/" },
  { icon: <UserCircleIcon />, name: "Users", path: "/users" },
  { icon: <Drive />, name: "Drivers", path: "/drivers" },
  { icon: <Ambulance />, name: "Ride Management", path: "/ride-management" },
  // { icon: <BadgeIndianRupee />, name: "Payment Management", path: "/payment-management",  subItems: [
  //   { name: "Wallet Management", path: "/payment-management/wallet-management" },
  //     { name: "Refund Management", path: "/payment-management/refund-management" },
  //     { name: "Subscription Management", path: "/payment-management/subscription-management" },
  //   ] },
    //  { icon: <Award />, name: "Pricing Control", path: "/pricing-control" },
  // { icon: <FolderGit2 />, name: "Analytics & Reports", path: "/AnalyticsReports" },
  // { icon: <MessageCircle />, name: "Chatbot", path: "/Socket" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  // const router = useRouter();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
  <ul className="flex flex-col gap-4">
    {navItems.map((nav, index) => {
      const submenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
      return (
        <li key={nav.name} className="w-full">
          {nav.subItems ? (
            <>
            <div
              className={`menu-item group w-full flex items-center gap-3 py-2 px-3 rounded-md transition-colors duration-150
                ${submenuOpen ? "menu-item-active" : "menu-item-inactive"}
                ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              // keep keyboard accessibility but avoid nested interactive elements
              role="group"
            >
              <span
                className={`flex-shrink-0 ${submenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
                aria-hidden
              >
                {nav.icon}
              </span>

              {/* NAV LABEL: use Link so clicking label navigates */}
              {(isExpanded || isHovered || isMobileOpen) ? (
                <Link
                  href={nav.path ?? "#"}
                  onClick={() => setOpenSubmenu(null)}
                  className="menu-item-text text-sm md:text-base font-medium flex-1"
                >
                  {nav.name}
                </Link>
              ) : (
                // collapsed state: still show tooltip or accessible label
                <span className="menu-item-text text-sm md:text-base font-medium">{nav.name}</span>
              )}

              {/* Chevron: toggles submenu only (stop propagation) */}
              {(isExpanded || isHovered || isMobileOpen) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmenuToggle(index, menuType);
                  }}
                  aria-expanded={submenuOpen}
                  aria-label={`${submenuOpen ? "Collapse" : "Expand"} ${nav.name}`}
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${submenuOpen ? "rotate-180 text-brand-500" : ""}`}
                >
                  <ChevronDownIcon />
                </button>
              )}
            </div>

            {/* Submenu */}
            <div
              className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out
                ${submenuOpen ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
            >
              <ul className={`flex flex-col gap-1 pl-8 ${!isExpanded && !isHovered ? "pl-0" : ""}`}>
                {nav.subItems.map((sub) => {
                  const childActive = isActive(sub.path);
                  return (
                    <li key={sub.name}>
                      <Link
                        href={sub.path}
                        onClick={() => setOpenSubmenu(null)}
                        className={`block w-full text-sm py-2 px-3 rounded-md transition-colors duration-150
                          ${childActive ? "menu-item-active" : "menu-item-inactive"}`}
                      >
                        <span className="inline-block align-middle">{sub.name}</span>
                        {sub.pro && <span className="ml-2 text-xs uppercase">PRO</span>}
                        {sub.new && <span className="ml-2 text-xs uppercase">NEW</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            </>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`w-full flex items-center gap-3 py-2 px-3 rounded-md transition-colors duration-150 ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                onClick={() => {
                  setOpenSubmenu(null);
                }}
              >
                <span
                  className={`flex-shrink-0 ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
                  aria-hidden
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text text-sm md:text-base font-medium">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      );
    })}
  </ul>
);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden w-auto h-auto"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
                priority
                style={{ height: "auto" }}
              />
              <Image
                className="hidden dark:block w-auto h-auto"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
                priority
                style={{ height: "auto" }}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
              priority
              className="w-auto h-auto"
              style={{ height: "auto" }}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>

              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>

        {(isExpanded || isHovered || isMobileOpen) && (
  <div className="mt-auto bg-transparent dark:bg-transparent">
    <SidebarWidget />
  </div>
)}
      </div>
    </aside>
  );
};

export default AppSidebar;
