import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Calendar, User, Settings } from "lucide-react";
import heroImage from "@/assets/hero-airport.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-aviation-navy/80 via-primary/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
            Connect. Ride.{" "}
            <span className="bg-gradient-sunset bg-clip-text text-transparent">
              Soar.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in">
            The premium airport ride-sharing platform connecting travelers, drivers, 
            and aviation partners worldwide. Secure, sustainable, and seamless.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up">
            <Button variant="hero" size="xl" asChild>
              <Link to="/book">
                <Calendar className="h-5 w-5" />
                Book Your Ride
              </Link>
            </Button>
            <Button variant="premium" size="xl" asChild>
              <Link to="/drivers">
                <User className="h-5 w-5" />
                Become a Driver
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Calendar,
                title: "Book Rides",
                description: "Secure, discounted rides from verified drivers",
                link: "/book",
                variant: "aviation" as const
              },
              {
                icon: User,
                title: "Drive & Earn",
                description: "Join our network of professional airport drivers",
                link: "/drivers",
                variant: "driver" as const
              },
              {
                icon: Settings,
                title: "Manage Garages",
                description: "Streamline operations and manage your fleet",
                link: "/garages",
                variant: "garage" as const
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-sky rounded-lg flex items-center justify-center mb-4 group-hover:animate-float">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 mb-4">
                    {feature.description}
                  </p>
                  <Button variant={feature.variant} size="sm" asChild>
                    <Link to={feature.link}>Learn More</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-primary-glow/20 rounded-full animate-float hidden lg:block" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-full animate-float hidden lg:block" style={{ animationDelay: "2s" }}></div>
    </section>
  );
};

export default Hero;