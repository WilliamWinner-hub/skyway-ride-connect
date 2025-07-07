import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, DollarSign, Shield, Clock, Car, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Drivers = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    vehicleType: "",
    experience: "",
    availability: "",
    background: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = ['fullName', 'email', 'phone', 'licenseNumber', 'vehicleType', 'experience'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to submit your application.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Application Submitted!",
      description: "Thank you for applying. Our team will review your application and contact you within 2-3 business days."
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
              Drive with{" "}
              <span className="bg-gradient-premium bg-clip-text text-transparent">
                SkyWay
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join our network of professional airport drivers and earn premium rates 
              while providing exceptional service to travelers worldwide.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Benefits */}
            {[
              {
                icon: DollarSign,
                title: "Premium Earnings",
                description: "Earn 25-40% more than traditional ride-share platforms",
                highlight: "$2,500-4,500/month"
              },
              {
                icon: Shield,
                title: "Security & Trust",
                description: "Airport security clearance and verified passenger base",
                highlight: "100% Safe"
              },
              {
                icon: Clock,
                title: "Flexible Schedule",
                description: "Choose your hours and work around flight schedules",
                highlight: "24/7 Availability"
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center shadow-elevated hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{benefit.highlight}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Application Form */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-driver-purple" />
                  Driver Application
                </CardTitle>
                <CardDescription>
                  Join our premium driver network today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
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
                      <Label htmlFor="license">Driver's License Number *</Label>
                      <Input
                        id="license"
                        placeholder="License number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle Type *</Label>
                      <Select onValueChange={(value) => setFormData({...formData, vehicleType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan (4 passengers)</SelectItem>
                          <SelectItem value="suv">SUV (6-7 passengers)</SelectItem>
                          <SelectItem value="luxury">Luxury Vehicle</SelectItem>
                          <SelectItem value="van">Van (8+ passengers)</SelectItem>
                          <SelectItem value="electric">Electric Vehicle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Driving Experience *</Label>
                      <Select onValueChange={(value) => setFormData({...formData, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Years of experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select onValueChange={(value) => setFormData({...formData, availability: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="When can you drive?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time (40+ hours/week)</SelectItem>
                        <SelectItem value="part-time">Part-time (20-40 hours/week)</SelectItem>
                        <SelectItem value="weekends">Weekends only</SelectItem>
                        <SelectItem value="evenings">Evenings only</SelectItem>
                        <SelectItem value="flexible">Flexible schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background">Background Information</Label>
                    <Textarea
                      id="background"
                      placeholder="Tell us about your driving experience, customer service background, or any relevant qualifications..."
                      value={formData.background}
                      onChange={(e) => setFormData({...formData, background: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="driver" size="lg" className="w-full">
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Requirements & Process */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-garage-green" />
                    Driver Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Valid driver's license (minimum 3 years)",
                      "Clean driving record",
                      "Background check clearance",
                      "Airport security badge (we'll help obtain)",
                      "Commercial insurance",
                      "Professional vehicle (2018 or newer)",
                      "Customer service orientation",
                      "Smartphone for app usage"
                    ].map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-garage-green mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Application Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: "1", title: "Submit Application", desc: "Complete the online form" },
                      { step: "2", title: "Document Review", desc: "We verify your credentials" },
                      { step: "3", title: "Background Check", desc: "Security clearance process" },
                      { step: "4", title: "Vehicle Inspection", desc: "We inspect your vehicle" },
                      { step: "5", title: "Training & Onboarding", desc: "Learn our platform and standards" },
                      { step: "6", title: "Start Earning", desc: "Begin accepting ride requests" }
                    ].map((process, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
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
  );
};

export default Drivers;