import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Clock, User, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const BookRide = () => {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    passengers: "1",
    time: "",
    rideType: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !formData.from || !formData.to || !formData.time || !formData.rideType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Ride Booking Request Submitted!",
      description: "We'll connect you with available drivers shortly. You'll receive confirmation via email."
    });
  };

  const rideOptions = [
    { value: "economy", label: "Economy Ride", price: "$25-35", description: "Comfortable standard vehicles" },
    { value: "premium", label: "Premium Ride", price: "$45-60", description: "Luxury vehicles with amenities" },
    { value: "executive", label: "Executive Ride", price: "$75-95", description: "Premium chauffeur service" },
    { value: "group", label: "Group Ride", price: "$60-80", description: "Large vehicles for groups" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Book Your Airport Ride
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure, reliable transportation with verified professional drivers
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Ride Details
                </CardTitle>
                <CardDescription>
                  Enter your travel information to find available drivers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* From/To */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">From</Label>
                      <Select onValueChange={(value) => setFormData({...formData, from: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="terminal-1">Terminal 1</SelectItem>
                          <SelectItem value="terminal-2">Terminal 2</SelectItem>
                          <SelectItem value="terminal-3">Terminal 3</SelectItem>
                          <SelectItem value="arrivals">Arrivals Hall</SelectItem>
                          <SelectItem value="departures">Departures</SelectItem>
                          <SelectItem value="hotel">Hotel Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        placeholder="Enter destination address"
                        value={formData.to}
                        onChange={(e) => setFormData({...formData, to: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="space-y-2">
                    <Label>Passengers</Label>
                    <Select onValueChange={(value) => setFormData({...formData, passengers: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of passengers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Passenger</SelectItem>
                        <SelectItem value="2">2 Passengers</SelectItem>
                        <SelectItem value="3">3 Passengers</SelectItem>
                        <SelectItem value="4">4 Passengers</SelectItem>
                        <SelectItem value="5+">5+ Passengers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" variant="aviation" size="lg" className="w-full">
                    Find Available Rides
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Ride Options */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-accent" />
                    Ride Options
                  </CardTitle>
                  <CardDescription>
                    Choose the ride type that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rideOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary ${
                        formData.rideType === option.value ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setFormData({...formData, rideType: option.value})}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {option.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-primary">
                          {option.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose SkyWay?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Verified professional drivers",
                      "Real-time GPS tracking",
                      "Transparent pricing",
                      "24/7 customer support",
                      "Airport security clearance",
                      "Luxury vehicle fleet"
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRide;