import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Building, Users, BarChart3, Shield, Car, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Garages = () => {
  const [formData, setFormData] = useState({
    garageName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    capacity: "",
    services: "",
    experience: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = ['garageName', 'contactName', 'email', 'phone', 'address', 'capacity'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to submit your partnership application.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Partnership Application Submitted!",
      description: "Thank you for your interest. Our partnership team will review your application and contact you within 3-5 business days."
    });
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Partner with{" "}
              <span className="text-garage-green">
                SkyWay Garages
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your garage into a premium airport transportation hub. 
              Manage drivers, vehicles, and subscriptions with our comprehensive platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Partnership Benefits */}
            {[
              {
                icon: DollarSign,
                title: "Revenue Growth",
                description: "Increase revenue by 40-60% through premium airport rides",
                highlight: "40-60% Increase"
              },
              {
                icon: Users,
                title: "Driver Management",
                description: "Comprehensive tools to manage your driver network",
                highlight: "Full Control"
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Real-time insights into bookings, revenue, and performance",
                highlight: "Data-Driven"
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center shadow-elevated hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-garage-green rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <div className="text-2xl font-bold text-garage-green">{benefit.highlight}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Partnership Application Form */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-garage-green" />
                  Garage Partnership Application
                </CardTitle>
                <CardDescription>
                  Join our network of premium airport transportation partners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="garageName">Garage/Business Name *</Label>
                    <Input
                      id="garageName"
                      placeholder="Enter your garage or business name"
                      value={formData.garageName}
                      onChange={(e) => setFormData({...formData, garageName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        placeholder="Primary contact person"
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Capacity *</Label>
                      <Select onValueChange={(value) => setFormData({...formData, capacity: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Number of vehicles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5-10">5-10 vehicles</SelectItem>
                          <SelectItem value="11-25">11-25 vehicles</SelectItem>
                          <SelectItem value="26-50">26-50 vehicles</SelectItem>
                          <SelectItem value="51-100">51-100 vehicles</SelectItem>
                          <SelectItem value="100+">100+ vehicles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Garage Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Full address including city, state, and postal code"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Current Services</Label>
                    <Select onValueChange={(value) => setFormData({...formData, services: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select current services" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="taxi">Traditional Taxi Service</SelectItem>
                        <SelectItem value="rideshare">Ride-share Fleet</SelectItem>
                        <SelectItem value="corporate">Corporate Transportation</SelectItem>
                        <SelectItem value="airport">Airport Shuttle Service</SelectItem>
                        <SelectItem value="luxury">Luxury Car Service</SelectItem>
                        <SelectItem value="new">New to Transportation Industry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Years in Business</Label>
                    <Select onValueChange={(value) => setFormData({...formData, experience: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Years of operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (0-1 years)</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Information</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your garage, current operations, goals, and why you'd like to partner with SkyWay..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="garage" size="lg" className="w-full">
                    Submit Partnership Application
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Partnership Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-garage-green" />
                    What We Provide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Complete driver management platform",
                      "Subscription ticketing system",
                      "Real-time booking and dispatch",
                      "Revenue tracking and analytics",
                      "Customer support infrastructure",
                      "Marketing and brand support",
                      "Training and onboarding assistance",
                      "Technical support and maintenance"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-garage-green rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Partnership Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Valid business license and insurance",
                      "Minimum 5 vehicles in fleet",
                      "Professional driver network",
                      "Airport area location preferred",
                      "Commitment to service standards",
                      "Technology adoption readiness",
                      "Customer service orientation",
                      "Flexible partnership terms"
                    ].map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Shield className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm text-foreground">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-accent" />
                    Partnership Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: "1", title: "Application Review", desc: "We review your garage and business model" },
                      { step: "2", title: "Site Visit", desc: "On-site evaluation and assessment" },
                      { step: "3", title: "Agreement", desc: "Partnership terms and contract signing" },
                      { step: "4", title: "Setup & Training", desc: "Platform setup and staff training" },
                      { step: "5", title: "Go Live", desc: "Launch operations and start earning" }
                    ].map((process, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-garage-green text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {process.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{process.title}</h4>
                          <p className="text-sm text-muted-foreground">{process.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Garages;