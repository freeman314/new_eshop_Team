import { useState, useRef, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ProductGallery, 
  ProductInfo, 
  ProductTabs,
  OffersAndBenefits,
  Accessories,
  StickyBar,
  productData,
  Product
} from "@/components/pdp-sections";
import { Layout } from "@/components/layout";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id;
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, [isLoading]); // Re-observe when loading finishes and ref is attached

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-team-blue" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* --- Breadcrumbs --- */}
      <div className="container max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <a href="/" className="hover:text-team-blue">Home</a>
          <ChevronRight className="w-3 h-3" />
          <a href="/smartphones" className="hover:text-team-blue">Smartphones</a>
          <ChevronRight className="w-3 h-3" />
          <a href="#" className="hover:text-team-blue">{product.brand}</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-team-blue">{product.name}</span>
        </div>
      </div>

      {/* --- Product Hero (Top) --- */}
      <div ref={heroRef} className="container max-w-[1400px] mx-auto px-4 mb-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-5">
            <ProductGallery product={product} />
          </div>

          {/* Right: Info (7 cols) */}
          <div className="lg:col-span-7">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* --- Offers & Benefits (Middle) --- */}
      <div className="container max-w-[1400px] mx-auto px-4 mb-0">
         <OffersAndBenefits />
      </div>

      {/* --- Tabs: Specs, Desc --- */}
      <ProductTabs product={product} />
      
      {/* --- Accessories (Bottom) --- */}
      <div className="container max-w-[1400px] mx-auto px-4 mb-16">
         <Accessories />
      </div>

      {/* --- Sticky Bar --- */}
      <StickyBar product={product} visible={isStickyVisible} />
    </Layout>
  );
}
