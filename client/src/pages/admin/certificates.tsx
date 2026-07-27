import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, QrCode, Search } from "lucide-react";
import { AdminShell, ExportButton } from "@/components/admin/admin-shell";

export default function Certificates() {
  const [search, setSearch] = useState("");
  const { data: records = [] } = useQuery<any[]>({ queryKey: ["/api/admin/certificates"] });
  const filtered = useMemo(() => records.filter(record => JSON.stringify(record).toLowerCase().includes(search.toLowerCase())), [records, search]);
  return <AdminShell title="Authenticity Registry" actions={<ExportButton filename="06coins-certificates.csv" rows={filtered} />}>
    <section className="mb-4 grid gap-3 sm:grid-cols-3">
      <div className="border border-[#8B6B2B]/35 bg-[#11110f] p-5"><p className="text-xs uppercase tracking-widest opacity-65">Issued</p><p className="mt-2 font-serif text-3xl">{records.length.toLocaleString()}</p></div>
      <div className="border border-[#8B6B2B]/35 bg-[#11110f] p-5"><p className="text-xs uppercase tracking-widest opacity-65">Remaining</p><p className="mt-2 font-serif text-3xl">{Math.max(0, 1906 - records.length).toLocaleString()}</p></div>
      <div className="border border-[#8B6B2B]/35 bg-[#11110f] p-5"><p className="text-xs uppercase tracking-widest opacity-65">Edition limit</p><p className="mt-2 font-serif text-3xl">1,906</p></div>
    </section>
    <section className="border border-[#8B6B2B]/35 bg-[#11110f]">
      <div className="border-b border-[#8B6B2B]/25 p-4"><label className="relative block max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 opacity-60"/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Serial, customer, email, or order" className="h-9 w-full border border-[#8B6B2B]/35 bg-[#090909] pl-9 pr-3 text-xs"/></label></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="text-xs uppercase tracking-wider opacity-65"><tr><th className="p-4">Serial number</th><th>Edition</th><th>Purchaser</th><th>Email</th><th>Issued</th><th>Status</th><th>Verifications</th><th>Links</th></tr></thead><tbody>{filtered.map(record => <tr key={record.id} className="border-t border-[#8B6B2B]/20"><td className="p-4 font-mono text-[#C8A856]">{record.serialNumber}</td><td>{record.editionNumber} / 1,906</td><td>{record.purchaserName || "—"}</td><td>{record.purchaserEmail || "—"}</td><td>{new Date(record.issuedAt).toLocaleDateString()}</td><td className="capitalize">{record.status}</td><td>{record.verificationCount}</td><td><div className="flex gap-3"><a href={record.verificationUrl} target="_blank" rel="noreferrer" aria-label={`Open verification for ${record.serialNumber}`}><ExternalLink className="h-4 w-4"/></a><a href={record.qrCodeUrl} target="_blank" rel="noreferrer" aria-label={`Open QR code for ${record.serialNumber}`}><QrCode className="h-4 w-4"/></a></div></td></tr>)}</tbody></table>{!filtered.length && <p className="p-12 text-center text-sm opacity-65">No certificates have been issued yet. They are created automatically after a successful limited-edition purchase.</p>}</div>
    </section>
  </AdminShell>;
}
