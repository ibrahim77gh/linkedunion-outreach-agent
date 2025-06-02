'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Search, Mail, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import clsx from 'clsx';  

export const MainNav = () => {
  const pathname = usePathname(); // Get the current path to highlight active tab

  return (
    <>
      {/* Header */}
      <header className="bg-[#1A66B0] border-b border-slate-200 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
               
              <img src="https://linkedunion.com/_next/image?url=%2Fimages%2Flogo%2Flogo.webp&w=3840&q=75" className="h-[30px] w-[100%]" alt="" />
              
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white">
                Last sync: <span className="font-medium">2 min ago</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Header and Description (also part of the client component now for simplicity) */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            LinkedUnion Outreach Agent
          </h2>
          <p className="text-slate-600 max-w-2xl">
            Automate your union outreach with AI-powered website scraping, contact verification,
            and targeted email campaigns. Find, verify, and engage union contacts at scale.
          </p>
        </div>

        {/* Tabs for Navigation */}
        {/* The 'value' prop for Tabs needs to be consistent with the current path */}
        <Tabs value={pathname === '/' ? 'dashboard' : pathname.substring(1)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <Link href="/" passHref legacyBehavior>
              <TabsTrigger
                value="dashboard"
                className={clsx(
                  "flex items-center space-x-2",
                  pathname === "/" && "bg-blue-50 text-blue-700"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard</span>
              </TabsTrigger>
            </Link>
            <Link href="/scraper" passHref legacyBehavior>
              <TabsTrigger
                value="scraper"
                className={clsx(
                  "flex items-center space-x-2",
                  pathname.startsWith("/scraper") && "bg-blue-50 text-blue-700"
                )}
              >
                <Globe className="w-4 h-4" />
                <span>Web Scraper</span>
              </TabsTrigger>
            </Link>
            <Link href="/unions" passHref legacyBehavior>
              <TabsTrigger
                value="unions"
                className={clsx(
                  "flex items-center space-x-2",
                  pathname.startsWith("/unions") && "bg-blue-50 text-blue-700"
                )}
              >
                <Search className="w-4 h-4" />
                <span>Union Contacts</span>
              </TabsTrigger>
            </Link>
            <Link href="/reports" passHref legacyBehavior>
              <TabsTrigger
                value="reports"
                className={clsx(
                  "flex items-center space-x-2",
                  pathname.startsWith("/reports") && "bg-blue-50 text-blue-700"
                )}
              >
                <Mail className="w-4 h-4" />
                <span>Union Report</span>
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
    </>
  );
};