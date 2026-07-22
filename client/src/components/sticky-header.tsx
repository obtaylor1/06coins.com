import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import coinBackImg from "@assets/optimized-webp/apa_coin_back_1767463206489.webp";

export function StickyHeader({ onCtaClick }: { onCtaClick: () => void }) {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const { data } = useQuery<{remainingStock:number}>({ queryKey:['/api/inventory'], refetchInterval:10000 });
  return <header className="sticky top-0 z-50 border-b border-[#C8A856]/25 bg-[#090909]/95 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
      <Link href="/" className="flex items-center gap-3"><img src={coinBackImg} alt="" className="h-10 w-10 object-contain sm:h-12 sm:w-12"/><span><b className="block font-serif text-sm tracking-wide text-[#E8DEC2] sm:text-base">120 Years Forged in Gold</b><small className="hidden uppercase tracking-[.16em] text-[#C8A856] sm:block">Alpha Phi Alpha · 1906–2026</small></span></Link>
      <div className="flex items-center gap-2 sm:gap-5"><p className="hidden text-xs uppercase tracking-[.14em] text-[#E8DEC2]/60 md:block"><span className="text-[#C8A856]">{data?.remainingStock ?? '—'}</span> in the edition</p><Link href={location==='/shop-coins'?'/':'/shop-coins'} className="hidden text-sm text-[#E8DEC2] hover:text-[#C8A856] sm:block">{location==='/shop-coins'?'Home':'Collection'}</Link><button onClick={onCtaClick} className="min-h-11 border border-[#C8A856] bg-[#C8A856] px-4 text-xs font-bold uppercase tracking-[.14em] text-black transition hover:bg-[#E8DEC2]">Acquire <span className="hidden sm:inline">the coin</span></button><Link href="/shop-coins" aria-label={`Shopping bag with ${itemCount} items`} className="relative grid min-h-11 min-w-11 place-items-center border border-[#C8A856]/35 text-[#E8DEC2]"><ShoppingBag className="h-4 w-4"/>{itemCount>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center bg-[#C8A856] px-1 text-xs font-bold text-black">{itemCount}</span>}</Link></div>
    </div>
  </header>;
}
