'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Copy, 
  Edit, 
  Users,
  Building,
  HandHeart,
  Briefcase
} from "lucide-react";
import { useState } from "react";

export const EmailTemplates = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");

  const templates = [
    {
      id: 1,
      name: "Partnership Introduction",
      category: "introduction",
      subject: "Partnership Opportunity: Strengthening Union Connections Nationwide",
      content: `Dear [Union Name] Leadership,

I hope this message finds you well. My name is [Your Name], and I'm reaching out from LinkedUnion, a specialized platform dedicated to connecting and strengthening labor organizations across the United States.

We've developed an innovative solution that helps unions like yours:
• Build stronger networks with other labor organizations
• Access verified contact information for union partnerships
• Streamline outreach and communication efforts
• Share resources and best practices with the broader labor community

LinkedUnion serves as a bridge between unions, facilitating collaboration and mutual support in advancing workers' rights and interests. We believe that stronger connections between unions lead to more effective advocacy and better outcomes for working families.

I'd love to schedule a brief 15-minute call to discuss how LinkedUnion could benefit [Union Name] and explore potential partnership opportunities.

Would you be available for a quick conversation this week or next?

Best regards,
[Your Name]
[Your Title]
LinkedUnion
[Your Phone]
[Your Email]

P.S. Feel free to visit our platform to learn more about how we're helping unions nationwide strengthen their networks.`,
      icon: <HandHeart className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: 2,
      name: "Service Overview",
      category: "services",
      subject: "Expand Your Union Network with LinkedUnion's AI-Powered Platform",
      content: `Hello [Contact Name],

As a leader at [Union Name], you understand the importance of building strong relationships within the labor movement. That's exactly why we created LinkedUnion.

LinkedUnion is an AI-powered platform specifically designed for union leaders like yourself to:

🔍 DISCOVER: Find and connect with unions across different industries and regions
📋 ORGANIZE: Access comprehensive contact databases of verified union information  
📧 OUTREACH: Launch targeted communication campaigns to build partnerships
📊 TRACK: Monitor engagement and build meaningful relationships over time

Our technology automates the time-consuming process of finding and verifying union contacts, allowing you to focus on what matters most - building relationships and advancing your members' interests.

Many unions are already using LinkedUnion to:
- Coordinate multi-union initiatives
- Share successful organizing strategies
- Build coalitions for legislative advocacy
- Exchange resources and best practices

I'd be happy to provide a personalized demo showing exactly how LinkedUnion can help [Union Name] expand its network and impact.

Are you available for a 20-minute demonstration this week?

Solidarity,
[Your Name]
LinkedUnion Team
[Your Contact Information]`,
      icon: <Briefcase className="w-5 h-5" />,
      color: "bg-green-100 text-green-700"
    },
    {
      id: 3,
      name: "Follow-up Message",
      category: "follow-up",
      subject: "Following Up: LinkedUnion Partnership Opportunity",
      content: `Hi [Contact Name],

I wanted to follow up on my previous message about LinkedUnion and how we can help [Union Name] strengthen its connections within the labor movement.

I understand you're busy advocating for your members, and I don't want to take much of your time. However, I thought you might be interested to know that unions using LinkedUnion have reported:

✓ 40% increase in successful inter-union partnerships
✓ 60% reduction in time spent on outreach coordination  
✓ Access to a network of 500+ verified union contacts
✓ Improved collaboration on legislative initiatives

If now isn't the right time, I completely understand. However, if you'd like to see how LinkedUnion could benefit [Union Name], I'm happy to send over some case studies or schedule a brief 10-minute call at your convenience.

Just reply with "YES" and I'll send you more information, or "CALL" if you'd prefer to chat directly.

Thank you for all you do for working families.

Best,
[Your Name]
LinkedUnion
[Your Contact Information]`,
      icon: <Mail className="w-5 h-5" />,
      color: "bg-orange-100 text-orange-700"
    },
    {
      id: 4,
      name: "Coalition Building",
      category: "collaboration",
      subject: "Building Stronger Labor Coalitions with [Union Name]",
      content: `Dear [Union Name] Team,

In today's challenging environment, the strength of the labor movement depends more than ever on our ability to work together across industries and regions.

That's why I'm reaching out about LinkedUnion - a platform designed specifically to help unions like yours build powerful coalitions and partnerships.

Whether you're organizing around:
• Legislative advocacy at state and federal levels
• Industry-wide bargaining initiatives  
• Community outreach and public support
• Shared training and development programs

LinkedUnion provides the tools and network to connect with the right union partners quickly and effectively.

Recent success stories include:
- A coalition of 12 unions coordinating healthcare advocacy
- Cross-industry partnerships for wage equity campaigns
- Resource sharing networks that reduced training costs by 30%

[Union Name]'s expertise in [specific area] would be incredibly valuable to the broader LinkedUnion community, and I believe you'd benefit greatly from connections with unions facing similar challenges.

Would you be interested in learning more about how LinkedUnion facilitates these types of partnerships?

I'm available for a brief conversation at your convenience.

In solidarity,
[Your Name]
LinkedUnion Partnership Team
[Your Contact Information]`,
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-700"
    }
  ];

  const handleCopyTemplate = (template: typeof templates[0]) => {
    const fullTemplate = `Subject: ${template.subject}\n\n${template.content}`;
    navigator.clipboard.writeText(fullTemplate);
    toast({
      title: "Template Copied",
      description: "Email template has been copied to your clipboard",
    });
  };

  const handleCustomize = (template: typeof templates[0]) => {
    setCustomSubject(template.subject);
    setCustomContent(template.content);
    setSelectedTemplate(template.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Email Templates</h3>
        <p className="text-sm text-slate-600">
          Pre-written templates for reaching out to unions about LinkedUnion services
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {template.icon}
                  <span className="text-base">{template.name}</span>
                </div>
                <Badge className={template.color}>{template.category}</Badge>
              </CardTitle>
              <CardDescription className="font-medium">
                {template.subject}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-md max-h-48 overflow-y-auto">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {template.content.substring(0, 300)}...
                </pre>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCopyTemplate(template)}
                  className="flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCustomize(template)}
                  className="flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Customize</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Template Editor */}
      {selectedTemplate > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Customize Template</span>
            </CardTitle>
            <CardDescription>
              Edit the template to match your specific outreach needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-subject">Email Subject</Label>
              <Input
                id="custom-subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-content">Email Content</Label>
              <Textarea
                id="custom-content"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Enter email content"
                className="min-h-64"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  const fullTemplate = `Subject: ${customSubject}\n\n${customContent}`;
                  navigator.clipboard.writeText(fullTemplate);
                  toast({
                    title: "Custom Template Copied",
                    description: "Your customized template has been copied to clipboard",
                  });
                }}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Custom Template</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedTemplate(0)}
              >
                Close Editor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Template Usage Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Personalization</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Replace [Union Name] with the actual union name</li>
                <li>• Use [Contact Name] for personalized greetings</li>
                <li>• Add specific details about their work/industry</li>
                <li>• Reference recent union achievements or news</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Best Practices</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Keep initial emails concise and focused</li>
                <li>• Include clear call-to-action</li>
                <li>• Follow up within 1-2 weeks</li>
                <li>• Respect their time and mission</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
