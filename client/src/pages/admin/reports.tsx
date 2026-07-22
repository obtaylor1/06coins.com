import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Printer } from "lucide-react";
import { AdminShell, ExportButton } from "@/components/admin/admin-shell";

const reports = [
  ["sales", "Sales"], ["profitability", "Profitability"], ["orders", "Orders"],
  ["products", "Products"], ["inventory", "Inventory"], ["customers", "Customers"],
  ["taxes", "Taxes"], ["shipping", "Shipping"], ["staff-activity", "Staff activity"],
] as const;

const formatValue = (value: any, format?: string) => {
  if (value === null || value === undefined || value === "") return "—";
  if (format === "money") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) / 100);
  if (format === "percent") return `${value}%`;
  if (format === "hours") return `${value} hrs`;
  if (format === "date") return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  if (format === "number") return Number(value).toLocaleString();
  return String(value);
};

export default function Reports() {
  const [type, setType] = useState("sales");
  const [period, setPeriod] = useState("30");
  const { data, isLoading, error } = useQuery<any>({ queryKey: [`/api/admin/reports/${type}?period=${period}`] });
  const exportRows = useMemo(() => (data?.rows || []).map((row: any) => Object.fromEntries((data?.columns || []).map((column: any) => [column.label, formatValue(row[column.key], column.format)]))), [data]);
  const title = reports.find(([slug]) => slug === type)?.[1] || "Report";
  const chartRows = (data?.rows || []).slice(0, type === "sales" ? 3660 : 12);
  const chartKey = data?.chart?.key;
  const nameKey = data?.chart?.nameKey || "date";
  const chartFormatter = (value: number) => data?.chart?.format === "money" ? `$${(value / 100).toFixed(2)}` : value.toLocaleString();

  return <AdminShell title="Reports" actions={<><button onClick={() => window.print()} className="flex h-9 items-center gap-2 border border-[#8B6B2B]/40 px-3 text-xs"><Printer className="h-4 w-4"/>Print / PDF</button><ExportButton filename={`06coins-${type}-${period}-days.csv`} rows={exportRows}/></>}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-[#8B6B2B]/30 bg-[#11110f] px-4 py-3">
      <p className="text-xs text-[#E8DEC2]/50">All totals come from recorded orders and operations data.</p>
      <label className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#C8A856]">Date range<select value={period} onChange={event => setPeriod(event.target.value)} className="h-9 border border-[#8B6B2B]/40 bg-[#090909] px-3 text-xs normal-case tracking-normal text-[#E8DEC2]"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option></select></label>
    </div>
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Report categories" className="h-fit border border-[#8B6B2B]/35 bg-[#11110f] p-3">{reports.map(([slug, label]) => <button key={slug} onClick={() => setType(slug)} aria-current={type === slug ? "page" : undefined} className={`block w-full border-l-2 px-3 py-3 text-left text-xs transition ${type === slug ? "border-[#C8A856] bg-[#C8A856]/10 text-[#C8A856]" : "border-transparent opacity-60 hover:opacity-100"}`}>{label}</button>)}</nav>
      <section className="min-w-0 border border-[#8B6B2B]/35 bg-[#11110f] p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[.22em] text-[#C8A856]/70">{period === "all" ? "All recorded activity" : `Last ${period} days`}</p><h2 className="mt-1 font-serif text-2xl">{title} report</h2></div>{data?.generatedAt && <p className="text-[10px] opacity-35">Generated {new Date(data.generatedAt).toLocaleString()}</p>}</div>
        {isLoading && <p className="grid h-64 place-items-center text-sm opacity-45">Preparing report…</p>}
        {error && <p className="mt-6 border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-200">This report could not be loaded. Refresh the page or try another range.</p>}
        {data && <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric: any) => <div key={metric.label} className="border border-[#8B6B2B]/25 bg-[#0c0c0a] p-4"><small className="text-[9px] uppercase tracking-wider opacity-45">{metric.label}</small><p className="mt-2 break-words font-serif text-2xl text-[#E8DEC2]">{formatValue(metric.value, metric.format)}</p></div>)}</div>
          {chartKey && chartRows.length > 0 && <div className="mt-7 h-72 border-y border-[#8B6B2B]/20 py-5"><ResponsiveContainer>{type === "sales" ? <LineChart data={chartRows}><CartesianGrid stroke="#8B6B2B" strokeOpacity={.18}/><XAxis dataKey={nameKey} stroke="#8d8779" tick={{fontSize:10}} minTickGap={28}/><YAxis stroke="#8d8779" tick={{fontSize:10}} tickFormatter={chartFormatter}/><Tooltip formatter={(value:number) => chartFormatter(value)} contentStyle={{background:'#11110f',border:'1px solid #8B6B2B'}}/><Line type="monotone" dataKey={chartKey} stroke="#C8A856" strokeWidth={2} dot={chartRows.length <= 31}/></LineChart> : <BarChart data={chartRows} layout="vertical" margin={{left:20}}><CartesianGrid stroke="#8B6B2B" strokeOpacity={.18}/><XAxis type="number" stroke="#8d8779" tickFormatter={chartFormatter}/><YAxis type="category" width={145} dataKey={nameKey} stroke="#8d8779" tick={{fontSize:9}}/><Tooltip formatter={(value:number) => chartFormatter(value)} contentStyle={{background:'#11110f',border:'1px solid #8B6B2B'}}/><Bar dataKey={chartKey} fill="#C8A856"/></BarChart>}</ResponsiveContainer></div>}
          {data.note && <p className="mt-5 border-l-2 border-[#C8A856] bg-[#C8A856]/5 px-4 py-3 text-xs leading-5 text-[#E8DEC2]/55">{data.note}</p>}
          <div className="mt-6 overflow-x-auto border border-[#8B6B2B]/25"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#C8A856]/5 text-[9px] uppercase tracking-wider text-[#E8DEC2]/45"><tr>{data.columns.map((column:any) => <th key={column.key} className="p-3">{column.label}</th>)}</tr></thead><tbody>{data.rows.map((row:any, index:number) => <tr key={row.order || row.sku || row.email || `${type}-${index}`} className="border-t border-[#8B6B2B]/20">{data.columns.map((column:any) => <td key={column.key} className="max-w-xs truncate p-3">{formatValue(row[column.key], column.format)}</td>)}</tr>)}</tbody></table>{!data.rows.length && <div className="p-10 text-center"><p className="font-serif text-lg text-[#E8DEC2]/65">No recorded data for this report</p><p className="mt-2 text-xs text-[#E8DEC2]/35">The report will populate automatically when qualifying activity is recorded.</p></div>}</div>
        </>}
      </section>
    </div>
  </AdminShell>;
}
