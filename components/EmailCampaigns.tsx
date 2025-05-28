'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplates } from "./EmailTemplates";
import { 
  Mail, 
  Send, 
  Edit, 
  Eye, 
  Play, 
  Pause, 
  BarChart, 
  CheckCircle,
  AlertTriangle,
  Plus,
  FileText
} from "lucide-react";

export const EmailCampaigns = () => {
  const { toast } = useToast();
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    content: ''
  });

  const campaigns = [
    {
      id: 1,
      name: "Northeast Union Outreach",
      subject: "Partnership Opportunity with LinkedUnion",
      status: "active",
      contacts: 156,
      sent: 89,
      opened: 34,
      replied: 8,
      created: "2024-01-13",
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      name: "West Coast Labor Initiative", 
      subject: "Connecting Labor Organizations Nationwide",
      status: "completed",
      contacts: 203,
      sent: 203,
      opened: 87,
      replied: 19,
      created: "2024-01-08",
      lastActivity: "5 days ago"
    },
    {
      id: 3,
      name: "Healthcare Union Network",
      subject: "Strengthening Healthcare Worker Advocacy",
      status: "draft",
      contacts: 78,
      sent: 0,
      opened: 0,
      replied: 0,
      created: "2024-01-15",
      lastActivity: "1 day ago"
    },
    {
      id: 4,
      name: "Manufacturing Union Connect",
      subject: "Building Stronger Manufacturing Communities",
      status: "paused",
      contacts: 134,
      sent: 45,
      opened: 12,
      replied: 2,
      created: "2024-01-10",
      lastActivity: "3 days ago"
    }
  ];

  const handleCreateCampaign = () => {
    if (!campaignData.name || !campaignData.subject || !campaignData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Campaign Created",
      description: `"${campaignData.name}" has been created successfully`,
    });

    setCampaignData({ name: '', subject: '', content: '' });
    setIsCreatingCampaign(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-orange-100 text-orange-700">Paused</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (showTemplates) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Email Templates</h3>
            <p className="text-sm text-slate-600">
              Pre-written templates for union outreach
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(false)}
          >
            Back to Campaigns
          </Button>
        </div>
        <EmailTemplates />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Email Campaigns</h3>
          <p className="text-sm text-slate-600">
            Create and manage targeted email outreach to union contacts
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(true)}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Email Templates</span>
          </Button>
          <Button 
            onClick={() => setIsCreatingCampaign(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Campaign Creation Modal */}
      {isCreatingCampaign && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Create New Campaign</span>
            </CardTitle>
            <CardDescription>
              Set up a new email outreach campaign for union contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Northeast Union Outreach"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="e.g., Partnership Opportunity"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-content">Email Content</Label>
              <Textarea
                id="email-content"
                placeholder="Write your email message here..."
                className="min-h-32"
                value={campaignData.content}
                onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateCampaign} className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Create Campaign</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreatingCampaign(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Emails Sent</p>
                <p className="text-2xl font-bold text-green-600">2,156</p>
              </div>
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Open Rate</p>
                <p className="text-2xl font-bold text-purple-600">24.3%</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Response Rate</p>
                <p className="text-2xl font-bold text-orange-600">18.2%</p>
              </div>
              <BarChart className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Active Campaigns</span>
          </CardTitle>
          <CardDescription>
            Manage your email outreach campaigns and track performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(campaign.status)}
                  <div>
                    <h4 className="font-medium text-slate-900">{campaign.name}</h4>
                    <p className="text-sm text-slate-600">{campaign.subject}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(campaign.status)}
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">{campaign.contacts}</div>
                  <div className="text-xs text-slate-600">Total Contacts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{campaign.sent}</div>
                  <div className="text-xs text-slate-600">Emails Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{campaign.opened}</div>
                  <div className="text-xs text-slate-600">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{campaign.replied}</div>
                  <div className="text-xs text-slate-600">Replied</div>
                </div>
              </div>

              {campaign.status === 'active' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Progress: {campaign.sent}/{campaign.contacts}</span>
                    <span>{Math.round((campaign.sent / campaign.contacts) * 100)}%</span>
                  </div>
                  <Progress value={(campaign.sent / campaign.contacts) * 100} className="h-2" />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Created {campaign.created} • Last activity {campaign.lastActivity}</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View Analytics
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    {campaign.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
