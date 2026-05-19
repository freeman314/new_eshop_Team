import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Smartphone, 
  Camera, 
  Battery, 
  Cpu, 
  Maximize, 
  Star,
  ShoppingBag,
  Info,
  Clock,
  Plus,
  Scale,
  ShieldCheck,
  Headphones,
  HelpCircle,
  MessageCircle,
  ThumbsUp,
  FileText,
  List,
  Copy,
  Box,
  ZoomIn,
  Calculator,
  ChevronUp,
  Heart,
  Plane,
  X,
  Rocket,
  ArrowDown,
  Hourglass,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Images
import honorImage from "@assets/generated_images/honor_magic6_pro_green.png";
import watchImage from "@assets/generated_images/garmin_venu_3s_watch.png";
import adapterImage from "@assets/generated_images/vlp_20w_adapter.png";
import caseImage from "@assets/generated_images/transparent_phone_case.png";
import glassImage from "@assets/generated_images/screen_protector.png";
import budsImage from "@assets/generated_images/wireless_earbuds.png";


// --- Types ---
export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  monthlyPrice?: number | null;
  rating: number | null;
  reviews: number | null;
  colors: { name: string; hex: string; selected?: boolean }[];
  storage: string[];
  sku: string | null;
  specs: Record<string, string>;
  imageKey: string;
  brand: string;
  category: string;
  inStock: boolean;
  isPreOrder: boolean;
  badges: { text: string; color: string }[];
  gift: { name: string; imageKey: string; price: number } | null;
  description: string | null;
}

// --- Mock Data ---
export const productData: Product = {
  id: "honor-magic6-pro",
  name: "Honor Magic6 Pro",
  price: 212900,
  oldPrice: 236900,
  monthlyPrice: 4940,
  rating: 4.8,
  reviews: 42,
  sku: "225175",
  brand: "Honor",
  category: "smartphone",
  imageKey: "honor_magic6_pro_green",
  inStock: true,
  isPreOrder: false,
  badges: [{ text: "Credit 0%", color: "purple" }],
  gift: { name: "Wireless Buds", imageKey: "wireless_earbuds", price: 25000 },
  description: "Discover the magic of technology with the new Honor Magic6 Pro. Featuring a stunning display, powerful processor, and a revolutionary camera system, it redefines what a smartphone can do.",
  colors: [
    { name: "Sage Green", hex: "#8DA399", selected: true },
    { name: "Black", hex: "#1c1e21" },
    { name: "Cyan", hex: "#00bcd4" },
    { name: "Purple", hex: "#9c27b0" },
  ],
  storage: ["256GB", "512GB"],
  specs: {
    "Memory": "256 GB",
    "Brand": "Honor",
    "Storage": "256 GB",
    "Model": "Magic6 Pro",
    "OS": "Android 14, MagicOS 8",
    "Color": "Sage Green",
    "Display Size": "6.8\", 1280x2800 pixels",
    "Main Camera": "50 MP + 180 MP + 50 MP",
    "Network": "5G / 4G / 3G",
    "Front Camera": "50 MP",
    "Battery": "5600 mAh",
    "Card Slots": "2 Nano SIMs",
    "Photo/Video": "4K@60fps, 1080p@240fps",
    "Warranty": "24 months"
  }
};

// --- Components ---

export function CountdownTimer() {
  return (
    <div className="flex gap-2 items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
      <Clock className="w-3.5 h-3.5 text-team-red" />
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Offer ends in:</span>
      <div className="flex gap-1 items-center">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-900 leading-none">10</span>
          <span className="text-[8px] text-gray-400">Hrs</span>
        </div>
        <span className="text-gray-300 -mt-2">:</span>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-900 leading-none">11</span>
          <span className="text-[8px] text-gray-400">Min</span>
        </div>
        <span className="text-gray-300 -mt-2">:</span>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-900 leading-none">32</span>
          <span className="text-[8px] text-gray-400">Sec</span>
        </div>
      </div>
    </div>
  );
}

export function TrustMarks() {
  const features = [
    { icon: Truck, title: "Fast Delivery", desc: "Same-day delivery in Yerevan for orders before 14:00. Next day for regions." },
    { icon: ShieldCheck, title: "Official Warranty", desc: "1 year official manufacturer warranty included with every purchase." },
    { icon: RotateCcw, title: "Easy Returns", desc: "14-day hassle-free return policy for unopened items." },
    { icon: Headphones, title: "24/7 Support", desc: "Our support team is available around the clock to assist you." },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 py-4 mt-4">
      {features.map((f, i) => (
        <Popover key={i}>
          <PopoverTrigger asChild>
            <div className="flex flex-col items-center text-center gap-2 p-2 group cursor-pointer rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-blue-50 rounded-full text-team-blue group-hover:bg-team-blue group-hover:text-white transition-colors">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[10px] text-gray-900 leading-tight group-hover:text-team-blue">{f.title}</h4>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-sm bg-white p-4 shadow-xl border-gray-100">
            <h4 className="font-bold text-team-blue mb-2 flex items-center gap-2">
              <f.icon className="w-4 h-4" /> {f.title}
            </h4>
            <p className="text-gray-600 leading-relaxed text-xs">{f.desc}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

export function CreditCalculator({ price, isOpen, onToggle }: { price: number, isOpen: boolean, onToggle: () => void }) {
  const [months, setMonths] = useState(12);
  const [selectedBank, setSelectedBank] = useState("ineco");
  
  const banks = {
    acba: { name: "ACBA Bank", rate: 0.18, annual: 0 },
    ineco: { name: "InecoBank", rate: 0.21, annual: 0.01 },
    ameria: { name: "Ameriabank", rate: 0.19, annual: 0 },
    evoca: { name: "Evocabank", rate: 0.20, annual: 0 },
    rocket: { name: "Rocket Line", rate: 0, annual: 0 }, // 0% usually
  };

  const currentBank = banks[selectedBank as keyof typeof banks];
  
  // Simple calculation logic for demo
  const monthlyRate = currentBank.rate / 12;
  const monthlyPayment = Math.round((price * (1 + currentBank.rate * (months/12))) / months);
  const totalAmount = monthlyPayment * months;
  const annualFeeAmount = Math.round(price * currentBank.annual);

  return (
    <div className="mt-4">
      <button 
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-bold text-team-blue hover:underline mb-2"
      >
        <Calculator className="w-4 h-4" />
        {isOpen ? "Hide Credit Calculator" : "Show Credit Calculator"}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-5 border-team-blue/10 bg-gradient-to-br from-blue-50/50 to-white shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-team-blue" />
                    <span className="font-bold text-gray-900">Credit Calculator</span>
                 </div>
                 <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger className="w-[180px] h-8 bg-white border-gray-200">
                      <SelectValue placeholder="Select Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ineco">InecoBank</SelectItem>
                      <SelectItem value="acba">ACBA Bank</SelectItem>
                      <SelectItem value="ameria">Ameriabank</SelectItem>
                      <SelectItem value="evoca">Evocabank</SelectItem>
                      <SelectItem value="rocket">Rocket Line 0%</SelectItem>
                    </SelectContent>
                 </Select>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                   <span className="text-xs text-gray-500 block mb-1">Monthly Payment</span>
                   <span className="text-3xl font-bold text-team-blue font-display">{monthlyPayment.toLocaleString()} ֏</span>
                </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Interest Rate:</span>
                     <span className="font-medium">{(currentBank.rate * 100)}%</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Annual Fee:</span>
                     <span className="font-medium">{annualFeeAmount > 0 ? `${currentBank.annual * 100}%` : "0%"}</span>
                   </div>
                   <div className="flex justify-between text-xs border-t border-gray-100 pt-1 mt-1">
                     <span className="text-gray-500">Total Payable:</span>
                     <span className="font-bold text-gray-900">{totalAmount.toLocaleString()} ֏</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-4">
                    <span className="text-gray-700">Duration</span>
                    <span className="font-bold text-team-blue">{months} months</span>
                  </div>
                  <Slider 
                    value={[months]} 
                    onValueChange={(v) => setMonths(v[0])} 
                    min={3} 
                    max={48} 
                    step={3}
                    className="cursor-pointer py-1"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                    <span>3 mo</span>
                    <span>12 mo</span>
                    <span>24 mo</span>
                    <span>36 mo</span>
                    <span>48 mo</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-center text-gray-400 leading-tight px-4 mt-4">
                  Information presented is for reference only. Final terms and conditions are determined by the bank upon application.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { getProductImage } from "@/lib/images";

export function SpecsTable({ specs }: { specs: Record<string, string> }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-w-4xl mx-auto">
      <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
         <List className="w-5 h-5 text-team-blue" />
         <h3 className="font-bold text-gray-900">Technical Specifications</h3>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          {Object.entries(specs).map(([key, value]) => (
            <tr key={key} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-6 font-medium text-gray-500 w-1/3">{key}</td>
              <td className="py-4 px-6 text-gray-900 font-bold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const mainImage = getProductImage(product.imageKey);
  const images = [mainImage, mainImage, mainImage, mainImage];
  
  const [selectedGift, setSelectedGift] = useState<{ id: string; name: string; image: string; desc: string; price: number } | null>(
    product.gift ? {
      id: "gift-1",
      name: product.gift.name,
      image: getProductImage(product.gift.imageKey),
      desc: "Included as a special offer with your purchase.",
      price: product.gift.price
    } : null
  );

  const availableGifts = product.gift ? [
    { 
      id: "gift-1",
      name: product.gift.name, 
      image: getProductImage(product.gift.imageKey), 
      desc: "Included as a special offer with your purchase.",
      price: product.gift.price
    },
    { 
      id: "adapter",
      name: "20W Power Adapter", 
      image: adapterImage, 
      desc: "Fast charging adapter compatible with Honor Magic6 Pro. Charge 50% in 30 minutes.",
      price: 15000
    },
    { 
      id: "case",
      name: "Silicone Case", 
      image: caseImage, 
      desc: "Premium soft-touch silicone case with microfiber lining for ultimate protection.",
      price: 12000
    }
  ] : [];

  const scrollToSpecs = () => {
    const specsTab = document.getElementById("product-tabs");
    if (specsTab) {
      specsTab.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-auto">
      {/* Main Image */}
      <div className="w-full aspect-square bg-white rounded-3xl border border-gray-100 p-8 flex items-center justify-center relative group overflow-hidden">
        {/* Background Blob for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-gray-50 to-blue-50 rounded-full blur-3xl -z-10 opacity-50" />
        
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 items-start">
           {product.badges.map((badge, idx) => (
             <Badge key={idx} className={`${badge.color === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-team-red'} border-none hover:bg-opacity-80`}>
               {badge.text}
             </Badge>
           ))}
           
           {selectedGift && (
             <Dialog>
               <DialogTrigger asChild>
                 <div className="cursor-pointer flex items-center gap-2 bg-purple-50/90 backdrop-blur border border-purple-100 rounded-full pl-1 pr-3 py-1 shadow-sm mt-1 w-fit animate-in fade-in slide-in-from-left-4 duration-700 hover:bg-purple-100 hover:scale-105 transition-all group/gift">
                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-purple-100 shadow-sm relative overflow-hidden">
                     <img src={selectedGift.image} alt="Gift" className="w-5 h-5 object-contain" />
                   </div>
                   <div>
                     <span className="block text-[9px] font-bold text-purple-600 uppercase leading-none mb-0.5">Free Gift</span>
                     <span className="block text-[10px] font-bold text-gray-900 leading-none flex items-center gap-1">
                       {selectedGift.name} <ChevronRight className="w-2 h-2 text-purple-400 group-hover/gift:translate-x-0.5 transition-transform" />
                     </span>
                   </div>
                 </div>
               </DialogTrigger>
               <DialogContent className="sm:max-w-md">
                 <DialogHeader>
                   <DialogTitle className="flex items-center gap-2 text-purple-700">
                     <Gift className="w-5 h-5" /> Select Your Free Gift
                   </DialogTitle>
                   <DialogDescription>
                     Choose one of the following premium gifts with your purchase.
                   </DialogDescription>
                 </DialogHeader>
                 
                 <div className="grid gap-4 py-4">
                   {availableGifts.map((gift) => (
                     <div 
                       key={gift.id}
                       onClick={() => setSelectedGift(gift)}
                       className={`relative flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                         selectedGift.id === gift.id 
                           ? 'border-purple-600 bg-purple-50 shadow-sm' 
                           : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                       }`}
                     >
                       <div className="w-16 h-16 bg-white rounded-lg p-2 border border-gray-100 flex-shrink-0">
                         <img src={gift.image} alt={gift.name} className="w-full h-full object-contain" />
                       </div>
                       <div className="flex-grow">
                         <div className="flex justify-between items-start mb-1">
                           <h4 className={`font-bold text-sm ${selectedGift.id === gift.id ? 'text-purple-900' : 'text-gray-900'}`}>
                             {gift.name}
                           </h4>
                           {selectedGift.id === gift.id && (
                             <div className="bg-purple-600 text-white p-1 rounded-full">
                               <Check className="w-3 h-3" />
                             </div>
                           )}
                         </div>
                         <p className="text-xs text-gray-500 line-clamp-2 mb-2">{gift.desc}</p>
                         <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="bg-white text-purple-600 border-purple-100 text-[10px] h-5">FREE</Badge>
                           <span className="text-xs text-gray-400 line-through">{gift.price.toLocaleString()} ֏</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
                 
                 <div className="flex justify-end">
                   <DialogTrigger asChild>
                     <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                       Confirm Selection
                     </Button>
                   </DialogTrigger>
                 </div>
               </DialogContent>
             </Dialog>
           )}
        </div>

        <div className="absolute bottom-6 right-6 z-10 flex gap-2">
           <Button size="icon" variant="outline" className="rounded-full bg-white/80 backdrop-blur border-gray-200 hover:bg-white text-gray-700" title="3D View">
             <Box className="w-5 h-5" />
           </Button>
           <Button size="icon" variant="outline" className="rounded-full bg-white/80 backdrop-blur border-gray-200 hover:bg-white text-gray-700" title="Zoom">
             <ZoomIn className="w-5 h-5" />
           </Button>
        </div>
        
        <motion.img 
          key={activeImage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          src={images[activeImage]} 
          alt="Product" 
          className="max-h-full max-w-full object-contain drop-shadow-2xl z-0"
        />
        
        {/* Navigation Arrows */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-gray-700 hover:text-team-blue z-20">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-gray-700 hover:text-team-blue z-20">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnails Bottom */}
      <div className="flex gap-3 w-full overflow-x-auto no-scrollbar justify-center">
        {images.map((img, i) => (
          <button 
            key={i}
            onClick={() => setActiveImage(i)}
            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${
              activeImage === i ? "border-team-red ring-2 ring-team-red/20 scale-105" : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-contain p-2" />
          </button>
        ))}
      </div>

      <div className="text-center">
        <button 
          onClick={scrollToSpecs}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-team-blue font-medium transition-colors border-b border-transparent hover:border-team-blue pb-0.5"
        >
          More about the product <ArrowDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function ProductInfo({ product }: { product: Product }) {
  const { toast } = useToast();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [, setLocation] = useLocation();
  
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: "Default", hex: "#000000" });
  const [selectedStorage, setSelectedStorage] = useState(product.storage[0] || "128GB");
  const [currentSku, setCurrentSku] = useState(product.sku || "PROD-SKU");
  
  // Price calculation
  const basePrice = product.price;
  const storagePrice = selectedStorage === "512GB" ? 35000 : 0;
  const currentPrice = basePrice + storagePrice;
  
  // Recalculate monthly price roughly for demo
  const currentMonthlyPrice = Math.round(currentPrice / 24 * 1.2); // Just an estimate logic to show change

  useEffect(() => {
    // Mock SKU generation
    const colorCode = selectedColor.name.substring(0, 3).toUpperCase();
    const storageCode = selectedStorage.replace("GB", "");
    setCurrentSku(`${product.sku || "PROD"}-${colorCode}-${storageCode}`);
  }, [selectedColor, selectedStorage, product.sku]);

  const copySku = () => {
    navigator.clipboard.writeText(currentSku);
    toast({
      title: "Copied!",
      description: `Product code ${currentSku} copied to clipboard.`,
    });
  };

  const queryClient = useQueryClient();
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
        selectedColor: selectedColor.name,
        selectedStorage: selectedStorage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
        selectedColor: selectedColor.name,
        selectedStorage: selectedStorage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/checkout");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        {/* Header Info */}
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">{product.name}</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full h-8 w-8 border-gray-200 ${isFavorite ? 'text-team-red bg-red-50 border-red-100' : 'text-gray-500 hover:text-team-red'}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-team-blue bg-gray-50 px-3 py-1.5 rounded-full transition-colors font-medium">
                <Scale className="w-3.5 h-3.5" />
                Compare
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-900 w-fit" onClick={copySku}>
            <span className="text-xs font-medium">Product Code# {currentSku}</span>
            <Copy className="w-3 h-3" />
          </div>
          
          <div className="flex items-center gap-4 pt-2">
             <div className="flex items-center gap-2 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-md">
               <Check className="w-3.5 h-3.5" />
               In Stock
             </div>
             <div className="h-4 w-px bg-gray-200" />
             <div className="flex items-center gap-2 text-team-red text-xs font-medium">
               <motion.div
                 animate={{ rotate: 180 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
               >
                 <Hourglass className="w-3.5 h-3.5" />
               </motion.div>
               Only 2 left
             </div>
          </div>
        </div>

        <Separator />

        {/* Configurator */}
        <div className="space-y-4">
            <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-gray-900 w-20">Select Color</span>
               <div className="flex gap-2">
                 {product.colors.map((c, i) => (
                   <div 
                     key={i} 
                     className={`group relative w-10 h-10 rounded-lg cursor-pointer transition-all overflow-hidden border-2 ${selectedColor.name === c.name ? 'border-team-blue ring-2 ring-team-blue/20 scale-105' : 'border-gray-200 hover:border-gray-300 hover:scale-105'}`}
                     title={c.name}
                     onClick={() => setSelectedColor(c)}
                   >
                     <img src={honorImage} className="w-full h-full object-cover" alt={c.name} />
                     {/* Overlay to simulate color tint since we use same image */}
                     <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{ backgroundColor: c.hex }} />
                     
                     {selectedColor.name === c.name && (
                       <div className="absolute bottom-0 right-0 bg-team-blue text-white p-0.5 rounded-tl-md">
                         <Check className="w-2 h-2" />
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
            
             <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-gray-900 w-20">Storage</span>
               <div className="flex gap-2">
                 {product.storage.map((s, i) => (
                   <button 
                     key={i} 
                     onClick={() => setSelectedStorage(s)}
                     className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                       selectedStorage === s
                        ? 'border-team-blue bg-team-blue/5 text-team-blue shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                     }`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-gray-900 w-20">SIM Type</span>
               <div className="flex items-center gap-2 text-xs text-gray-700 font-medium bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                  <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                  Nano-SIM + eSIM
               </div>
            </div>
        </div>

        <Separator />

        {/* Price & Actions */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-team-red tracking-tight">{currentPrice.toLocaleString()} ֏</span>
                  {product.oldPrice && (
                     <span className="text-base text-gray-400 line-through decoration-gray-300 decoration-2">
                       {(product.oldPrice + storagePrice).toLocaleString()} ֏
                     </span>
                  )}
               </div>
               <p className="text-[10px] text-gray-500">Includes VAT and all taxes</p>
               <div className="inline-flex items-center gap-1 bg-red-50 text-team-red px-2 py-1 rounded-md text-xs font-bold mt-1">
                 Save 24,000 ֏
               </div>
            </div>
            <CountdownTimer />
          </div>
          
          {/* Credit Price Display */}
          <div className="bg-blue-50/50 rounded-lg p-3 flex items-center justify-between border border-blue-100">
             <div className="flex items-center gap-2">
               <CreditCard className="w-4 h-4 text-team-blue" />
               <span className="text-sm font-medium text-gray-700">Credit price:</span>
             </div>
             <div className="text-right">
               <span className="block font-bold text-team-blue text-lg">{(product.oldPrice ? product.oldPrice + storagePrice : currentPrice).toLocaleString()} ֏</span>
               <span className="text-xs text-gray-500">from {currentMonthlyPrice.toLocaleString()} ֏ /mo</span>
             </div>
          </div>

          <CreditCalculator 
             price={currentPrice} 
             isOpen={calculatorOpen} 
             onToggle={() => setCalculatorOpen(!calculatorOpen)} 
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
              className="w-full border-team-red text-team-red hover:bg-red-50 font-bold h-12 rounded-xl text-base transition-transform active:scale-[0.98]"
            >
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </Button>
            <Button 
              onClick={() => buyNowMutation.mutate()}
              disabled={buyNowMutation.isPending}
              className="w-full bg-team-red hover:bg-red-700 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-red-100 transition-transform active:scale-[0.98]"
            >
              {buyNowMutation.isPending ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <TrustMarks />
      </div>
    </div>
  );
}

export function ProductTabs({ product }: { product: Product }) {
  return (
    <div className="mt-20" id="product-tabs">
      <Tabs defaultValue="desc" className="w-full">
        <div className="border-b border-gray-200">
          <div className="container max-w-[1400px] mx-auto px-4">
            <TabsList className="bg-transparent h-auto p-0 flex w-full">
              <TabsTrigger 
                value="desc" 
                className="w-1/2 rounded-none border-b-2 border-transparent data-[state=active]:border-team-blue data-[state=active]:text-team-blue data-[state=active]:bg-transparent py-6 text-lg font-bold text-gray-500 hover:text-gray-800 transition-colors px-0 justify-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specs" 
                className="w-1/2 rounded-none border-b-2 border-transparent data-[state=active]:border-team-blue data-[state=active]:text-team-blue data-[state=active]:bg-transparent py-6 text-lg font-bold text-gray-500 hover:text-gray-800 transition-colors px-0 justify-center"
              >
                <List className="w-5 h-5 mr-2" />
                Specifications
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="bg-gray-50 min-h-[500px] py-12">
          <div className="container max-w-[1400px] mx-auto px-4">
            
            <TabsContent value="desc" className="mt-0 focus-visible:outline-none">
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center max-w-3xl mx-auto shadow-sm">
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
                 <p className="text-gray-600 leading-relaxed">
                   {product.description || "Discover the magic of technology with the new Honor Magic6 Pro. Featuring a stunning display, powerful processor, and a revolutionary camera system, it redefines what a smartphone can do."}
                 </p>
                 <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="p-6 bg-gray-50 rounded-xl">
                       <h4 className="font-bold mb-2">Display</h4>
                       <p className="text-sm text-gray-500">{product.specs["Display Size"] || '6.8" LTPO OLED with 120Hz refresh rate and 5000 nits peak brightness.'}</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl">
                       <h4 className="font-bold mb-2">Camera</h4>
                       <p className="text-sm text-gray-500">{product.specs["Main Camera"] || 'Triple camera system with 180MP periscope telephoto lens.'}</p>
                    </div>
                 </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-0 focus-visible:outline-none">
              <SpecsTable specs={product.specs} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export function Accessories() {
  const items = [
    { name: "Silicone Case", price: 5000, img: caseImage },
    { name: "Screen Guard", price: 3000, img: glassImage },
    { name: "Wireless Buds", price: 25000, img: budsImage },
    { name: "20W Adapter", price: 8000, img: adapterImage },
  ];

  return (
    <div className="mt-16">
       <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
         Essential Accessories
       </h3>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {items.map((item, i) => (
           <div key={i} className="group cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 hover:border-team-blue/30 hover:shadow-lg transition-all">
             <div className="aspect-square bg-gray-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
               <img src={item.img} className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform" alt={item.name} />
             </div>
             <h4 className="font-bold text-sm text-gray-900 group-hover:text-team-blue mb-1">{item.name}</h4>
             <p className="text-sm text-gray-500">{item.price.toLocaleString()} ֏</p>
             <Button size="sm" variant="outline" className="w-full mt-3 text-xs font-bold border-gray-200 group-hover:border-team-blue group-hover:text-team-blue">Add</Button>
           </div>
         ))}
       </div>
    </div>
  );
}

export function Reviews() {
  return (
    <div className="flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-1/3 space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
        <div className="flex items-baseline gap-4">
           <span className="text-6xl font-bold text-gray-900 tracking-tighter">4.8</span>
           <div className="space-y-1">
             <div className="flex text-yellow-500">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
             </div>
             <p className="text-sm text-gray-500 font-medium">Based on 42 reviews</p>
           </div>
        </div>
        <div className="space-y-3">
          {[5,4,3,2,1].map((star) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-3 font-medium text-gray-600">{star}</span>
              <Progress value={star === 5 ? 80 : star === 4 ? 15 : 5} className="h-2 bg-gray-100" indicatorClassName="bg-yellow-400" />
            </div>
          ))}
        </div>
        <Button className="w-full bg-gray-900 text-white hover:bg-black">Write a Review</Button>
      </div>

      <div className="w-full md:w-2/3 space-y-8">
         {/* Mock Review */}
         <div className="border-b border-gray-100 pb-8">
           <div className="flex justify-between items-start mb-3">
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">AS</div>
               <div>
                 <h4 className="font-bold text-gray-900">Armen S.</h4>
                 <div className="flex text-yellow-500 gap-0.5 mt-1">
                   {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                 </div>
               </div>
             </div>
             <span className="text-xs text-gray-400 font-medium">Verified Purchase • 2 days ago</span>
           </div>
           <p className="text-gray-600 leading-relaxed ml-14">
             Great phone, amazing camera! The battery life is impressive, lasts strictly 2 days. The screen is super bright even under direct sunlight.
           </p>
           <div className="flex gap-4 mt-4 ml-14">
             <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors">
               <ThumbsUp className="w-3 h-3" /> Helpful (12)
             </button>
             <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors">
               <MessageCircle className="w-3 h-3" /> Comment
             </button>
           </div>
         </div>
         
         {/* Mock Review 2 */}
         <div>
           <div className="flex justify-between items-start mb-3">
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">MK</div>
               <div>
                 <h4 className="font-bold text-gray-900">Maria K.</h4>
                 <div className="flex text-yellow-500 gap-0.5 mt-1">
                   {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                 </div>
               </div>
             </div>
             <span className="text-xs text-gray-400 font-medium">Verified Purchase • 1 week ago</span>
           </div>
           <p className="text-gray-600 leading-relaxed ml-14">
             Best Android experience I've had. Fast delivery from Team, got it the next morning.
           </p>
         </div>
      </div>
    </div>
  );
}

export function StickyBar({ product, visible }: { product: Product; visible: boolean }) {
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [, setLocation] = useLocation();
  const productImage = getProductImage(product.imageKey);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });
  const buyNowMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/checkout");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 z-50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] supports-[backdrop-filter]:bg-white/60"
        >
          <div className="container max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="hidden md:flex items-center gap-4">
              <div className="w-14 h-14 border rounded-lg bg-white p-1 shadow-sm">
                 <img src={productImage} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.specs["Storage"] || "256GB"} • {product.specs["Color"] || "Sage Green"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                 <span className="block text-xl font-bold text-team-red">{product.price.toLocaleString()} ֏</span>
                 <span className="block text-[10px] text-gray-500 font-medium">or {product.monthlyPrice?.toLocaleString() || Math.round(product.price / 24).toLocaleString()} ֏ /mo</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="border-team-red text-team-red hover:bg-red-50 font-bold h-11 rounded-lg px-6 transition-transform active:scale-[0.98]"
                  onClick={() => addToCartMutation.mutate()}
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? "Adding..." : "Add"}
                </Button>
                <Button 
                  onClick={() => buyNowMutation.mutate()}
                  disabled={buyNowMutation.isPending}
                  className="bg-team-red hover:bg-red-700 text-white font-bold h-11 rounded-lg px-6 shadow-lg shadow-red-100 transition-transform active:scale-[0.98]"
                >
                  {buyNowMutation.isPending ? "Processing..." : "Buy Now"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OffersAndBenefits() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-16 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
         <h3 className="font-bold text-lg">Available with this product</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* Benefit 1 */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="p-6 hover:bg-gray-50 transition-colors flex gap-4 items-start cursor-pointer group">
               <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600 group-hover:scale-110 transition-transform">
                 <ShoppingBag className="w-6 h-6" />
               </div>
               <div className="text-left">
                 <h4 className="font-bold text-gray-900 mb-1 group-hover:text-team-blue transition-colors">Bundle Discount</h4>
                 <p className="text-sm text-gray-600 mb-3">Save 15,000 ֏ when you buy with Garmin Venu 3S and VLP Adapter.</p>
                 <span className="text-team-blue font-bold text-xs flex items-center">View Bundle <ChevronRight className="w-3 h-3 ml-1" /></span>
               </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>More Profitable Together</DialogTitle>
              <DialogDescription>Save 15,000 ֏ when you buy these items together.</DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-3 gap-6 py-4">
               <div className="flex flex-col items-center text-center p-4 border rounded-xl">
                  <img src={honorImage} className="h-32 object-contain mb-2" />
                  <span className="font-bold text-sm">Honor Magic6 Pro</span>
                  <span className="text-xs text-gray-500">100,000 ֏</span>
               </div>
               <div className="flex flex-col items-center text-center p-4 border rounded-xl relative">
                  <Plus className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 md:block hidden" />
                  <img src={watchImage} className="h-32 object-contain mb-2" />
                  <span className="font-bold text-sm">Garmin Venu 3S</span>
                  <span className="text-xs text-gray-500">10,000 ֏</span>
               </div>
               <div className="flex flex-col items-center text-center p-4 border rounded-xl relative">
                  <Plus className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 md:block hidden" />
                  <img src={adapterImage} className="h-32 object-contain mb-2" />
                  <span className="font-bold text-sm">VLP 20W Adapter</span>
                  <span className="text-xs text-gray-500">15,000 ֏</span>
               </div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
               <div>
                 <span className="block text-sm text-gray-500 line-through">140,000 ֏</span>
                 <span className="block text-2xl font-bold text-team-blue">125,000 ֏</span>
               </div>
               <Button className="bg-team-red hover:bg-red-600 text-white font-bold">Add Bundle to Cart</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Benefit 2 */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="p-6 hover:bg-gray-50 transition-colors flex gap-4 items-start cursor-pointer group">
               <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-600 group-hover:scale-110 transition-transform">
                 <CreditCard className="w-6 h-6" />
               </div>
               <div className="text-left">
                 <h4 className="font-bold text-gray-900 mb-1 group-hover:text-team-blue transition-colors">0% Credit Available</h4>
                 <p className="text-sm text-gray-600 mb-3">Buy now and pay later with 0% interest for the first 12 months with partner banks.</p>
                 <span className="text-team-blue font-bold text-xs flex items-center">Check Eligibility <ChevronRight className="w-3 h-3 ml-1" /></span>
               </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-purple-600" />
                Rocket Line 0%
              </DialogTitle>
              <DialogDescription>
                Special offer for Team Telecom customers.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl text-sm text-purple-900">
                <p className="font-bold mb-2">Buy now, pay later with 0% interest.</p>
                <p className="mb-2">Get approved instantly at checkout. No hidden fees, no paperwork.</p>
                <ul className="list-disc list-inside space-y-1 text-purple-800/80">
                  <li>0% Annual Percentage Rate</li>
                  <li>3-6 months payment term</li>
                  <li>Accessible at order processing stage</li>
                </ul>
              </div>
              <div className="text-xs text-gray-500">
                Simply select "Rocket Line" as your payment method during checkout.
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Got it</Button>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

