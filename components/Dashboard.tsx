
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
  ArrowRight 
} from "lucide-react";

export const Dashboard = () => {
  const stats = [
    {
      title: "Websites Scraped",
      value: "1,247",
      change: "+12%",
      icon: Globe,
      color: "blue"
    },
    {
      title: "Union Contacts Found",
      value: "3,891",
      change: "+8%",
      icon: Users,
      color: "green"
    },
    {
      title: "Emails Sent",
      value: "2,156",
      change: "+24%",
      icon: Mail,
      color: "purple"
    },
    {
      title: "Response Rate",
      value: "18.2%",
      change: "+3%",
      icon: TrendingUp,
      color: "orange"
    }
  ];

  const recentActivity = [
    {
      action: "Website scraped",
      target: "teamsters.org",
      status: "completed",
      time: "2 min ago",
      contacts: 47
    },
    {
      action: "Email campaign",
      target: "Northeast Union Outreach",
      status: "in-progress",
      time: "5 min ago",
      contacts: 156
    },
    {
      action: "Contact verification",
      target: "SEIU Local 1199",
      status: "completed",
      time: "12 min ago",
      contacts: 23
    },
    {
      action: "Website scraped",
      target: "afscme.org",
      status: "failed",
      time: "18 min ago",
      contacts: 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change} from last month</span>
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
              Latest scraping and campaign activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 
                    activity.status === 'in-progress' ? 'bg-blue-500' : 'bg-red-500'
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
                            activity.status === 'in-progress' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                  {activity.contacts > 0 && (
                    <div className="text-xs text-slate-600 mt-1">
                      {activity.contacts} contacts
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Campaign Performance</span>
            </CardTitle>
            <CardDescription>
              Active email campaigns and their metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Northeast Union Outreach</div>
                  <div className="text-xs text-slate-600">156 contacts • Started 2 days ago</div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Active</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Sent: 89/156</span>
                  <span>57%</span>
                </div>
                <Progress value={57} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">West Coast Labor Initiative</div>
                  <div className="text-xs text-slate-600">203 contacts • Completed 1 week ago</div>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Response Rate: 18.2%</span>
                  <span className="text-green-600">+3% above avg</span>
                </div>
                <Progress value={18} className="h-2" />
              </div>
            </div>

            <Button className="w-full mt-4" variant="outline">
              View All Campaigns
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
            <Button className="flex items-center space-x-2 h-12">
              <Globe className="w-5 h-5" />
              <span>Scrape New Website</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 h-12">
              <Users className="w-5 h-5" />
              <span>Verify Contacts</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 h-12">
              <Mail className="w-5 h-5" />
              <span>Create Campaign</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
