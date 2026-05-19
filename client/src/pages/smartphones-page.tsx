import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  CreditCard,
  ShoppingCart,
  Filter,
  X,
  ChevronRight,
  Gift,
  Zap,
  Tag,
  Smartphone,
  Heart,
  Scale,
  Palette,
  Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { getProductImage } from "@/lib/images";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function SmartphonesPage() {
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeDealFilter, setActiveDealFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("popular");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?category=smartphone"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/cart"] });
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

  const buyNowMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/cart"] });
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

  const filteredSmartphones = useMemo(() => {
    if (!products) return [];

    return products
      .filter(p => {
        // Deal Filter
        if (activeDealFilter) {
          if (activeDealFilter === "free-gift" && !p.badges?.some(b => b.text === "Free Gift")) return false;
          if (activeDealFilter === "credit-0" && !p.badges?.some(b => b.text === "Credit 0%")) return false;
          if (activeDealFilter === "discount" && !p.badges?.some(b => b.text === "Sale" || p.discount)) return false;
          if (activeDealFilter === "new" && !p.badges?.some(b => b.text === "New")) return false;
        }

        // Price Range
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

        // Brand Filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "price-asc": return a.price - b.price;
          case "price-desc": return b.price - a.price;
          case "newest": 
            // Prioritize "New" badge for demo
            const aNew = a.badges?.some(b => b.text === "New");
            const bNew = b.badges?.some(b => b.text === "New");
            if (aNew && !bNew) return -1;
            if (!aNew && bNew) return 1;
            return 0;
          default: return 0; // Popular (keep original order)
        }
      });
  }, [products, activeDealFilter, priceRange, selectedBrands, sortOption]);

  const handleFilterClick = (filter: string) => {
    setActiveDealFilter(filter === activeDealFilter ? null : filter);
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-team-blue" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container max-w-[1400px] mx-auto px-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-team-blue">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="font-bold text-gray-900">Smartphones</span>
          </div>

          {/* Deals Filters */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
               <h2 className="text-xl font-bold text-gray-900">Filter by Deal</h2>
               {activeDealFilter && (
                 <Button variant="ghost" onClick={() => setActiveDealFilter(null)} className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
                   <X className="w-4 h-4 mr-1" /> Clear Filter
                 </Button>
               )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div 
                 onClick={() => handleFilterClick("free-gift")}
                 className={`bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "free-gift" ? "ring-2 ring-orange-500 shadow-md bg-orange-50/50" : ""}`}
               >
                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                   <Gift className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-sm text-gray-900">Free Gift</span>
               </div>
               <div 
                 onClick={() => handleFilterClick("credit-0")}
                 className={`bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "credit-0" ? "ring-2 ring-purple-500 shadow-md bg-purple-50/50" : ""}`}
               >
                 <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                   <CreditCard className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-sm text-gray-900">Credit 0%</span>
               </div>
               <div 
                 onClick={() => handleFilterClick("discount")}
                 className={`bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "discount" ? "ring-2 ring-red-500 shadow-md bg-red-50/50" : ""}`}
               >
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                   <Tag className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-sm text-gray-900">Discounts</span>
               </div>
               <div 
                 onClick={() => handleFilterClick("new")}
                 className={`bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:shadow-md transition-all cursor-pointer ${activeDealFilter === "new" ? "ring-2 ring-green-500 shadow-md bg-green-50/50" : ""}`}
               >
                 <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                   <Smartphone className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-sm text-gray-900">New Arrivals</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-team-blue" /> Filters
                </h3>
                
                <Accordion type="multiple" defaultValue={["price", "brand", "color", "sim"]} className="w-full">
                  
                  <AccordionItem value="price">
                    <AccordionTrigger className="text-sm font-bold">Price Range</AccordionTrigger>
                    <AccordionContent>
                       <div className="pt-4 px-2 space-y-4">
                         <Slider 
                           defaultValue={[0, 1000000]} 
                           max={1000000} 
                           step={10000} 
                           value={priceRange}
                           onValueChange={setPriceRange}
                           className="my-4"
                         />
                         <div className="flex justify-between items-center gap-2">
                           <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-medium w-20 text-center">
                             {priceRange[0].toLocaleString()} ֏
                           </div>
                           <span className="text-gray-400">-</span>
                           <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-medium w-20 text-center">
                             {priceRange[1].toLocaleString()} ֏
                           </div>
                         </div>
                       </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="brand">
                    <AccordionTrigger className="text-sm font-bold">Brand</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {["Apple", "Samsung", "Honor", "Xiaomi", "Google", "Realme"].map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`brand-${brand}`} 
                                checked={selectedBrands.includes(brand)}
                                onCheckedChange={() => toggleBrand(brand)}
                            />
                            <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                              {brand}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="color">
                    <AccordionTrigger className="text-sm font-bold">Color</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-5 gap-2 pt-2">
                        {[
                          { name: "Black", class: "bg-black" },
                          { name: "White", class: "bg-white border border-gray-200" },
                          { name: "Gray", class: "bg-gray-500" },
                          { name: "Blue", class: "bg-blue-500" },
                          { name: "Green", class: "bg-green-500" },
                          { name: "Purple", class: "bg-purple-500" },
                          { name: "Red", class: "bg-red-500" },
                          { name: "Gold", class: "bg-yellow-400" },
                          { name: "Silver", class: "bg-gray-200" },
                          { name: "Titanium", class: "bg-stone-400" },
                        ].map((c) => (
                          <div key={c.name} className="flex flex-col items-center gap-1 group cursor-pointer">
                            <div className={`w-8 h-8 rounded-full shadow-sm group-hover:scale-110 transition-transform ${c.class}`} title={c.name}></div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sim">
                    <AccordionTrigger className="text-sm font-bold">SIM Type</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {["SIM", "eSIM", "Dual SIM"].map((sim) => (
                          <div key={sim} className="flex items-center space-x-2">
                            <Checkbox id={`sim-${sim}`} />
                            <label htmlFor={`sim-${sim}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                              {sim}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="memory">
                    <AccordionTrigger className="text-sm font-bold">Internal Memory</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {["64GB", "128GB", "256GB", "512GB", "1TB"].map((mem) => (
                          <div key={mem} className="flex items-center space-x-2">
                            <Checkbox id={`mem-${mem}`} />
                            <label htmlFor={`mem-${mem}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                              {mem}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ram">
                    <AccordionTrigger className="text-sm font-bold">RAM</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {["4GB", "6GB", "8GB", "12GB", "16GB"].map((ram) => (
                          <div key={ram} className="flex items-center space-x-2">
                            <Checkbox id={`ram-${ram}`} />
                            <label htmlFor={`ram-${ram}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                              {ram}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Smartphones</h1>
                  <p className="text-sm text-gray-500">{filteredSmartphones.length} products found</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <Button variant="outline" className="lg:hidden flex-1" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
                     <Filter className="w-4 h-4 mr-2" /> Filters
                   </Button>
                   <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest Arrivals</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSmartphones.map((product) => (
                  <Link href={`/product/${product.id}`} key={product.id}>
                    <div className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-xl transition-all cursor-pointer h-full flex flex-col relative">
                      
                      {/* Action Icons */}
                      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                        <Button size="icon" variant="secondary" className="rounded-full w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm" onClick={(e) => { e.preventDefault(); }}>
                          <Heart className="w-4 h-4 text-gray-600 hover:text-team-red transition-colors" />
                        </Button>
                        <Button size="icon" variant="secondary" className="rounded-full w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm" onClick={(e) => { e.preventDefault(); }}>
                          <Scale className="w-4 h-4 text-gray-600 hover:text-team-blue transition-colors" />
                        </Button>
                      </div>

                      <div className="relative aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden">
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 items-start">
                          {product.badges?.map((badge, i) => (
                             badge.text === "Free Gift" && product.gift ? (
                               <HoverCard key={i}>
                                 <HoverCardTrigger asChild>
                                   <Badge className={`${badge.color} border-none cursor-pointer hover:scale-105 transition-transform`}>{badge.text}</Badge>
                                 </HoverCardTrigger>
                                 <HoverCardContent className="w-64 p-0 overflow-hidden rounded-xl border-gray-100 shadow-xl" align="start">
                                   <div className="bg-gradient-to-br from-orange-50 to-white p-4">
                                      <div className="flex items-center gap-2 text-orange-600 mb-3">
                                        <Gift className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Free Gift Included</span>
                                      </div>
                                      <div className="flex gap-4 items-center">
                                         <div className="w-16 h-16 bg-white rounded-lg p-2 border border-orange-100 shadow-sm flex items-center justify-center">
                                           <img src={getProductImage(product.gift.imageKey)} alt={product.gift.name} className="w-full h-full object-contain" />
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
                               <Badge key={i} className={`${badge.color} border-none`}>{badge.text}</Badge>
                             )
                          ))}
                        </div>
                        {product.discount && (
                           <Badge className="absolute bottom-3 right-3 bg-team-red z-10">{product.discount}</Badge>
                        )}
                        <img src={getProductImage(product.imageKey)} alt={product.name} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="mt-auto space-y-4">
                        <div>
                          <div className="flex justify-between items-start">
                            <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                            
                            {/* Color Swatch Preview */}
                            <div className="flex -space-x-1">
                              <div className="w-3 h-3 rounded-full bg-black border border-white"></div>
                              <div className="w-3 h-3 rounded-full bg-gray-400 border border-white"></div>
                              <div className="w-3 h-3 rounded-full bg-white border border-gray-200"></div>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-team-blue transition-colors line-clamp-1">{product.name}</h3>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-xl text-team-red">{product.price.toLocaleString()} ֏</span>
                            {product.oldPrice && (
                              <span className="text-xs text-gray-400 line-through">{product.oldPrice.toLocaleString()} ֏</span>
                            )}
                          </div>
                          {product.monthlyPrice && (
                            <div className="flex items-center gap-1.5">
                              <div className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold">CREDIT</div>
                              <span className="text-sm font-bold text-gray-700">{product.monthlyPrice.toLocaleString()} ֏/mo</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex gap-2">
                          <Button 
                            className="flex-1 bg-team-blue hover:bg-blue-700 text-white rounded-xl h-11"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCartMutation.mutate(product.id);
                            }}
                            disabled={addToCartMutation.isPending}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" /> Add
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-team-blue text-team-blue hover:bg-blue-50 rounded-xl h-11"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              buyNowMutation.mutate(product.id);
                            }}
                            disabled={buyNowMutation.isPending}
                          >
                            Buy now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredSmartphones.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-6">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                     <Smartphone className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-1">No smartphones found</h3>
                   <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                   <Button variant="link" onClick={() => {
                     setActiveDealFilter(null);
                     setPriceRange([0, 1000000]);
                     setSelectedBrands([]);
                   }} className="text-team-blue mt-2">
                     Clear all filters
                   </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
