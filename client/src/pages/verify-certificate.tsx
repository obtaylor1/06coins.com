import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Check, Headphones, Search, ShieldCheck } from "lucide-react";
import coinFront from "@assets/optimized-webp/apa coin front.webp";
import coinBack from "@assets/optimized-webp/apa coin back.webp";

type CertificateRecord = {
  serialNumber: string;
  editionNumber: number;
  editionSize: number;
  edition: string;
  status: string;
  diameter: string;
  finish: string;
  material: string;
  issuedAt: string;
  purchaser: string;
  certificate: string;
};

const SERIAL_PATTERN = /^1906-LE-\d{6}$/;

export default function VerifyCertificate() {
  const [location, setLocation] = useLocation();
  const initial = new URLSearchParams(location.split("?")[1] || "").get("serial")?.toUpperCase() || "";
  const [serial, setSerial] = useState(initial);
  const [record, setRecord] = useState<CertificateRecord | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async (value: string) => {
    const normalized = value.trim().toUpperCase();
    setSerial(normalized);
    setRecord(null);
    if (!SERIAL_PATTERN.test(normalized)) {
      setMessage("Enter the serial exactly as printed on the card, for example 1906-LE-000127.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/certificates/verify/${encodeURIComponent(normalized)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "This serial could not be verified");
      setRecord(data);
      setLocation(`/verify?serial=${encodeURIComponent(normalized)}`, { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "This serial could not be verified");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (initial) void verify(initial); }, []);

  const submit = (event: FormEvent) => { event.preventDefault(); void verify(serial); };
  const fields = record ? [
    ["Edition", record.edition],
    ["Edition number", `${record.editionNumber.toLocaleString()} of ${record.editionSize.toLocaleString()}`],
    ["Status", record.status === "active" ? "Authentic" : record.status],
    ["Registered purchaser", record.purchaser],
    ["Diameter", record.diameter],
    ["Finish", record.finish],
    ["Material", record.material],
    ["Date issued", new Date(record.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
    ["Certificate", record.certificate],
  ] : [];

  return <main className="min-h-screen bg-[#070706] text-[#eee4c8] selection:bg-[#c7a34f] selection:text-black">
    <header className="border-b border-[#a88437]/45 bg-[#090908]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" aria-label="06 Coins home"><span className="block font-serif text-3xl leading-none text-[#d1ad58]">06 COINS</span><span className="text-[9px] tracking-[.28em] text-[#d1ad58]/80">PRIVATE OFFICE</span></a>
        <nav className="flex gap-6 text-xs text-[#eee4c8]/70"><a className="hover:text-[#d1ad58]" href="/shop-coins">Storefront</a><a className="hover:text-[#d1ad58]" href="/contact">Contact support</a></nav>
      </div>
    </header>

    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 opacity-[.055] [background-image:repeating-radial-gradient(ellipse_at_center,#d1ad58_0,#d1ad58_1px,transparent_1px,transparent_13px)]" />
      <section className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[.35em] text-[#d1ad58]">Certificate registry</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">Verify an authentic issue</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#eee4c8]/60">Enter the unique serial printed on the Certificate of Authenticity. QR scans fill this field automatically.</p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 border border-[#a88437]/55 bg-[#0f0e0b] p-2 shadow-2xl sm:flex-row">
            <label className="sr-only" htmlFor="certificate-serial">Certificate serial number</label>
            <input id="certificate-serial" value={serial} onChange={event => setSerial(event.target.value.toUpperCase())} placeholder="1906-LE-000127" autoComplete="off" spellCheck={false} maxLength={20} className="h-[52px] min-w-0 flex-1 bg-transparent px-4 font-mono text-base uppercase tracking-[.12em] outline-none placeholder:text-[#eee4c8]/25 focus:ring-1 focus:ring-[#d1ad58]" />
            <button disabled={loading} className="flex h-[52px] items-center justify-center gap-2 bg-[#c9a653] px-7 text-xs font-bold uppercase tracking-[.16em] text-[#090908] hover:bg-[#e0be6c] focus:outline-none focus:ring-2 focus:ring-[#f0d58e] disabled:opacity-60"><Search className="h-4 w-4" />{loading ? "Checking…" : "Verify serial"}</button>
          </form>
          {message && <p role="alert" className="mx-auto mt-4 max-w-2xl border border-red-900/70 bg-red-950/20 p-3 text-sm text-red-200">{message}</p>}
        </div>

        {record && <div className="mt-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="mx-auto text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-[#d1ad58] text-[#d1ad58] shadow-[0_0_35px_rgba(209,173,88,.15)]"><Check className="h-8 w-8" strokeWidth={1.5} /></div>
            <h2 className="mt-5 font-serif text-3xl uppercase tracking-[.08em] text-[#d1ad58] sm:text-4xl">Authentic 06 Coins issue</h2>
            <p className="mt-3 text-sm text-[#eee4c8]/65">This serial matches an authentic 1906 Limited Edition commemorative coin.</p>
            <div className="mx-auto mt-6 w-fit border border-[#d1ad58] px-6 py-3 font-mono text-xl tracking-[.12em] text-[#e3c273] sm:text-3xl">{record.serialNumber}</div>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-10 border-y border-[#a88437]/45 py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="grid grid-cols-2 gap-5">
              {[{src:coinFront,label:"Obverse"},{src:coinBack,label:"Reverse"}].map(coin => <figure key={coin.label} className="text-center"><div className="aspect-square overflow-hidden rounded-full bg-[#131109] shadow-[0_20px_50px_rgba(0,0,0,.55)]"><img src={coin.src} alt={`${coin.label} of the 1906 Limited Edition coin`} className="h-full w-full object-contain" /></div><figcaption className="mt-4 text-[10px] uppercase tracking-[.3em] text-[#d1ad58]">{coin.label}</figcaption></figure>)}
            </div>
            <dl>{fields.map(([label,value]) => <div key={label} className="grid grid-cols-[minmax(120px,.75fr)_1.25fr] gap-4 border-b border-[#a88437]/30 py-3 text-sm"><dt className="font-serif uppercase tracking-[.08em] text-[#d1ad58]">{label}</dt><dd className={label === "Status" ? "font-semibold uppercase text-[#dfbe69]" : "text-[#eee4c8]/80"}>{value}</dd></div>)}</dl>
          </div>

          <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-5 border border-[#a88437]/45 bg-[#0d0c09] p-6 sm:flex-row">
            <div className="flex items-center gap-4"><Headphones className="h-8 w-8 text-[#d1ad58]" strokeWidth={1.3}/><div><h3 className="font-serif text-xl">Does something look wrong?</h3><p className="mt-1 text-xs text-[#eee4c8]/50">Our team can help verify your coin and certificate.</p></div></div>
            <a href="/contact" className="border border-[#d1ad58] px-6 py-3 text-xs uppercase tracking-[.16em] text-[#e1c16c] hover:bg-[#d1ad58] hover:text-black">Contact support</a>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[.2em] text-[#eee4c8]/40"><ShieldCheck className="h-4 w-4 text-[#d1ad58]"/>Verification record secured by 06 Coins Private Office</p>
        </div>}

        {!record && !loading && <div className="mx-auto mt-16 max-w-3xl border-t border-[#a88437]/30 pt-8 text-center"><p className="font-serif text-xl text-[#eee4c8]/70">Each of the 1,906 coins receives one permanent registry number.</p><p className="mt-3 text-xs leading-5 text-[#eee4c8]/40">A valid result confirms the certificate record. It does not independently establish the identity of the person presenting the coin.</p></div>}
      </section>
    </div>
    <footer className="border-t border-[#a88437]/40 px-5 py-6 text-center text-[9px] uppercase tracking-[.24em] text-[#d1ad58]/75">First of all, servants of all, we shall transcend all</footer>
  </main>;
}
