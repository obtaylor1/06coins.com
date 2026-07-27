import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ShieldCheck } from "lucide-react";
import { MAIN_COIN } from "@/lib/products";
import coinFrontImg from "@assets/optimized-webp/apa coin front_1762505793054.webp";
import heroBackgroundImg from "@assets/optimized-webp/0_0-1_1763338140136.webp";

export function HeroSection({ onCtaClick }: { onCtaClick: () => void }) {
  const [rotationReady, setRotationReady] = useState(false);
  const { data } = useQuery<{remainingStock:number}>({queryKey:['/api/inventory']});
  const stock=data?.remainingStock??1906;
  const editionSize = 1906;
  const inventoryPercent = Math.max(0, Math.min(100, (stock / editionSize) * 100));
  return <section className="relative overflow-hidden bg-[#090909] px-5 py-16 sm:px-8 lg:min-h-[calc(100vh-5rem)] lg:py-20">
    <div className="absolute inset-0 opacity-20" style={{backgroundImage:`url(${heroBackgroundImg})`,backgroundSize:'cover'}}/>
    <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/92 to-[#090909]/35"/>
    <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <p className="mb-5 text-xs font-bold uppercase tracking-[.14em] text-[#C8A856]">The 120th anniversary edition</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[.94] text-[#E8DEC2] sm:text-6xl lg:text-8xl">A legacy you can hold.</h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-[#E8DEC2]/68 sm:text-lg">A four-inch commemorative coin honoring Alpha Phi Alpha’s first 120 years—struck as a finite edition of 1,906.</p>

        <div className="mt-7" data-testid="hero-price-block">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#C8A856]">Limited 1906 edition</p>
          <p className="mt-1 flex items-start font-serif leading-none text-[#E8DEC2]">
            <span className="mt-2 text-3xl sm:mt-3 sm:text-4xl">$</span>
            <span className="text-6xl tabular-nums sm:text-7xl">{MAIN_COIN.price.toFixed(2)}</span>
          </p>
          <p className="mt-2 text-sm text-[#E8DEC2]/65">Numbered and certified</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-5">
          <button onClick={onCtaClick} className="min-h-12 bg-[#C8A856] px-7 text-sm font-bold uppercase tracking-[.16em] text-black hover:bg-[#E8DEC2]">Acquire the coin</button>
          <a href="#edition-ledger" className="flex min-h-12 items-center gap-2 text-sm text-[#E8DEC2] underline decoration-[#C8A856]/50 underline-offset-8">Read the edition record <ArrowDownRight className="h-4 w-4"/></a>
        </div>
        <div className="mt-7 flex flex-wrap gap-5 text-xs uppercase tracking-[.15em] text-[#E8DEC2]/55">
          <span className="flex gap-2"><ShieldCheck className="h-4 w-4 text-[#C8A856]"/>Secure Stripe checkout</span>
          <span>4-inch diameter</span>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-xl">
        <div className="absolute inset-12 rounded-full bg-[#C8A856]/15 blur-3xl"/>
        <div className="hero-coin-stage relative aspect-square">
          <img
            src={coinFrontImg}
            alt="Front of the Alpha Phi Alpha 120th anniversary commemorative coin"
            className={`hero-coin-fallback absolute inset-0 h-full w-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,.75)] transition-opacity duration-500 ${rotationReady ? "opacity-0" : "opacity-100"}`}
            fetchPriority="high"
          />
          <video
            className={`hero-coin-rotation absolute inset-0 h-full w-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,.75)] transition-opacity duration-500 ${rotationReady ? "opacity-100" : "opacity-0"}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={coinFrontImg}
            aria-label="The Alpha Phi Alpha 120th anniversary commemorative coin rotating from front to back"
            onCanPlay={() => setRotationReady(true)}
            onError={() => setRotationReady(false)}
          >
            <source src="/media/apa-coin-3d-rotation-transparent-v2.webm" type="video/webm"/>
          </video>
        </div>
        <div className="edition-ledger relative -mt-6 w-full bg-[#0B0A08]/95 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-center justify-between gap-4 border-b border-[#C8A856]/35 pb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-[#C8A856]" strokeWidth={1.25}/>
              <span className="font-serif text-sm uppercase tracking-[.15em] text-[#D5B65E] sm:text-base">Mint accession record</span>
            </div>
            <span className="border border-[#C8A856]/40 bg-black/45 px-3 py-2 font-mono text-[10px] tracking-[.12em] text-[#E8DEC2]/70 sm:text-xs">APA.120.2026</span>
          </div>

          <dl className="mt-5 grid grid-cols-3">
            <div className="flex flex-col justify-center pr-3 text-center sm:pr-5">
              <dt className="text-[10px] uppercase tracking-[.12em] text-[#E8DEC2]/60 sm:text-xs">Edition</dt>
              <dd className="mt-2 font-serif text-2xl text-[#E8DEC2] sm:text-3xl">1,906</dd>
            </div>
            <div className="border-x border-[#C8A856]/30 px-3 text-center sm:px-5">
              <dt className="text-[10px] uppercase tracking-[.12em] text-[#D5B65E] sm:text-xs">Coins remaining</dt>
              <dd className="mt-1 font-serif text-4xl leading-none text-[#D5B65E] sm:text-5xl">{stock.toLocaleString()}</dd>
            </div>
            <div className="flex flex-col justify-center pl-3 text-center sm:pl-5">
              <dt className="text-[10px] uppercase tracking-[.12em] text-[#E8DEC2]/60 sm:text-xs">Years</dt>
              <dd className="mt-2 font-serif text-2xl text-[#E8DEC2] sm:text-3xl">120</dd>
            </div>
          </dl>

          <div
            className="mt-6 h-px overflow-hidden bg-[#C8A856]/20"
            role="progressbar"
            aria-label={`${stock.toLocaleString()} of ${editionSize.toLocaleString()} anniversary coins currently available`}
            aria-valuemin={0}
            aria-valuemax={editionSize}
            aria-valuenow={stock}
          >
            <div className="edition-ledger-progress h-full bg-[#D5B65E]" style={{width:`${inventoryPercent}%`}}/>
          </div>
          <p className="mt-3 text-center font-serif text-xs tracking-[.06em] text-[#E8DEC2]/72 sm:text-sm">
            {stock.toLocaleString()} of {editionSize.toLocaleString()} anniversary coins currently available
          </p>
        </div>
      </div>
    </div>
  </section>;
}
