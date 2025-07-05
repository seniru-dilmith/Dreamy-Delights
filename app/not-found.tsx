import { Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      <div className="text-center z-10 max-w-2xl mx-auto w-full">
        {/* Large Prominent 404 Image */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <img
            src="/404.svg"
            alt="404 - Page Not Found"
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-56 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] object-contain"
          />
        </div>

        {/* Minimal Text */}
        <div className="mb-8 sm:mb-10">
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            Page not found
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/" className="w-full sm:w-auto">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
