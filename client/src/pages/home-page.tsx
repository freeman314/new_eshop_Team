import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  ArrowRight, 
  ChevronRight, 
  Smartphone, 
  Headphones, 
  Wifi, 
  Laptop, 
  Tag, 
  Hash, 
  Router, 
  Zap, 
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  Truck,
  Check,
  Gift,
  Plus,
  MessageCircle,
  Globe,
  X,
  Receipt,
  Plane,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Autoplay from "embla-carousel-autoplay"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product, FeaturedNumber } from "@shared/schema";
import { getProductImage, honorImage, budsImage } from "@/lib/images";
import { useToast } from "@/hooks/use-toast";

// --- Hero Slider Data ---
const heroSlides = [
  {
    id: 1,
    badge: "Special Offer",
    title: "Discover the Magic",
    subtitle: "of",
    highlight: "Honor Magic6 Pro",
    desc: "Experience the future with AI-powered photography and all-day battery life. Now with 0% credit.",
    image: honorImage,
    link: "/product/honor-magic6-pro",
    theme: "blue"
  },
  {
    id: 2,
    badge: "New Arrival",
    title: "iPhone 15 Pro",
    subtitle: "Titanium",
    highlight: "Strong. Light. Pro.",
    desc: "The first iPhone to feature an aerospace-grade titanium design. A17 Pro chip. A pro class GPU.",
    image: honorImage, // Placeholder image
    link: "/product/iphone-15",
    theme: "dark"
  }
];

export default function HomePage() {
  const [activeDealFilter, setActiveDealFilter] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_DURATION = 5000;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: featuredNumbers = [], isLoading: numbersLoading } = useQuery<FeaturedNumber[]>({
    queryKey: ["/api/numbers"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
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

  const addNumberToCartMutation = useMutation({
    mutationFn: async (numberId: number) => {
      await apiRequest("POST", "/api/cart", {
        productId: `number-${numberId}`,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Number has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add number to cart",
        variant: "destructive",
      });
    },
  });

  const buyNumberNowMutation = useMutation({
    mutationFn: async (numberId: number) => {
      await apiRequest("POST", "/api/cart", {
        productId: `number-${numberId}`,
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { name: "Smartphones", icon: Smartphone, color: "text-blue-600 bg-blue-50", link: "/smartphones" },
    { name: "Numbers", icon: Hash, color: "text-purple-600 bg-purple-50", link: "#" },
    { name: "Devices", icon: Laptop, color: "text-orange-600 bg-orange-50", link: "#" },
    { name: "Accessories", icon: Headphones, color: "text-pink-600 bg-pink-50", link: "#" },
    { name: "Connection", icon: Router, color: "text-green-600 bg-green-50", link: "#" },
    { name: "Deals", icon: Zap, color: "text-yellow-600 bg-yellow-50", link: "#" },
  ];

  const allProducts = products.map(p => ({
    ...p,
    image: getProductImage(p.imageKey),
    gift: p.gift ? {
      ...p.gift,
      image: getProductImage(p.gift.imageKey)
    } : null
  }));

  const filteredProducts = activeDealFilter 
    ? allProducts.filter(p => {
        if (activeDealFilter === "free-gift") return p.badges?.some(b => b.text === "Free Gift");
        if (activeDealFilter === "credit-0") return p.badges?.some(b => b.text === "Credit 0%");
        if (activeDealFilter === "discount") return p.badges?.some(b => b.text === "Sale" || p.discount);
        if (activeDealFilter === "new") return p.badges?.some(b => b.text === "New");
        return true;
      })
    : allProducts;

  const trustFeatures = [
    { icon: ShieldCheck, title: "Secure payments", desc: "Your data is protected" },
    { icon: CreditCard, title: "Credit & BNPL", desc: "0% interest available" },
    { icon: Truck, title: "Fast delivery", desc: "1-2 days delivery" },
    { icon: Check, title: "Official retailer", desc: "100% genuine products" },
  ];

  const handleFilterClick = (filter: string) => {
    setActiveDealFilter(filter === activeDealFilter ? null : filter);
    // Smooth scroll to products section
    const element = document.getElementById("featured-products");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const isLoading = productsLoading || numbersLoading;

  return (
    <Layout>
      {/* Menu Section - Positioned at Top */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="container max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {menuItems.map((item, i) => (
              <Link href={item.link} key={i}>
                <a className="group flex flex-col items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-gray-700 group-hover:text-team-blue">{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section Slider */}
      <section className="relative h-[600px] bg-gray-900 text-white overflow-hidden">
        <AnimatePresence mode="wait">
          {heroSlides.map((slide, index) => (
             index === currentSlide && (
               <motion.div
                 key={slide.id}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5 }}
                 className="absolute inset-0 w-full h-full"
               >
                  <div className={`absolute inset-0 ${slide.theme === 'blue' ? 'bg-gradient-to-r from-gray-900 via-gray-900/90 to-team-blue/40' : 'bg-gradient-to-r from-gray-900 to-purple-900/40'} z-10`} />
                  
                  <div className="container max-w-[1400px] mx-auto px-4 h-full relative z-20 flex items-center">
                    <div className="grid md:grid-cols-2 gap-12 w-full items-center">
                      <div className="space-y-6">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <Badge className="bg-team-red hover:bg-team-red/90 mb-4 text-xs font-bold uppercase tracking-wider px-3 py-1">
                            {slide.badge}
                          </Badge>
                          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4">
                            {slide.title} <br/> {slide.subtitle} <span className="text-team-blue">{slide.highlight}</span>
                          </h1>
                          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-lg">
                            {slide.desc}
                          </p>
                          <div className="flex gap-4 pt-4">
                            <Link href={slide.link}>
                              <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold h-12 px-8 rounded-full text-base" data-testid="button-buy-now">
                                Buy Now
                              </Button>
                            </Link>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white h-12 px-8 rounded-full text-base" data-testid="button-learn-more">
                              Learn More
                            </Button>
                          </div>
                        </motion.div>
                      </div>

                      <div className="relative h-[500px] hidden md:block">
                        <motion.div 
                           initial={{ opacity: 0, scale: 0.8, x: 50 }}
                           animate={{ opacity: 1, scale: 1, x: 0 }}
                           transition={{ duration: 0.8, delay: 0.2 }}
                           className="relative w-full h-full flex items-center justify-center"
                        >
                           <div className={`absolute w-[400px] h-[400px] ${slide.theme === 'blue' ? 'bg-team-blue/20' : 'bg-purple-500/20'} blur-[100px] rounded-full`} />
                           <img src={slide.image} alt={slide.title} className="relative z-10 max-h-full object-contain drop-shadow-2xl" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
               </motion.div>
             )
          ))}
        </AnimatePresence>

        {/* Stories Progress Bar */}
        <div className="absolute bottom-8 left-0 right-0 z-30">
          <div className="container max-w-[1400px] mx-auto px-4">
            <div className="flex gap-2 max-w-md">
              {heroSlides.map((_, index) => (
                <div 
                  key={index} 
                  className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                  onClick={() => setCurrentSlide(index)}
                  data-testid={`indicator-slide-${index}`}
                >
                  <motion.div 
                    className="h-full bg-white rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: index === currentSlide ? "100%" : index < currentSlide ? "100%" : "0%" }}
                    transition={{ duration: index === currentSlide ? 5 : 0, ease: "linear" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-[1400px] mx-auto px-4 py-8">

        {/* Featured Best Deals Section */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
             <h2 className="text-2xl font-bold text-gray-900" data-testid="text-best-deals-title">Featured Best Deals</h2>
             {activeDealFilter && (
               <Button variant="ghost" onClick={() => setActiveDealFilter(null)} className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50" data-testid="button-clear-filter">
                 <X className="w-4 h-4 mr-1" /> Clear Filter
               </Button>
             )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div 
               onClick={() => handleFilterClick("free-gift")}
               className={`bg-orange-50 border border-orange-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "free-gift" ? "ring-2 ring-orange-500 shadow-lg scale-105" : ""}`}
               data-testid="filter-free-gift"
             >
               <Gift className="w-8 h-8 text-orange-600" />
               <span className="font-bold text-gray-900">Free Gift with Purchase</span>
             </div>
             <div 
               onClick={() => handleFilterClick("credit-0")}
               className={`bg-purple-50 border border-purple-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "credit-0" ? "ring-2 ring-purple-500 shadow-lg scale-105" : ""}`}
               data-testid="filter-credit-0"
             >
               <CreditCard className="w-8 h-8 text-purple-600" />
               <span className="font-bold text-gray-900">Credit 0%</span>
             </div>
             <div 
               onClick={() => handleFilterClick("discount")}
               className={`bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "discount" ? "ring-2 ring-red-500 shadow-lg scale-105" : ""}`}
               data-testid="filter-discount"
             >
               <Tag className="w-8 h-8 text-red-600" />
               <span className="font-bold text-gray-900">Discount Offers</span>
             </div>
             <div 
               onClick={() => handleFilterClick("new")}
               className={`bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "new" ? "ring-2 ring-green-500 shadow-lg scale-105" : ""}`}
               data-testid="filter-new-arrivals"
             >
               <Smartphone className="w-8 h-8 text-green-600" />
               <span className="font-bold text-gray-900">New Arrivals</span>
             </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-16" id="featured-products">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-featured-products-title">Featured Products {activeDealFilter && <span className="text-team-blue text-lg font-medium ml-2">({filteredProducts.length} items)</span>}</h2>
            <a href="#" className="text-sm font-bold text-team-blue hover:underline flex items-center gap-1" data-testid="link-view-all-products">
              View All Products <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-24" data-testid="status-loading">
              <Loader2 className="w-8 h-8 text-team-blue animate-spin" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <Carousel
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {filteredProducts.map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/3 lg:basis-1/4">
                    <Link href={`/product/${product.id}`}>
                      <div className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-xl transition-all cursor-pointer h-full flex flex-col" data-testid={`card-product-${product.id}`}>
                        <div className="relative aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden">
                          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 items-start">
                            {product.badges?.map((badge, i) => (
                               badge.text === "Free Gift" && product.gift ? (
                                 <HoverCard key={i}>
                                   <HoverCardTrigger asChild>
                                     <Badge className={`${badge.color} border-none cursor-pointer hover:scale-105 transition-transform`} data-testid={`badge-gift-${product.id}`}>{badge.text}</Badge>
                                   </HoverCardTrigger>
                                   <HoverCardContent className="w-64 p-0 overflow-hidden rounded-xl border-gray-100 shadow-xl" align="start">
                                     <div className="bg-gradient-to-br from-orange-50 to-white p-4">
                                        <div className="flex items-center gap-2 text-orange-600 mb-3">
                                          <Gift className="w-4 h-4" />
                                          <span className="text-xs font-bold uppercase tracking-wider">Free Gift Included</span>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                           <div className="w-16 h-16 bg-white rounded-lg p-2 border border-orange-100 shadow-sm flex items-center justify-center">
                                             <img src={product.gift.image} alt={product.gift.name} className="w-full h-full object-contain" />
                                           </div>
                                           <div className="flex-1">
                                              <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{product.gift.name}</h4>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-white text-orange-600 border-orange-100 text-[10px] h-5 px-1.5">FREE</Badge>
                                                <span className="text-xs text-gray-400 line-through">{product.gift.price.toLocaleString()} ֏</span>
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                   </HoverCardContent>
                                 </HoverCard>
                               ) : (
                                 <Badge key={i} className={`${badge.color} border-none`} data-testid={`badge-${i}-${product.id}`}>{badge.text}</Badge>
                               )
                            ))}
                          </div>
                          {product.discount && (
                             <Badge className="absolute bottom-3 right-3 bg-team-red z-10" data-testid={`badge-discount-${product.id}`}>{product.discount}</Badge>
                          )}
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" data-testid={`img-product-${product.id}`} />
                        </div>
                        <div className="mt-auto space-y-4">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-team-blue transition-colors line-clamp-1" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                          
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-xl text-team-red" data-testid={`text-product-price-${product.id}`}>{product.price.toLocaleString()} ֏</span>
                              {product.oldPrice && (
                                <span className="text-xs text-gray-400 line-through" data-testid={`text-product-old-price-${product.id}`}>{product.oldPrice.toLocaleString()} ֏</span>
                              )}
                            </div>
                            {product.monthlyPrice && (
                              <div className="text-xs text-gray-500 font-medium flex items-center gap-1" data-testid={`text-product-monthly-${product.id}`}>
                                 <CreditCard className="w-3 h-3" />
                                 Credit: from {product.monthlyPrice.toLocaleString()} ֏ /mo
                              </div>
                            )}
                          </div>

                          {product.isPreOrder ? (
                             <Button className="w-full bg-team-blue hover:bg-blue-700 text-white font-bold rounded-xl h-10 shadow-md shadow-blue-50 transition-all" data-testid={`button-preorder-${product.id}`}>
                               Pre-order Now
                             </Button>
                          ) : (
                            <Button 
                              className="w-full bg-team-red hover:bg-red-700 text-white font-bold rounded-xl h-10 shadow-md shadow-red-50 transition-all" 
                              data-testid={`button-add-to-cart-${product.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCartMutation.mutate(product.id);
                              }}
                              disabled={addToCartMutation.isPending}
                            >
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          ) : (
             <div className="text-center py-12 bg-gray-50 rounded-2xl" data-testid="status-no-results">
                <p className="text-gray-500 font-medium">No products found matching this filter.</p>
                <Button variant="link" onClick={() => setActiveDealFilter(null)} className="text-team-blue" data-testid="button-reset-filters">Show all products</Button>
             </div>
          )}
        </section>

        {/* Featured Numbers Carousel */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-featured-numbers-title">Featured Numbers</h2>
            <a href="#" className="text-sm font-bold text-team-blue hover:underline flex items-center gap-1" data-testid="link-view-all-numbers">
              View All Numbers <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          
          {isLoading ? (
             <div className="flex justify-center items-center py-12" data-testid="status-loading-numbers">
                <Loader2 className="w-6 h-6 text-team-blue animate-spin" />
             </div>
          ) : (
            <Carousel
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {featuredNumbers.map((num, i) => (
                  <CarouselItem key={i} className="md:basis-1/3 lg:basis-1/4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden h-full" data-testid={`card-number-${num.id}`}>
                       <div className={`absolute top-0 left-0 w-1 h-full ${
                         num.type === "Platinum" ? "bg-gray-900" : 
                         num.type === "Gold" ? "bg-yellow-400" : 
                         num.type === "Silver" ? "bg-gray-400" : "bg-orange-400"
                       }`} />
                       
                       <div className="flex justify-between items-start mb-6">
                         <Badge variant="outline" className={`font-bold ${
                           num.type === "Platinum" ? "text-gray-900 border-gray-900" : 
                           num.type === "Gold" ? "text-yellow-600 border-yellow-600" : 
                           num.type === "Silver" ? "text-gray-500 border-gray-500" : "text-orange-600 border-orange-600"
                         }`} data-testid={`badge-number-type-${num.id}`}>
                           {num.type}
                         </Badge>
                         {num.discount && (
                           <Badge className="bg-team-red text-white border-none font-bold" data-testid={`badge-number-discount-${num.id}`}>-{num.discount}%</Badge>
                         )}
                       </div>

                       <div className="text-2xl font-display font-bold text-gray-900 mb-6 group-hover:text-team-blue transition-colors" data-testid={`text-number-value-${num.id}`}>
                         {num.number}
                       </div>

                       <div className="mt-auto">
                         <div className="flex items-baseline gap-2 mb-4">
                           <span className="text-xl font-bold text-team-red" data-testid={`text-number-price-${num.id}`}>{num.price.toLocaleString()} ֏</span>
                           {num.oldPrice && (
                             <span className="text-sm text-gray-400 line-through" data-testid={`text-number-old-price-${num.id}`}>{num.oldPrice.toLocaleString()} ֏</span>
                           )}
                         </div>
                         <div className="flex gap-2">
                           <Button 
                             className="flex-1 bg-team-red hover:bg-red-700 text-white border-none rounded-xl font-bold transition-all"
                             data-testid={`button-add-number-to-cart-${num.id}`}
                             onClick={(e) => {
                               e.stopPropagation();
                               addNumberToCartMutation.mutate(num.id);
                             }}
                             disabled={addNumberToCartMutation.isPending}
                           >
                             <ShoppingCart className="w-4 h-4 mr-1" />
                             Add to Cart
                           </Button>
                           <Button 
                             className="flex-1 bg-gray-50 hover:bg-team-blue hover:text-white text-gray-900 border-none rounded-xl font-bold transition-all"
                             data-testid={`button-buy-number-${num.id}`}
                             onClick={(e) => {
                               e.stopPropagation();
                               buyNumberNowMutation.mutate(num.id);
                             }}
                             disabled={buyNumberNowMutation.isPending}
                           >
                             Buy Now
                           </Button>
                         </div>
                       </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          )}
        </section>

        {/* Info & Banner Section */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-team-blue to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden group">
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <Badge className="bg-white/20 text-white border-none">Special Offer</Badge>
                  <h3 className="text-3xl font-bold font-display">Upgrade to 5G</h3>
                  <p className="text-blue-100 max-w-xs">Switch to a new 5G smartphone and get 100GB of free data for 3 months.</p>
                </div>
                <Button className="w-fit bg-white text-team-blue hover:bg-gray-100 font-bold rounded-xl mt-8">
                  Check Eligibility
                </Button>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl group-hover:bg-white/20 transition-all" />
             <Wifi className="absolute bottom-8 right-8 w-32 h-32 text-white/5 -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
          
          <div className="bg-gray-100 rounded-3xl p-8 relative overflow-hidden group">
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <Badge className="bg-gray-200 text-gray-700 border-none">Customer Program</Badge>
                  <h3 className="text-3xl font-bold font-display text-gray-900">Trade-in Program</h3>
                  <p className="text-gray-600 max-w-xs">Get up to 250,000 ֏ credit towards your new phone when you trade in your old device.</p>
                </div>
                <Button className="w-fit bg-gray-900 text-white hover:bg-gray-800 font-bold rounded-xl mt-8">
                  Get Appraisal
                </Button>
             </div>
             <Smartphone className="absolute bottom-8 right-8 w-32 h-32 text-black/5 -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
        </section>

        {/* Why choose Team section */}
        <section className="bg-gray-50 rounded-[40px] p-8 md:p-16 mb-16">
           <div className="max-w-4xl mx-auto text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why choose Team Telecom Armenia</h2>
             <p className="text-gray-500 text-lg">We provide more than just connection - we provide a seamless digital experience with the best devices and service.</p>
           </div>
           
           <div className="grid md:grid-cols-4 gap-8">
             {trustFeatures.map((feature, i) => (
               <div key={i} className="flex flex-col items-center text-center space-y-4 group">
                 <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-team-blue group-hover:bg-team-blue group-hover:text-white transition-all transform group-hover:-translate-y-1">
                   <feature.icon className="w-8 h-8" />
                 </div>
                 <h4 className="font-bold text-gray-900 text-lg">{feature.title}</h4>
                 <p className="text-gray-500 text-sm">{feature.desc}</p>
               </div>
             ))}
           </div>
        </section>

        {/* Bottom Banner */}
        <section className="bg-gray-900 rounded-[40px] p-8 md:p-16 text-white overflow-hidden relative">
           <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">Join the fastest network in Armenia</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-team-blue flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-lg">Broadest 4G/LTE coverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-team-blue flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-lg">Expanding 5G network</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-team-blue flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-lg">Reliable fiber internet for home</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-team-blue hover:bg-blue-600 text-white h-12 px-8 rounded-full font-bold">Explore Plans</Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 rounded-full font-bold">Check Coverage</Button>
                </div>
              </div>
              
              <div className="hidden md:flex justify-end">
                <div className="relative">
                   <div className="w-[400px] h-[400px] rounded-full border border-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping duration-[3000ms]" />
                   <div className="w-[300px] h-[300px] rounded-full border border-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                   <div className="w-48 h-48 bg-team-blue rounded-full blur-[80px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                   <Globe className="w-32 h-32 text-white relative z-10" />
                </div>
              </div>
           </div>
           
           <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-team-blue/10 blur-[120px]" />
        </section>

      </div>
    </Layout>
  );
}
