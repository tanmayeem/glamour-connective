import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="hero-gradient min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Discover <span className="gradient-text">Glamour</span>,<br />
            Book Perfection
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Connect with top makeup artists and transform your special moments into unforgettable memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register-artist">
              <Button className="bg-secondary text-white hover:bg-secondary/90 transition-all text-lg py-6 px-8 shimmer w-full sm:w-auto">
                Register as Artist
              </Button>
            </Link>
            <Link to="/search">
              <Button 
                className="bg-white text-primary hover:bg-primary hover:text-white transition-all text-lg py-6 px-8 border border-primary w-full sm:w-auto"
              >
                Book an Artist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};