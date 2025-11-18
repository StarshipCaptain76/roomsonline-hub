import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Key, Building2 } from "lucide-react";

interface Property {
  id: string;
  name: string;
  location: string;
  city: string;
  booking_system: string;
  price_per_night: number;
  max_guests: number;
  is_active: boolean;
}

interface SystemCredential {
  id: string;
  system_name: string;
  endpoint_url: string;
  api_key: string;
  is_active: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [credentials, setCredentials] = useState<SystemCredential[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    property_type: "hotel" as "hotel" | "vacation_rental" | "apartment" | "villa" | "guesthouse",
    location: "",
    city: "",
    country: "South Africa",
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    price_per_night: 0,
    currency: "ZAR",
    booking_system: "manual" as "manual" | "nightsbridge" | "checkfront",
  });

  const [credentialForm, setCredentialForm] = useState({
    system_name: "nightsbridge" as "nightsbridge" | "checkfront",
    endpoint_url: "",
    api_key: "",
    api_secret: "",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to access admin panel");
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      toast.error("You don't have admin access");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    loadProperties();
    loadCredentials();
  };

  const loadProperties = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("id, name, location, city, booking_system, price_per_night, max_guests, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load properties");
      return;
    }

    setProperties(data || []);
  };

  const loadCredentials = async () => {
    const { data, error } = await supabase
      .from("system_credentials")
      .select("id, system_name, endpoint_url, api_key, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load credentials:", error);
      return;
    }

    setCredentials(data || []);
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("properties").insert([formData]);

      if (error) throw error;
      
      toast.success("Property added successfully");
      setFormData({
        name: "",
        description: "",
        property_type: "hotel",
        location: "",
        city: "",
        country: "South Africa",
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        price_per_night: 0,
        currency: "ZAR",
        booking_system: "manual",
      });
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to add property");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete property");
      return;
    }

    toast.success("Property deleted successfully");
    loadProperties();
  };

  const handleSubmitCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("system_credentials").insert([{
        ...credentialForm,
        created_by: session.user.id,
      }]);

      if (error) throw error;
      
      toast.success("Credentials added successfully");
      setCredentialForm({
        system_name: "nightsbridge",
        endpoint_url: "",
        api_key: "",
        api_secret: "",
      });
      loadCredentials();
    } catch (error: any) {
      toast.error(error.message || "Failed to add credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!confirm("Are you sure you want to delete these credentials?")) return;

    const { error } = await supabase
      .from("system_credentials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete credentials");
      return;
    }

    toast.success("Credentials deleted successfully");
    loadCredentials();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | RoomsOnline</title>
        <meta name="description" content="Manage properties and booking system integrations" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Admin Dashboard</h1>
          
          <Tabs defaultValue="add-property" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="add-property">Add Property</TabsTrigger>
              <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
              <TabsTrigger value="credentials">System Credentials</TabsTrigger>
            </TabsList>

            <TabsContent value="add-property">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Property
                  </CardTitle>
                  <CardDescription>Add a property to the booking system</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitProperty} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Property Name</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Property Type</label>
                        <Select
                          value={formData.property_type}
                          onValueChange={(value) => setFormData({ ...formData, property_type: value as any })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="vacation_rental">Vacation Rental</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="guesthouse">Guesthouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">City</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Booking System</label>
                        <Select
                          value={formData.booking_system}
                          onValueChange={(value) => setFormData({ ...formData, booking_system: value as any })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="nightsbridge">NightsBridge</SelectItem>
                            <SelectItem value="checkfront">Checkfront</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Max Guests</label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.max_guests}
                          onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Bathrooms</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Price per Night (ZAR)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price_per_night}
                          onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Property
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    All Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {properties.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No properties added yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>System</TableHead>
                          <TableHead>Price/Night</TableHead>
                          <TableHead>Max Guests</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.name}</TableCell>
                            <TableCell>{property.city}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{property.booking_system}</Badge>
                            </TableCell>
                            <TableCell>R{property.price_per_night}</TableCell>
                            <TableCell>{property.max_guests}</TableCell>
                            <TableCell>
                              <Badge variant={property.is_active ? "default" : "secondary"}>
                                {property.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Add System Credentials
                    </CardTitle>
                    <CardDescription>Configure API access for NightsBridge and Checkfront</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitCredential} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">System</label>
                        <Select
                          value={credentialForm.system_name}
                          onValueChange={(value) => setCredentialForm({ ...credentialForm, system_name: value as any })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nightsbridge">NightsBridge</SelectItem>
                            <SelectItem value="checkfront">Checkfront</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">API Endpoint URL</label>
                        <Input
                          type="url"
                          placeholder="https://api.example.com"
                          value={credentialForm.endpoint_url}
                          onChange={(e) => setCredentialForm({ ...credentialForm, endpoint_url: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">API Key</label>
                        <Input
                          type="password"
                          placeholder="Enter API key"
                          value={credentialForm.api_key}
                          onChange={(e) => setCredentialForm({ ...credentialForm, api_key: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">API Secret (optional)</label>
                        <Input
                          type="password"
                          placeholder="Enter API secret if required"
                          value={credentialForm.api_secret}
                          onChange={(e) => setCredentialForm({ ...credentialForm, api_secret: e.target.value })}
                        />
                      </div>

                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Credentials
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configured Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {credentials.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No credentials configured yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>System</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {credentials.map((cred) => (
                            <TableRow key={cred.id}>
                              <TableCell className="font-medium capitalize">{cred.system_name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{cred.endpoint_url}</TableCell>
                              <TableCell>
                                <Badge variant={cred.is_active ? "default" : "secondary"}>
                                  {cred.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCredential(cred.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Admin;
