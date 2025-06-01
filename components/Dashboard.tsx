'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Users,
  Mail,
  Clock,
  TrendingUp,
  ArrowRight,
  Database,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";

interface DashboardStats {
  totalUnions: number;
  totalLeads: number;
  syncedLeads: number;
  totalSearches: number;
  unionsGrowth: number;
  leadsGrowth: number;
  syncRate: number;
  zohoConnected: boolean;
  zohoTotalLeads: number;
  recentActivity: Array<{
    action: string;
    target: string;
    status: string;
    time: string;
    id: string;
  }>;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleZohoConnect = () => {
    window.open('/api/zoho/initiate-auth', '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-slate-700">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Dashboard</h3>
          <p className="text-slate-600 mt-1">{error}</p>
          <Button onClick={fetchDashboardStats} className="mt-4">
            <ArrowRight className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const dashboardStats = [
    {
      title: "Total Unions",
      value: stats.totalUnions.toLocaleString(),
      change: `+${stats.unionsGrowth}%`,
      icon: Users,
      color: "blue"
    },
    {
      title: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      change: `+${stats.leadsGrowth}%`,
      icon: Database,
      color: "green"
    },
    {
      title: "Synced to Zoho",
      value: stats.syncedLeads.toLocaleString(),
      change: `${stats.syncRate}% sync rate`,
      icon: RefreshCw,
      color: "purple"
    },
    {
      title: "Website Searches",
      value: stats.totalSearches.toLocaleString(),
      change: "Total searches",
      icon: Globe,
      color: "orange"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Zoho Connection Status */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${stats.zohoConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Zoho CRM {stats.zohoConnected ? 'Connected' : 'Not Connected'}
            </h3>
            <p className="text-sm text-slate-600">
              {stats.zohoConnected 
                ? `${stats.syncedLeads.toLocaleString()} leads in Zoho CRM`
                : 'Connect to sync leads with Zoho CRM'
              }
            </p>
          </div>
        </div>
        {!stats.zohoConnected && (
          <Button onClick={handleZohoConnect} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Connect to Zoho</span>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-slate-600 mt-1">
                {stat.title === "Synced to Zoho" ? (
                  <span>{stat.change}</span>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">{stat.change}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest leads and sync activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-sm text-slate-900">
                        {activity.action}
                      </div>
                      <div className="text-xs text-slate-600">
                        {activity.target} • {activity.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={activity.status === 'completed' ? 'default' :
                        activity.status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No recent activity found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5" />
              <span>Sync Performance</span>
            </CardTitle>
            <CardDescription>
              Lead synchronization with Zoho CRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Leads Synced</div>
                  <div className="text-xs text-slate-600">
                    {stats.syncedLeads} of {stats.totalLeads} total leads
                  </div>
                </div>
                <Badge className={`${
                  stats.syncRate > 80 ? 'bg-green-100 text-green-700' :
                  stats.syncRate > 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {stats.syncRate}%
                </Badge>
              </div>
              <Progress value={stats.syncRate} className="h-2" />
            </div>

            {stats.zohoConnected && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">Zoho CRM Integration</div>
                    <div className="text-xs text-slate-600">
                      {stats.zohoTotalLeads} leads in Zoho CRM
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
              </div>
            )}

            <Button className="w-full mt-4" variant="outline" onClick={() => window.location.href = '/unions'}>
              View All Unions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Start new automation workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="flex items-center space-x-2 h-12"
              onClick={() => window.location.href = '/scraper'}
            >
              <Globe className="w-5 h-5" />
              <span>Search New Unions</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 h-12"
              onClick={() => window.location.href = '/unions'}
            >
              <Users className="w-5 h-5" />
              <span>View All Unions</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 h-12"
              onClick={handleZohoConnect}
              disabled={stats.zohoConnected}
            >
              <Mail className="w-5 h-5" />
              <span>{stats.zohoConnected ? 'Zoho Connected' : 'Connect Zoho'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};