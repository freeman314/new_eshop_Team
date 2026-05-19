
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, Hourglass, CreditCard, ChevronUp, ChevronDown, Calculator, ShieldCheck, Clock, Truck, Gift, RefreshCcw, CheckCircle2 } from "lucide-react";
import { OffersAndBenefits } from "@/components/pdp-sections";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProductImage } from "@/lib/images";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getSessionId } from "@/lib/session";
import { Skeleton } from "@/components/ui/skeleton";
import { type CartItem, type Product, type FeaturedNumber } from "@shared/schema";

function CartTrustBadges() {
  const badges = [
    { icon: ShieldCheck, text: "Secure Payment" },
    { icon: Clock, text: "Delivery within 1-2 days" },
    { icon: Truck, text: "Free shipping in Yerevan" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {badges.map((b, i) => (
        <div key={i} className="flex items-center justify-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="p-2 bg-white rounded-full text-team-blue shadow-sm">
            <b.icon className="w-5 h-5" />
          </div>
          <span className="font-bold text-gray-700 text-sm">{b.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const sessionId = getSessionId();

  // Fetch cart items
  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    meta: {
      headers: { "x-session-id": sessionId }
    }
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: featuredNumbers = [] } = useQuery<FeaturedNumber[]>({
    queryKey: ["/api/numbers"]
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  // Mutation for removing item
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  // Mutation for changing gift
  const updateGiftMutation = useMutation({
    mutationFn: async ({ id, giftId }: { id: number; giftId: string }) => {
      const res = await apiRequest("PATCH", `/api/cart/${id}`, { selectedGiftId: giftId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  const enrichedCartItems = useMemo(() => {
    return cartItems.map(item => {
      if (item.productId.startsWith("number-")) {
        const numberId = parseInt(item.productId.replace("number-", ""));
        const num = featuredNumbers.find(n => n.id === numberId);
        if (!num) return null;
        const pseudoProduct: Partial<Product> = {
          id: item.productId,
          name: `${num.type} Number: ${num.number}`,
          price: num.price,
          oldPrice: num.oldPrice,
          monthlyPrice: null,
          imageKey: "number_sim",
          brand: "Team Telecom",
          category: "number",
          memory: null,
          color: null,
          gift: null,
          discount: num.oldPrice ? `Save ${(num.oldPrice - num.price).toLocaleString()} ֏` : null,
          badges: [{ text: num.type, color: "bg-blue-100 text-team-blue" }],
          colors: [],
          storage: [],
        };
        return { ...item, product: pseudoProduct as Product };
      }
      const product = products.find(p => p.id === item.productId);
      return { ...item, product };
    }).filter(item => item && item.product) as (CartItem & { product: Product })[];
  }, [cartItems, products, featuredNumbers]);

  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0 && !hasInitializedSelection) {
      setSelectedItemIds(cartItems.map(item => item.id));
      setHasInitializedSelection(true);
    }
  }, [cartItems, hasInitializedSelection]);

  const availableGifts = [
    {
      id: "buds",
      name: "Wireless Earbuds",
      desc: "White / Active Noise Cancellation",
      price: 25000,
      imageKey: "wireless_earbuds",
      type: "Audio"
    },
    {
      id: "case",
      name: "Protective Case",
      desc: "Matte Black / Silicone / Shockproof",
      price: 15000,
      imageKey: "transparent_phone_case",
      type: "Accessory"
    },
    {
      id: "charger",
      name: "Fast Charger 20W",
      desc: "White / USB-C Power Adapter",
      price: 12000,
      imageKey: "vlp_20w_adapter",
      type: "Power"
    }
  ];

  const totalAmount = enrichedCartItems
    .filter(item => selectedItemIds.includes(item.id))
    .reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);

  const toggleItemSelection = (id: number) => {
    setSelectedItemIds(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === enrichedCartItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(enrichedCartItems.map(item => item.id));
    }
  };

  const isAllSelected = enrichedCartItems.length > 0 && selectedItemIds.length === enrichedCartItems.length;

  if (isLoadingCart || isLoadingProducts) {
    return (
      <Layout>
        <div className="container max-w-[1400px] mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-8">
                <Skeleton className="w-24 h-24 rounded-xl" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart</h1>

        {enrichedCartItems.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/smartphones">
              <Button className="bg-team-blue hover:bg-blue-700 text-white font-bold px-8 rounded-xl">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      className="data-[state=checked]:bg-team-blue data-[state=checked]:border-team-blue"
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-bold text-gray-700 cursor-pointer select-none"
                    >
                      Select All ({enrichedCartItems.length})
                    </label>
                 </div>
                 <div className="h-4 w-px bg-gray-200 mx-2"></div>
                 <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wide">Items</h2>
              </div>

              <div className="p-6 space-y-8">
                {enrichedCartItems.map((item) => {
                  const product = item.product!;
                  const selectedGift = availableGifts.find(g => g.id === item.selectedGiftId) || availableGifts[0];
                  const discountPercent = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

                  return (
                    <div key={item.id}>
                      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedItemIds.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                          className="data-[state=checked]:bg-team-blue data-[state=checked]:border-team-blue"
                        />

                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl p-2 relative">
                          <img src={getProductImage(product.imageKey)} alt={product.name} className="w-full h-full object-contain" />
                          {discountPercent > 0 && (
                            <Badge className="absolute -top-2 -right-2 bg-team-red text-white hover:bg-team-red text-[10px] px-1.5 py-0.5 h-auto z-10">
                              -{discountPercent}%
                            </Badge>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-grow text-center md:text-left space-y-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                            {(product.memory || product.color) && (
                              <p className="text-sm text-gray-500 font-medium mt-1">
                                {item.selectedStorage || product.memory} / {item.selectedColor || product.color}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-center md:justify-start gap-2 text-team-red text-xs font-medium">
                              <motion.div
                                animate={{ rotate: 180 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                              >
                                <Hourglass className="w-3.5 h-3.5" />
                              </motion.div>
                              Only 2 left
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium">Quantity</span>
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-team-blue hover:bg-gray-50 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center font-bold text-gray-900 text-sm border-x border-gray-200">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-team-blue hover:bg-gray-50 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col items-center md:items-end gap-1 w-32">
                            <span className="text-xs text-gray-400 font-medium">Price</span>
                            <span className="text-xl font-bold text-gray-900">{(product.price * item.quantity).toLocaleString()} ֏</span>
                            {product.oldPrice && (
                              <span className="text-sm text-gray-400 line-through decoration-gray-300 decoration-2">
                                {(product.oldPrice * item.quantity).toLocaleString()} ֏
                              </span>
                            )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItemMutation.mutate(item.id)}
                          className="text-gray-400 hover:text-team-red transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Gift Item - only show for products that have a gift */}
                      {selectedItemIds.includes(item.id) && product.gift && (
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 pt-6 border-t border-gray-100 mt-6 bg-purple-50/30 -mx-6 px-6 py-6 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ml-8 md:ml-12 border-l-2 border-l-purple-200 rounded-r-xl">
                          <div className="w-24 h-24 flex-shrink-0 bg-white rounded-xl p-2 relative border border-purple-100 group ml-0 md:ml-0">
                            <img src={getProductImage(selectedGift.imageKey)} alt={selectedGift.name} className="w-full h-full object-contain" />
                            <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white hover:bg-purple-700 text-[10px] px-2 py-0.5 h-auto z-10">
                              FREE
                            </Badge>
                          </div>

                          <div className="flex-grow text-center md:text-left space-y-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{selectedGift.name}</h3>
                              <p className="text-sm text-gray-500 font-medium mt-1">{selectedGift.desc}</p>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-3">
                               <div className="flex items-center gap-2 text-purple-600 text-xs font-bold bg-white w-fit px-2 py-1 rounded-md border border-purple-100">
                                  <Gift className="w-3.5 h-3.5" />
                                  Gift with purchase
                               </div>

                               <Dialog open={isGiftDialogOpen} onOpenChange={setIsGiftDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-team-blue hover:text-team-blue/80 hover:bg-blue-50 px-2">
                                      <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Change Gift
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Choose Your Free Gift</DialogTitle>
                                      <DialogDescription>
                                        Select one of the available gifts to add to your order for free.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      {availableGifts.map((gift) => (
                                         <div
                                           key={gift.id}
                                           className={cn(
                                             "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:bg-gray-50",
                                             item.selectedGiftId === gift.id ? "border-purple-500 bg-purple-50/50 ring-1 ring-purple-500" : "border-gray-200"
                                           )}
                                           onClick={() => updateGiftMutation.mutate({ id: item.id, giftId: gift.id })}
                                         >
                                            <div className="w-16 h-16 bg-white rounded-lg p-2 border border-gray-100 flex-shrink-0">
                                               <img src={getProductImage(gift.imageKey)} alt={gift.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1">
                                               <div className="flex justify-between items-start">
                                                  <h4 className="font-bold text-gray-900">{gift.name}</h4>
                                                  {item.selectedGiftId === gift.id && (
                                                     <CheckCircle2 className="w-5 h-5 text-purple-600 fill-purple-100" />
                                                  )}
                                               </div>
                                               <p className="text-xs text-gray-500 mt-1 line-clamp-1">{gift.desc}</p>
                                               <div className="flex items-center gap-2 mt-2">
                                                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px] h-5 hover:bg-purple-200 border-none">FREE</Badge>
                                                  <span className="text-xs text-gray-400 line-through">{gift.price.toLocaleString()} ֏</span>
                                               </div>
                                            </div>
                                         </div>
                                      ))}
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button type="button" className="w-full sm:w-auto bg-team-blue hover:bg-blue-700">
                                          Confirm Selection
                                        </Button>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                               </Dialog>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                              <span className="text-xs text-gray-400 font-medium">Quantity</span>
                              <div className="flex items-center border border-gray-200 rounded-lg bg-white opacity-60">
                                <button disabled className="w-8 h-8 flex items-center justify-center text-gray-300 rounded-l-lg cursor-not-allowed">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <div className="w-10 h-8 flex items-center justify-center font-bold text-gray-900 text-sm border-x border-gray-200">
                                  1
                                </div>
                                <button disabled className="w-8 h-8 flex items-center justify-center text-gray-300 rounded-r-lg cursor-not-allowed">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                          </div>

                          <div className="flex flex-col items-center md:items-end gap-1 w-32">
                              <span className="text-xs text-gray-400 font-medium">Price</span>
                              <span className="text-xl font-bold text-team-red">0 ֏</span>
                              <span className="text-sm text-gray-400 line-through decoration-gray-300 decoration-2">
                                {selectedGift.price.toLocaleString()} ֏
                              </span>
                          </div>
                          <div className="w-9 h-9"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Price & Buy Button */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4 md:mb-0 flex items-center gap-4">
                 <div className="text-gray-500 font-medium">
                   Selected Items: <span className="font-bold text-gray-900">{selectedItemIds.length}</span>
                 </div>
                 <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
                 <span className="text-gray-500 font-medium hidden md:inline">Total price:</span>
               </div>
               <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                  <span className="text-3xl font-bold text-gray-900">{totalAmount.toLocaleString()} ֏</span>
                    <Button
                      disabled={selectedItemIds.length === 0}
                      className={cn(
                        "font-bold h-12 px-12 rounded-xl text-lg shadow-lg transition-all active:scale-[0.98] w-full md:w-auto",
                        selectedItemIds.length > 0
                          ? "bg-team-red hover:bg-red-700 text-white shadow-red-100"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      )}
                      onClick={() => {
                        if (selectedItemIds.length > 0) {
                          sessionStorage.setItem("checkoutItemIds", JSON.stringify(selectedItemIds));
                          window.location.href = "/checkout";
                        }
                      }}
                    >
                      Buy ({selectedItemIds.length})
                    </Button>
               </div>
            </div>
          </>
        )}

        <CartTrustBadges />

        <div className="mb-16">
          <OffersAndBenefits />
        </div>
      </div>
    </Layout>
  );
}
