
import { Link, useLocation } from "wouter";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu,
  Phone,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Smartphone,
  Hash,
  Headphones,
  Laptop,
  Wifi,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type CartItem } from "@shared/schema";
import logo from "@assets/generated_images/team_telecom_armenia_logo_concept.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      
      {/* --- Top Bar --- */}
      <div className="bg-white border-b border-gray-100 text-[11px] text-gray-500 py-2 hidden md:block">
        <div className="container max-w-[1400px] mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
             <a href="#" className="hover:text-team-blue">Individuals</a>
             <a href="#" className="hover:text-team-blue">Business</a>
             <span className="bg-team-red text-white px-2 py-0.5 rounded-sm font-bold">eShop</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <Search className="w-3 h-3" />
               <input type="text" placeholder="Search..." className="border-none outline-none text-xs w-24 placeholder:text-gray-400" />
             </div>
             <div className="flex gap-2">
               <span className="cursor-pointer hover:text-team-blue">Eng</span>
               <span className="cursor-pointer text-team-red font-bold">Arm</span>
               <span className="cursor-pointer hover:text-team-blue">Rus</span>
             </div>
             <a href="#" className="flex items-center gap-1 hover:text-team-blue">
               <User className="w-3 h-3" />
               Personal Account
             </a>
             <Link href="/cart">
               <div className="flex items-center gap-1 text-team-blue font-bold cursor-pointer hover:underline">
                 <ShoppingBag className="w-3 h-3" />
                 {cartCount}
               </div>
             </Link>
          </div>
        </div>
      </div>

      {/* --- Main Navigation --- */}
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-100">
        <div className="container max-w-[1400px] mx-auto h-[70px] flex items-center justify-between px-4">
          
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <img src={logo} alt="Team" className="h-8 w-auto" />
              <div className="leading-tight">
                <span className="block font-display font-bold text-xl tracking-tight text-team-blue">team</span>
                <span className="block text-[8px] uppercase tracking-widest text-gray-500">Telecom Armenia</span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-8 text-[13px] font-bold text-gray-700 uppercase tracking-wide">
              <Link href="/">
                <span className={`flex items-center gap-2 cursor-pointer py-6 ${location === '/' || location.startsWith('/product') ? 'text-team-blue border-b-2 border-team-blue' : 'hover:text-team-blue transition-colors'}`}>
                  <Smartphone className="w-4 h-4" /> Smartphones
                </span>
              </Link>
              <a href="#" className="flex items-center gap-2 hover:text-team-blue transition-colors">
                <Hash className="w-4 h-4" /> Numbers
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-team-blue transition-colors">
                <Headphones className="w-4 h-4" /> Accessories
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-team-blue transition-colors">
                <Laptop className="w-4 h-4" /> Devices
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-team-blue transition-colors">
                <Tag className="w-4 h-4" /> Deals
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full w-64 border border-transparent focus-within:border-team-blue focus-within:bg-white focus-within:shadow-md transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 text-gray-900 h-full"
                />
             </div>
             <Link href="/cart">
               <Button className="bg-team-blue hover:bg-team-blue/90 text-white rounded-full px-6 text-xs font-bold uppercase tracking-wider h-9">
                 Cart{cartCount > 0 ? ` (${cartCount})` : ""}
               </Button>
             </Link>
             <Button variant="ghost" size="icon" className="md:hidden">
               <Menu className="h-6 w-6" />
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white">
        {children}
      </main>

      {/* --- Footer --- */}
      <footer className="bg-team-blue text-white pt-16 pb-8 mt-auto">
        <div className="container max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: About */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                 <img src={logo} alt="Team" className="h-8 w-auto brightness-0 invert" />
                 <span className="font-display font-bold text-2xl tracking-tight">team</span>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Team Telecom Armenia provides high-quality mobile and fixed communication, internet and digital TV services.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 2: Information */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Information</h4>
              <ul className="space-y-3 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">News</a></li>
                <li><a href="#" className="hover:text-white">Vacancies</a></li>
                <li><a href="#" className="hover:text-white">Sustainable Development</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 3: Team Apps */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Team Applications</h4>
              <ul className="space-y-3 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white">My Team App</a></li>
                <li><a href="#" className="hover:text-white">TeamTV</a></li>
                <li><a href="#" className="hover:text-white">TeamPay</a></li>
              </ul>
              <div className="flex gap-2 mt-6">
                <div className="bg-black border border-gray-700 rounded-md p-1 px-2 flex items-center gap-1 cursor-pointer">
                   <div className="text-[8px] text-gray-400">GET IT ON</div>
                   <div className="text-xs font-bold">Google Play</div>
                </div>
                 <div className="bg-black border border-gray-700 rounded-md p-1 px-2 flex items-center gap-1 cursor-pointer">
                   <div className="text-[8px] text-gray-400">Download on the</div>
                   <div className="text-xs font-bold">App Store</div>
                </div>
              </div>
            </div>

             {/* Column 4: Contact */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Contact Us</h4>
              <ul className="space-y-4 text-sm text-blue-100">
                <li className="flex items-start gap-3">
                   <Phone className="w-5 h-5 mt-0.5 text-team-red" />
                   <div>
                     <div className="font-bold text-white text-lg">100</div>
                     <div className="text-xs opacity-70">Free for Team subscribers</div>
                   </div>
                </li>
                 <li className="flex items-start gap-3">
                   <Globe className="w-5 h-5 mt-0.5 text-team-red" />
                   <div>
                     <div className="font-bold text-white">eshop@team.am</div>
                     <div className="text-xs opacity-70">Email for inquiries</div>
                   </div>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-200">
            <div>© 2024 Team Telecom Armenia. All rights reserved.</div>
            <div className="flex gap-6">
               <a href="#" className="hover:text-white">Terms of Use</a>
               <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
