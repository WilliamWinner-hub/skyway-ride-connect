import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plane, Users, Globe, TrendingUp, Star, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Airlines = () => {
  const [formData, setFormData] = useState({
    airlineName: "",
    contactName: "",
    email: "",
    phone: "",
    iataCode: "",
    headquarters: "",
    fleetSize: "",
    routes: "",
    passengers: "",
    partnership: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = ['airlineName', 'contactName', 'email', 'phone', 'headquarters'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to submit your partnership inquiry.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Partnership Inquiry Submitted!",
      description: "Thank you for your interest. Our airline partnerships team will contact you within 1-2 business days to discuss collaboration opportunities."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Airline{" "}
              <span className="text-aviation-navy">
                Partnerships
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enhance your passenger experience with seamless airport ground transportation. 
              Partner with SkyWay to offer premium ride services to your valued customers.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Partnership Benefits */}
            {[
              {
                icon: Star,
                title: "Enhanced Experience",
                description: "Provide passengers with premium ground transportation",
                highlight: "5-Star Service"
              },
              {
                icon: TrendingUp,
                title: "Revenue Share",
                description: "Generate additional revenue through partnership commissions",
                highlight: "15-25% Commission"
              },
              {
                icon: Globe,
                title: "Global Network",
                description: "Connect passengers worldwide through our expanding network",
                highlight: "50+ Airports"
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center shadow-elevated hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-aviation-navy rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <div className="text-2xl font-bold text-aviation-navy">{benefit.highlight}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Partnership Inquiry Form */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-aviation-navy" />
                  Airline Partnership Inquiry
                </CardTitle>
                <CardDescription>
                  Let's discuss how we can enhance your passenger experience together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="airlineName">Airline Name *</Label>
                    <Input
                      id="airlineName"
                      placeholder="Enter your airline name"
                      value={formData.airlineName}
                      onChange={(e) => setFormData({...formData, airlineName: e.target.value})}
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
                        placeholder="partnerships@airline.com"
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
                      <Label htmlFor="iataCode">IATA Code</Label>
                      <Input
                        id="iataCode"
                        placeholder="e.g., AA, DL, UA"
                        value={formData.iataCode}
                        onChange={(e) => setFormData({...formData, iataCode: e.target.value})}
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headquarters">Headquarters Location *</Label>
                    <Input
                      id="headquarters"
                      placeholder="City, Country"
                      value={formData.headquarters}
                      onChange={(e) => setFormData({...formData, headquarters: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fleet Size</Label>
                      <Select onValueChange={(value) => setFormData({...formData, fleetSize: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Number of aircraft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 aircraft</SelectItem>
                          <SelectItem value="11-50">11-50 aircraft</SelectItem>
                          <SelectItem value="51-100">51-100 aircraft</SelectItem>
                          <SelectItem value="101-200">101-200 aircraft</SelectItem>
                          <SelectItem value="200+">200+ aircraft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Annual Passengers</Label>
                      <Select onValueChange={(value) => setFormData({...formData, passengers: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Passenger volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<1M">Less than 1M</SelectItem>
                          <SelectItem value="1-5M">1-5 Million</SelectItem>
                          <SelectItem value="5-20M">5-20 Million</SelectItem>
                          <SelectItem value="20-50M">20-50 Million</SelectItem>
                          <SelectItem value="50M+">50M+ Million</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Routes</Label>
                    <Select onValueChange={(value) => setFormData({...formData, routes: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Route network type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic Routes</SelectItem>
                        <SelectItem value="regional">Regional International</SelectItem>
                        <SelectItem value="continental">Continental</SelectItem>
                        <SelectItem value="intercontinental">Intercontinental</SelectItem>
                        <SelectItem value="global">Global Network</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Partnership Interest</Label>
                    <Select onValueChange={(value) => setFormData({...formData, partnership: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type of partnership" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passenger-services">Passenger Ground Services</SelectItem>
                        <SelectItem value="loyalty-integration">Loyalty Program Integration</SelectItem>
                        <SelectItem value="corporate-accounts">Corporate Account Management</SelectItem>
                        <SelectItem value="crew-transportation">Crew Transportation</SelectItem>
                        <SelectItem value="full-integration">Full Service Integration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Partnership Goals & Additional Information</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your partnership goals, current ground transportation challenges, target airports, and how we can help enhance your passenger experience..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="aviation" size="lg" className="w-full">
                    Submit Partnership Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Partnership Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-aviation-navy" />
                    Partnership Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Seamless passenger experience integration",
                      "White-label solution with your branding",
                      "Real-time booking and tracking system",
                      "Revenue sharing opportunities",
                      "Dedicated account management",
                      "Custom API integration",
                      "Priority customer support",
                      "Performance analytics and reporting"
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-aviation-navy rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Integration Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Booking Platform Integration",
                        desc: "Add ground transportation to your booking flow"
                      },
                      {
                        title: "Mobile App Integration",
                        desc: "Seamless ride booking within your airline app"
                      },
                      {
                        title: "Loyalty Program Connection",
                        desc: "Earn and redeem miles for ground transportation"
                      },
                      {
                        title: "Corporate Account Management",
                        desc: "Manage business travel ground transportation"
                      },
                      {
                        title: "Crew Transportation Services",
                        desc: "Dedicated transportation for airline crew"
                      }
                    ].map((integration, index) => (
                      <div key={index} className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <h4 className="font-semibold text-foreground mb-2">{integration.title}</h4>
                        <p className="text-sm text-muted-foreground">{integration.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    Current Airport Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "LAX - Los Angeles",
                      "JFK - New York",
                      "LHR - London",
                      "CDG - Paris",
                      "NRT - Tokyo",
                      "DXB - Dubai",
                      "SIN - Singapore",
                      "FRA - Frankfurt"
                    ].map((airport, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm text-foreground">{airport}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Expanding to 100+ airports worldwide by 2025
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airlines;