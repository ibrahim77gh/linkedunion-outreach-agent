
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Globe, Users, Plus } from "lucide-react";
import { UnionInfo } from "@/services/googleSearch";

interface UnionSearchResultsProps {
  unionInfo: UnionInfo | null;
  isLoading: boolean;
}

export const UnionSearchResults = ({ unionInfo, isLoading }: UnionSearchResultsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 animate-spin" />
            <span>Searching for Union Information...</span>
          </CardTitle>
          <CardDescription>
            Extracting contact details from Google Search and Google Maps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!unionInfo) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{unionInfo.name}</span>
          </div>
          <Badge className="bg-green-100 text-green-700">Found</Badge>
        </CardTitle>
        <CardDescription>
          Union information extracted from Google Search and Maps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{unionInfo.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-slate-500 mt-1" />
              <div>
                <div className="font-medium text-sm">Address</div>
                <div className="text-sm text-slate-600">{unionInfo.address}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-medium text-sm">Phone</div>
                <div className="text-sm text-slate-600">{unionInfo.phone}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-medium text-sm">Email</div>
                <div className="text-sm text-slate-600">{unionInfo.email}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-medium text-sm">Website</div>
                <div className="text-sm text-slate-600">{unionInfo.website}</div>
              </div>
            </div>
          </div>
        </div>

        {unionInfo.coordinates && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Location Coordinates</span>
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Lat: {unionInfo.coordinates.lat}, Lng: {unionInfo.coordinates.lng}
            </div>
          </div>
        )}

        <div className="flex space-x-2 pt-4">
          <Button className="flex items-center space-x-2" size="sm">
            <Plus className="w-4 h-4" />
            <span>Add to Contacts</span>
          </Button>
          <Button variant="outline" size="sm">
            View on Map
          </Button>
          <Button variant="outline" size="sm">
            Create Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
