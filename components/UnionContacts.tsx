'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react";

export const UnionContacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const contacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "President",
      union: "SEIU Local 1199",
      email: "msalmanali7890@gmail.com",
      phone: "(555) 123-4567",
      location: "New York, NY",
      verified: true,
      score: 95,
      source: "seiu1199.org",
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Secretary-Treasurer",
      union: "Teamsters Local 804",
      email: "muhammadattir30@gmail.com",
      phone: "(555) 234-5678",
      location: "Brooklyn, NY",
      verified: true,
      score: 92,
      source: "teamsters.org",
      lastUpdated: "2024-01-14"
    },
  ];

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleStartCampaign = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Filter the full contact list to get the details of selected contacts
    const contactsToSend = contacts.filter(contact => selectedContacts.includes(contact.id));

    // Replace with your actual n8n webhook URL
    const n8nWebhookUrl = 'https://ibrahim77.app.n8n.cloud/workflow/dKC9cNcYxNRiDetL'; 

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: contactsToSend }), // Send the selected contacts data
      });

      if (response.ok) {
        setSuccessMessage('Campaign started successfully!');
        setSelectedContacts([]); // Clear selection after starting campaign
      } else {
        const errorData = await response.json();
        setError(`Failed to start campaign: ${errorData.message || response.statusText}`);
      }
    } catch (err: unknown) {
      setError(`Network error or problem sending data: ${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Union Contacts Database</h3>
          <p className="text-sm text-slate-600">
            {contacts.length} verified union contacts ready for outreach
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Contacts</p>
                <p className="text-2xl font-bold text-slate-900">3,891</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">3,247</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Quality</p>
                <p className="text-2xl font-bold text-purple-600">2,156</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Selected</p>
                <p className="text-2xl font-bold text-orange-600">{selectedContacts.length}</p>
              </div>
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Contact Directory</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedContacts.length === contacts.length && contacts.length > 0}
                onCheckedChange={handleSelectAll}
                disabled={contacts.length === 0}
              />
              <span className="text-sm text-slate-600">Select All</span>
            </div>
          </div>
          <CardDescription>
            Discovered and verified union contacts with quality scores
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => handleSelectContact(contact.id)}
                  className="mr-4"
                />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{contact.name}</div>
                        <div className="text-sm text-slate-600">{contact.role}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm text-slate-900">{contact.union}</div>
                    <div className="text-xs text-slate-600">{contact.source}</div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-1 text-sm text-slate-600 mb-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-slate-600">
                      <Phone className="w-3 h-3" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-1 text-sm text-slate-600">
                      <MapPin className="w-3 h-3" />
                      <span>{contact.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {contact.verified ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">
                        Score: {contact.score}
                      </div>
                      <div className="text-xs text-slate-600">
                        Updated {contact.lastUpdated}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedContacts.length} contacts selected
                </p>
                <p className="text-sm text-blue-600">
                  Choose an action to perform on selected contacts
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleStartCampaign}
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? 'Starting...' : 'Start Campaign'}
                </Button>
                <Button variant="outline" size="sm">
                  Verify Contacts
                </Button>
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
};