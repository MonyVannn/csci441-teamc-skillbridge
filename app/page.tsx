import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { getAvailableProjects } from "@/lib/actions/project";
import { ProjectCard } from "@/components/browse/ProjectCard";

const services = [
  {
    id: 1,
    thumbnail:
      "https://plus.unsplash.com/premium_photo-1671461774955-7aab3ab41b90?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Clean and organize a small dataset for business insights",
    seller: {
      name: "Sarah L.",
      avatar:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: true,
      level: "Top Rated ⭐⭐⭐",
    },
    rating: 4.9,
    reviews: "120",
    price: 50,
    duration: "2 days",
    hasConsultation: false,
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1556943418-0e5712249b9d?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Design a simple promotional flyer for a nonprofit event",
    seller: {
      name: "David K.",
      avatar:
        "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: true,
      level: "Top Rated ⭐⭐⭐",
    },
    rating: 4.8,
    reviews: "89",
    price: 40,
    duration: "3 days",
    hasConsultation: true,
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Fix small bugs on a website and improve responsiveness",
    seller: {
      name: "Scaler Devs",
      avatar:
        "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: true,
      level: "Top Rated ⭐⭐⭐",
    },
    rating: 5.0,
    reviews: "200+",
    price: 75,
    duration: "2 days",
    hasConsultation: false,
  },
  {
    id: 4,
    thumbnail:
      "https://images.unsplash.com/photo-1570215170761-f056128eda48?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Test a new website feature and provide usability feedback",
    seller: {
      name: "Emily R.",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: true,
      level: "Top Rated ⭐⭐⭐",
    },
    rating: 4.7,
    reviews: "65",
    price: 30,
    duration: "1 day",
    hasConsultation: true,
  },
  {
    id: 5,
    thumbnail:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Create a social media content calendar for one month",
    seller: {
      name: "Amine S.",
      avatar:
        "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: false,
      level: "SkillBridge Choice",
      isChoice: true,
    },
    rating: 5.0,
    reviews: "45",
    price: 60,
    duration: "4 days",
    hasConsultation: false,
  },
  {
    id: 6,
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Build a simple landing page for a small business",
    seller: {
      name: "Saqi",
      avatar:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: false,
      level: "Level 1 ⭐",
    },
    rating: 4.6,
    reviews: "78",
    price: 100,
    duration: "5 days",
    hasConsultation: false,
  },
  {
    id: 7,
    thumbnail:
      "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Write a blog post draft for a nonprofit’s website",
    seller: {
      name: "Jobair",
      avatar:
        "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: false,
      level: "Level 2 ⭐⭐",
    },
    rating: 4.9,
    reviews: "32",
    price: 25,
    duration: "2 days",
    hasConsultation: false,
  },
  {
    id: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1498075702571-ecb018f3752d?q=80&w=2678&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Create a simple infographic for a community project",
    seller: {
      name: "Leo Studio",
      avatar:
        "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      topRated: false,
      level: "Level 2 ⭐⭐",
    },
    rating: 4.8,
    reviews: "54",
    price: 35,
    duration: "3 days",
    hasConsultation: false,
  },
];

export default async function MarketplacePage() {
  const projects = await getAvailableProjects();

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="container mx-auto flex pb-20">
        {/* Filtering Sidebar */}
        <div className="w-80 border-r border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>

          {/* Service Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Service options</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="online-sellers" />
                <label
                  htmlFor="online-sellers"
                  className="text-sm text-gray-700"
                >
                  Online sellers
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="local-sellers" />
                <label
                  htmlFor="local-sellers"
                  className="text-sm text-gray-700"
                >
                  Local sellers
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pro-services" />
                <label htmlFor="pro-services" className="text-sm text-gray-700">
                  Pro services
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seller Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Seller details</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="top-rated" />
                <label htmlFor="top-rated" className="text-sm text-gray-700">
                  Top Rated seller
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="level-two" />
                <label htmlFor="level-two" className="text-sm text-gray-700">
                  Level 2
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="level-one" />
                <label htmlFor="level-one" className="text-sm text-gray-700">
                  Level 1
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="new-seller" />
                <label htmlFor="new-seller" className="text-sm text-gray-700">
                  New seller
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Budget */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Budget</h3>
            <div className="space-y-4">
              <div className="px-2">
                <Slider
                  defaultValue={[5, 500]}
                  max={1000}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$5</span>
                  <span>$1000+</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">MIN.</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">MAX.</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Time */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Delivery time</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="express-24h" />
                <label htmlFor="express-24h" className="text-sm text-gray-700">
                  Express 24H
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="up-to-3-days" />
                <label htmlFor="up-to-3-days" className="text-sm text-gray-700">
                  Up to 3 days
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="up-to-7-days" />
                <label htmlFor="up-to-7-days" className="text-sm text-gray-700">
                  Up to 7 days
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="anytime" />
                <label htmlFor="anytime" className="text-sm text-gray-700">
                  Anytime
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Video Type */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Video type</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="youtube" />
                <label htmlFor="youtube" className="text-sm text-gray-700">
                  YouTube videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="social-media" />
                <label htmlFor="social-media" className="text-sm text-gray-700">
                  Social media videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="wedding" />
                <label htmlFor="wedding" className="text-sm text-gray-700">
                  Wedding videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="commercial" />
                <label htmlFor="commercial" className="text-sm text-gray-700">
                  Commercial videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="music-videos" />
                <label htmlFor="music-videos" className="text-sm text-gray-700">
                  Music videos
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Software */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Software</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="premiere-pro" />
                <label htmlFor="premiere-pro" className="text-sm text-gray-700">
                  Adobe Premiere Pro
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="after-effects" />
                <label
                  htmlFor="after-effects"
                  className="text-sm text-gray-700"
                >
                  Adobe After Effects
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="final-cut" />
                <label htmlFor="final-cut" className="text-sm text-gray-700">
                  Final Cut Pro
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="davinci" />
                <label htmlFor="davinci" className="text-sm text-gray-700">
                  DaVinci Resolve
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <ProjectCard projects={projects} />
      </div>
    </div>
  );
}
