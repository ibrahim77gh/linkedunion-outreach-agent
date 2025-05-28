'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Mail, Users, Search, TrendingUp } from "lucide-react";
import { WebScraper } from "@/components/WebScraper";
import { UnionContacts } from "@/components/UnionContacts";
import { EmailCampaigns } from "@/components/EmailCampaigns";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">LinkedUnion</h1>
              <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                Last sync: <span className="font-medium">2 min ago</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Union Lead Generation Hub
          </h2>
          <p className="text-slate-600 max-w-2xl">
            Automate your union outreach with AI-powered website scraping, contact verification, 
            and targeted email campaigns. Find, verify, and engage union contacts at scale.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="scraper"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Globe className="w-4 h-4" />
              <span>Web Scraper</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contacts"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Search className="w-4 h-4" />
              <span>Union Contacts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Mail className="w-4 h-4" />
              <span>Email Campaigns</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="scraper" className="space-y-6">
            <WebScraper />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <UnionContacts />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <EmailCampaigns />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
