import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getSessionId } from "@/lib/session";
import { getProductImage } from "@/lib/images";
import { useLocation } from "wouter";
import { 
  CreditCard, 
  Store, 
  Truck, 
  Wallet, 
  Landmark, 
  FileText, 
  Info,
  ShieldCheck,
  Coins,
  Banknote,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, CartItem, FeaturedNumber } from "@shared/schema";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [paymentType, setPaymentType] = useState("full"); // "full" | "credit"
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [promoType, setPromoType] = useState("code"); // "code" | "coins"
  const [onlinePaymentMethod, setOnlinePaymentMethod] = useState<string | null>(null); // "card" | "idram" | "ameria"
  const [paymentTab, setPaymentTab] = useState("online"); // "online" | "cash"
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("yerevan");
  const [district, setDistrict] = useState("kentron");
  const [address, setAddress] = useState("");
  const [selectedStore, setSelectedStore] = useState("");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState("");

  const sessionId = getSessionId();

  const selectedIdsFromCart = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("checkoutItemIds");
      if (stored) {
        sessionStorage.removeItem("checkoutItemIds");
        return JSON.parse(stored) as number[];
      }
      return null;
    } catch { return null; }
  }, []);

  const { data: rawCartItems = [], isLoading: isLoadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: featuredNumbers = [] } = useQuery<FeaturedNumber[]>({
    queryKey: ["/api/numbers"],
  });

  const cartItems = useMemo(() => {
    const filteredItems = selectedIdsFromCart 
      ? rawCartItems.filter(item => selectedIdsFromCart.includes(item.id))
      : rawCartItems;

    return filteredItems.map(item => {
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
          gift: null,
          discount: null,
          badges: [],
          colors: [],
          storage: [],
        };
        return { ...item, product: pseudoProduct as Product };
      }
      const product = products.find(p => p.id === item.productId);
      return { ...item, product };
    }).filter(item => item && item.product) as (CartItem & { product: Product })[];
  }, [rawCartItems, products, featuredNumbers, selectedIdsFromCart]);

  const validatePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/promo/validate", { code });
      return res.json();
    },
    onSuccess: (data) => {
      setAppliedPromo(data);
      setPromoError("");
    },
    onError: (error: Error) => {
      setPromoError(error.message);
      setAppliedPromo(null);
    },
  });

  const submitOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/");
    },
  });

  const { fullPrice, creditPrice, items } = useMemo(() => {
    let full = 0;
    let credit = 0;
    const itemsList = cartItems.map(item => {
      full += item.product.price * item.quantity;
      credit += (item.product.monthlyPrice || Math.round(item.product.price * 1.1 / 24)) * 24 * item.quantity;
      return {
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        imageKey: item.product.imageKey,
        gift: item.product.gift
      };
    });
    return { fullPrice: full, creditPrice: credit, items: itemsList };
  }, [cartItems]);
  
  const discountAmount = useMemo(() => {
    if (appliedPromo && paymentType === "full") {
      return Math.round(fullPrice * (appliedPromo.discountPercent / 100));
    }
    return 0;
  }, [appliedPromo, paymentType, fullPrice]);

  const currentPrice = (paymentType === "full" ? fullPrice : creditPrice) - discountAmount;

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    validatePromoMutation.mutate(promoCode);
  };

  const handleSubmitOrder = () => {
    const orderData = {
      customerName,
      phone,
      email,
      deliveryMethod,
      address: deliveryMethod === "delivery" ? address : null,
      region: deliveryMethod === "delivery" ? region : null,
      district: deliveryMethod === "delivery" ? district : null,
      store: deliveryMethod === "pickup" ? selectedStore : null,
      paymentType,
      paymentMethod: paymentType === "full" ? (paymentTab === "online" ? onlinePaymentMethod : "cash") : null,
      bank: paymentType === "credit" ? selectedBank : null,
      promoCode: appliedPromo?.code,
      discountAmount,
      subtotal: paymentType === "full" ? fullPrice : creditPrice,
      total: currentPrice,
      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        gift: i.gift?.name
      })),
      sessionId
    };

    submitOrderMutation.mutate(orderData);
  };
  
  const getOnlinePaymentLabel = () => {
    if (paymentTab === "cash") {
      return "Pay";
    }
    
    switch(onlinePaymentMethod) {
      case "card": return `Pay ${currentPrice.toLocaleString()} ֏`;
      case "idram": return "Pay via Idram";
      case "ameria": return "Pay via My Ameria";
      default: return "Pay";
    }
  };

  if (isLoadingCart || isLoadingProducts) {
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
      <div className="container max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Processing</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Checkout Form */}
          <div className="flex-1 space-y-6">
            
            {/* Payment Method Selection - Top Highlighted Section */}
            <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
               <Tabs defaultValue="full" onValueChange={setPaymentType} className="w-full">
                 <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl h-14">
                   <TabsTrigger 
                     value="full" 
                     className="rounded-lg h-12 font-bold text-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-team-blue transition-all"
                   >
                     Pay in full
                   </TabsTrigger>
                   <TabsTrigger 
                     value="credit" 
                     className="rounded-lg h-12 font-bold text-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-team-blue transition-all"
                   >
                     Pay in installments
                   </TabsTrigger>
                 </TabsList>
               </Tabs>
            </div>

            {/* Product Review & Promo */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                 <h2 className="text-lg font-bold mb-6">Order Details</h2>

                 {items.map((item, idx) => (
                   <div key={idx} className="space-y-4 mb-4">
                     <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-lg p-2 border border-gray-100 flex-shrink-0">
                           <img src={getProductImage(item.imageKey)} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-bold text-gray-900">{item.name}</h3>
                           <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-lg">{paymentType === "full" ? (item.price * item.quantity).toLocaleString() : (Math.round(item.price * 1.1 / 24) * 24 * item.quantity).toLocaleString()} ֏</div>
                        </div>
                     </div>
                     
                     {item.gift && (
                       <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                          <div className="w-16 h-16 bg-white rounded-lg p-2 border border-purple-100 flex-shrink-0">
                             <img src={getProductImage(item.gift.imageKey)} alt={item.gift.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-2">
                               <h3 className="font-bold text-gray-900">{item.gift.name}</h3>
                               <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] h-5">GIFT</Badge>
                             </div>
                             <p className="text-sm text-gray-500">Free Gift</p>
                          </div>
                          <div className="text-right">
                             <div className="font-bold text-lg text-team-red">FREE</div>
                          </div>
                       </div>
                     )}
                   </div>
                 ))}

                 {/* Promo Section */}
                 <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="font-bold text-gray-700 flex items-center gap-2">
                        Promo & Rewards <Info className="w-4 h-4 text-gray-400" />
                      </Label>
                    </div>
                    
                    <Tabs defaultValue="code" onValueChange={setPromoType} className="w-full">
                       <TabsList className="grid w-full grid-cols-2 mb-4 bg-white border border-gray-200 p-1 rounded-lg h-10">
                          <TabsTrigger value="code" className="rounded-md text-xs font-bold h-8">Promo Code</TabsTrigger>
                          <TabsTrigger value="coins" className="rounded-md text-xs font-bold h-8">Team Coins</TabsTrigger>
                       </TabsList>
                       
                       <TabsContent value="code" className="mt-0">
                          <div className="flex flex-col gap-2">
                             <div className="flex gap-2">
                                <Input 
                                  placeholder="Enter promo code" 
                                  className="bg-white border-gray-200" 
                                  value={promoCode}
                                  onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <Button 
                                  variant="outline" 
                                  className="font-bold border-gray-200 hover:bg-white hover:text-team-blue hover:border-team-blue px-6"
                                  onClick={handleApplyPromo}
                                  disabled={validatePromoMutation.isPending}
                                >
                                  {validatePromoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                </Button>
                             </div>
                             {promoError && <p className="text-xs text-red-500 font-medium ml-1">{promoError}</p>}
                             {appliedPromo && (
                               <p className="text-xs text-green-600 font-medium ml-1 flex items-center gap-1">
                                 <CheckCircle2 className="w-3 h-3" /> Code applied! {appliedPromo.discountPercent}% discount
                               </p>
                             )}
                          </div>
                       </TabsContent>
                       
                       <TabsContent value="coins" className="mt-0">
                          <div className="flex flex-col gap-3">
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><Coins className="w-4 h-4 text-yellow-500" /> Available Balance:</span>
                                <span className="font-bold text-gray-900">1,250 Coins</span>
                             </div>
                             <div className="flex gap-2">
                                <Input type="number" placeholder="Amount to redeem" className="bg-white border-gray-200" />
                                <Button variant="outline" className="font-bold border-gray-200 hover:bg-white hover:text-team-blue hover:border-team-blue px-6">Redeem</Button>
                             </div>
                          </div>
                       </TabsContent>
                    </Tabs>
                 </div>
            </div>

            {/* Unified Contact & Delivery */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
               <h2 className="text-lg font-bold mb-6">Contact & Delivery</h2>
               
               <div className="grid md:grid-cols-2 gap-6 mb-8 border-b border-gray-100 pb-8">
                  <div className="space-y-2">
                     <Label htmlFor="name" className="font-medium text-gray-600">First name and Surname*</Label>
                     <Input 
                       id="name" 
                       placeholder="John Doe" 
                       className="bg-gray-50 border-gray-200 h-11" 
                       value={customerName}
                       onChange={(e) => setCustomerName(e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="phone" className="font-medium text-gray-600">Phone number*</Label>
                     <div className="flex">
                        <div className="flex items-center justify-center bg-gray-100 border border-gray-200 border-r-0 rounded-l-lg px-3">
                           <img src="https://flagcdn.com/w20/am.png" alt="AM" className="w-5" />
                           <span className="text-sm font-medium ml-2 text-gray-600">+374</span>
                        </div>
                        <Input 
                          id="phone" 
                          className="bg-gray-50 border-gray-200 rounded-l-none h-11" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <Label htmlFor="email" className="font-medium text-gray-600">E-mail*</Label>
                     <Input 
                       id="email" 
                       type="email" 
                       placeholder="example@email.com" 
                       className="bg-gray-50 border-gray-200 h-11" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                     />
                  </div>
               </div>
               
               <Tabs defaultValue="delivery" onValueChange={setDeliveryMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl h-12">
                     <TabsTrigger 
                        value="delivery" 
                        className="rounded-lg h-10 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 justify-center"
                     >
                        <Truck className="w-4 h-4" /> Delivery
                     </TabsTrigger>
                     <TabsTrigger 
                        value="pickup" 
                        className="rounded-lg h-10 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 justify-center"
                     >
                        <Store className="w-4 h-4" /> Pickup in store
                     </TabsTrigger>
                  </TabsList>

                  <TabsContent value="delivery" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300 mt-0">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="font-medium text-gray-600">Region*</Label>
                           <Select value={region} onValueChange={setRegion}>
                              <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                                 <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="yerevan">Yerevan</SelectItem>
                                 <SelectItem value="kotayk">Kotayk</SelectItem>
                                 <SelectItem value="lori">Lori</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label className="font-medium text-gray-600">District*</Label>
                           <Select value={district} onValueChange={setDistrict}>
                              <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                                 <SelectValue placeholder="Select district" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="kentron">Kentron</SelectItem>
                                 <SelectItem value="arabkir">Arabkir</SelectItem>
                                 <SelectItem value="davtashen">Davtashen</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                           <Label className="font-medium text-gray-600">Address*</Label>
                           <Input 
                             placeholder="Street, building, apartment" 
                             className="bg-gray-50 border-gray-200 h-11" 
                             value={address}
                             onChange={(e) => setAddress(e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start text-sm text-blue-700">
                        <Info className="w-5 h-5 shrink-0" />
                        Your order will be ready for pickup within 2 hours after confirmation. Please bring your ID.
                     </div>
                  </TabsContent>
                  
                  <TabsContent value="pickup" className="animate-in fade-in slide-in-from-right-2 duration-300 mt-0">
                     <div className="space-y-4">
                        <Label className="font-medium text-gray-600">Select Store</Label>
                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                           <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                              <SelectValue placeholder="Choose a store near you" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="northern-ave">Northern Ave 1</SelectItem>
                              <SelectItem value="amiryan">Amiryan 3</SelectItem>
                              <SelectItem value="komitas">Komitas 24</SelectItem>
                           </SelectContent>
                        </Select>
                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start text-sm text-blue-700">
                           <Info className="w-5 h-5 shrink-0" />
                           Your order will be ready for pickup within 2 hours after confirmation. Please bring your ID.
                        </div>
                     </div>
                  </TabsContent>
               </Tabs>
            </div>

            {/* Payment / Credit Section */}
            {paymentType === "full" ? (
               <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                  
                  <Tabs defaultValue="online" onValueChange={setPaymentTab} className="w-full">
                     <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl h-12">
                        <TabsTrigger 
                           value="online" 
                           className="rounded-lg h-10 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 justify-center"
                        >
                           <CreditCard className="w-4 h-4" /> Online
                        </TabsTrigger>
                        <TabsTrigger 
                           value="cash" 
                           className="rounded-lg h-10 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 justify-center"
                        >
                           <Banknote className="w-4 h-4" /> Cash
                        </TabsTrigger>
                     </TabsList>

                     <TabsContent value="online" className="mt-0">
                        <RadioGroup 
                           value={onlinePaymentMethod || ""} 
                           onValueChange={setOnlinePaymentMethod}
                           className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                           {/* Bank Card (First) */}
                           <label className="relative flex flex-col items-center justify-center gap-3 p-4 h-32 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-team-blue hover:bg-blue-50/10 transition-all has-[:checked]:border-team-blue has-[:checked]:bg-blue-50/20 text-center">
                              <RadioGroupItem value="card" className="sr-only" />
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                 <CreditCard className="w-5 h-5" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-gray-900 text-sm">Bank card</h3>
                                 <div className="flex gap-1 mt-1 justify-center">
                                    <span className="text-[9px] font-bold px-1 bg-gray-100 rounded text-blue-800">VISA</span>
                                    <span className="text-[9px] font-bold px-1 bg-gray-100 rounded text-red-600">MasterCard</span>
                                 </div>
                              </div>
                              <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 transition-opacity text-team-blue">
                                 <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                              </div>
                           </label>

                           {/* Idram (Second) */}
                           <label className="relative flex flex-col items-center justify-center gap-3 p-4 h-32 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-team-blue hover:bg-blue-50/10 transition-all has-[:checked]:border-team-blue has-[:checked]:bg-blue-50/20 text-center">
                              <RadioGroupItem value="idram" className="sr-only" />
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
                                 <Wallet className="w-5 h-5" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-gray-900 text-sm">Idram</h3>
                                 <p className="text-[10px] text-gray-500 mt-1">Wallet / Rocket Line</p>
                              </div>
                              <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 transition-opacity text-team-blue">
                                 <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                              </div>
                           </label>

                           {/* My Ameria (Third) */}
                           <label className="relative flex flex-col items-center justify-center gap-3 p-4 h-32 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-team-blue hover:bg-blue-50/10 transition-all has-[:checked]:border-team-blue has-[:checked]:bg-blue-50/20 text-center">
                              <RadioGroupItem value="ameria" className="sr-only" />
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                                 <Landmark className="w-5 h-5" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-gray-900 text-sm">My Ameria</h3>
                                 <p className="text-[10px] text-gray-500 mt-1">Account / MyPay</p>
                              </div>
                              <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 transition-opacity text-team-blue">
                                 <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                              </div>
                           </label>
                        </RadioGroup>
                     </TabsContent>

                     <TabsContent value="cash" className="mt-0">
                        <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-200">
                           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-green-600">
                              <Banknote className="w-8 h-8" />
                           </div>
                           <h3 className="font-bold text-lg text-gray-900 mb-2">Pay Cash</h3>
                           <p className="text-gray-500 max-w-sm">
                              You can pay in cash when you receive your order at the store or upon delivery.
                              Please prepare the exact amount if possible.
                           </p>
                        </div>
                     </TabsContent>
                  </Tabs>
               </div>
            ) : (
               <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Bank</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                     {[
                        { id: 'ineco', name: 'Ineco Bank', logo: "/src/assets/bank_logos/ineco.png" },
                        { id: 'acba', name: 'ACBA Bank', logo: "/src/assets/bank_logos/acba.png" },
                        { id: 'vtb', name: 'VTB Bank', logo: "/src/assets/bank_logos/vtb.png" },
                        { id: 'ameria', name: 'Ameria Bank', logo: "/src/assets/bank_logos/ameria.webp" },
                        { id: 'evoca', name: 'Evoca Bank', logo: "/src/assets/bank_logos/evoca.png" },
                        { id: 'id', name: 'ID Bank', logo: "/src/assets/bank_logos/id_bank.png" }
                     ].map((bank) => (
                        <label 
                           key={bank.id} 
                           className={cn(
                             "relative flex flex-col items-center justify-center gap-3 p-4 h-32 rounded-xl border-2 cursor-pointer hover:border-team-blue hover:bg-blue-50/10 transition-all text-center",
                             selectedBank === bank.id ? "border-team-blue bg-blue-50/20" : "border-gray-100"
                           )}
                           onClick={() => setSelectedBank(bank.id)}
                        >
                           <input 
                              type="radio" 
                              name="bank" 
                              value={bank.id} 
                              checked={selectedBank === bank.id}
                              onChange={() => setSelectedBank(bank.id)}
                              className="sr-only" 
                           />
                           <div className="w-full h-12 flex items-center justify-center p-2">
                              <img src={bank.logo} alt={bank.name} className="max-w-full max-h-full object-contain" />
                           </div>
                           <span className="font-bold text-xs text-gray-700">{bank.name}</span>
                           <div className={cn(
                             "absolute top-3 right-3 transition-opacity text-team-blue",
                             selectedBank === bank.id ? "opacity-100" : "opacity-0"
                           )}>
                              <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                           </div>
                        </label>
                     ))}
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl space-y-3">
                     <div className="flex gap-2 items-center text-team-blue font-bold text-sm">
                        <FileText className="w-4 h-4" /> Required documents for credit
                     </div>
                     <ul className="text-xs text-gray-600 space-y-1 ml-6 list-disc">
                        <li>Passport or ID card</li>
                        <li>Social security card</li>
                        <li>Proof of income (for some banks)</li>
                     </ul>
                  </div>
               </div>
            )}
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:w-[400px] shrink-0">
             <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                   <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{(paymentType === "full" ? fullPrice : creditPrice).toLocaleString()} ֏</span>
                   </div>
                   {discountAmount > 0 && (
                     <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount ({appliedPromo?.discountPercent}%)</span>
                        <span>-{discountAmount.toLocaleString()} ֏</span>
                     </div>
                   )}
                   <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="text-team-red font-bold">FREE</span>
                   </div>
                   <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                      <div>
                         <span className="text-gray-900 font-bold block">Total to pay</span>
                         <span className="text-xs text-gray-400">VAT included</span>
                      </div>
                      <div className="text-2xl font-black text-team-blue">
                         {currentPrice.toLocaleString()} ֏
                      </div>
                   </div>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ShieldCheck className="w-4 h-4 text-green-600" /> Secure payment and data protection
                   </div>
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Truck className="w-4 h-4 text-blue-600" /> Official warranty from manufacturer
                   </div>
                </div>

                <Button 
                  className="w-full h-14 rounded-xl text-lg font-bold bg-team-blue hover:bg-blue-700 shadow-lg shadow-blue-200"
                  disabled={submitOrderMutation.isPending}
                  onClick={handleSubmitOrder}
                >
                  {submitOrderMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                  {getOnlinePaymentLabel()}
                </Button>
                
                <p className="text-[10px] text-gray-400 text-center mt-4 px-4 leading-relaxed">
                   By clicking the button, you agree to the <a href="#" className="underline">terms of use</a> and <a href="#" className="underline">privacy policy</a>.
                </p>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
