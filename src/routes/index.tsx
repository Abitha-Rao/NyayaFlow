import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  AlertTriangle,
  CalendarDays,
  Gavel,
  ShieldAlert,
  Check,
  FileText,
  Bell,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NyayaFlow AI — Judicial Operations Platform" },
      { name: "description", content: "AI-assisted case intake and cause list management for Indian district courts." },
      { property: "og:title", content: "NyayaFlow AI" },
      { property: "og:description", content: "AI-assisted case intake and cause list management for Indian district courts." },
    ],
  }),
  component: Index,
});

type Risk = "HIGH" | "MEDIUM" | "LOW";
type RowStatus = "pending" | "approved" | "routed";

interface CaseRow {
  id: string;
  type: string;
  petitioner: string;
  respondent: string;
  time: string;
  judge: string;
  risk: Risk;
  riskPct: number;
  action: "intervene" | "review" | "approved" | "lokadalat";
  status: RowStatus;
  reason: string;
}

const INITIAL_CASES: CaseRow[] = [
  { id: "NI/2024/1847", type: "Cheque Bounce", petitioner: "Kumar", respondent: "M/s Traders", time: "10:00 AM", judge: "S. Raghunathan", risk: "HIGH", riskPct: 85, action: "intervene", status: "pending", reason: "Respondent counsel has 3 prior adjournments in similar matters." },
  { id: "CIV/2023/0391", type: "Property Dispute", petitioner: "Lakshmi Devi", respondent: "State of TS", time: "10:30 AM", judge: "P. Anand", risk: "LOW", riskPct: 20, action: "approved", status: "approved", reason: "All parties confirmed; pleadings complete." },
  { id: "NI/2025/2210", type: "Cheque Bounce", petitioner: "Reddy Infra", respondent: "HDFC Bank", time: "11:00 AM", judge: "S. Raghunathan", risk: "HIGH", riskPct: 90, action: "intervene", status: "pending", reason: "Bank counsel double-booked across two benches." },
  { id: "FAM/2022/0088", type: "Family Settlement", petitioner: "Sunitha", respondent: "Suresh", time: "11:30 AM", judge: "M. Krishnamurthy", risk: "LOW", riskPct: 25, action: "lokadalat", status: "pending", reason: "Both parties expressed willingness to settle." },
  { id: "CRM/2024/3301", type: "Bail Petition", petitioner: "State", respondent: "D. Naidu", time: "12:00 PM", judge: "P. Anand", risk: "MEDIUM", riskPct: 55, action: "review", status: "pending", reason: "Custody report pending verification." },
  { id: "NI/2025/1102", type: "Cheque Bounce", petitioner: "Suresh Babu", respondent: "K. Rao", time: "2:00 PM", judge: "S. Raghunathan", risk: "MEDIUM", riskPct: 60, action: "review", status: "pending", reason: "Witness availability uncertain." },
  { id: "CIV/2021/5509", type: "Land Acquisition", petitioner: "Farmers Assoc.", respondent: "GHMC", time: "2:30 PM", judge: "M. Krishnamurthy", risk: "LOW", riskPct: 15, action: "approved", status: "approved", reason: "Documents verified; ready for final hearing." },
  { id: "FAM/2023/0445", type: "Maintenance", petitioner: "Priya", respondent: "Arun", time: "3:00 PM", judge: "M. Krishnamurthy", risk: "LOW", riskPct: 22, action: "lokadalat", status: "pending", reason: "Quantum dispute only; suitable for mediation." },
];

const riskColor = (r: Risk) =>
  r === "HIGH" ? "var(--flag-red)" : r === "MEDIUM" ? "var(--flag-amber)" : "var(--flag-green)";

function AiPill() {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-[var(--accent-blue)] text-[var(--accent-blue)] bg-[var(--accent-blue)]/5">
      AI
    </span>
  );
}

function ConfidenceBar({ pct, risk, width = "100%" }: { pct: number; risk: Risk; width?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-[var(--rule)] overflow-hidden" style={{ width }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: riskColor(risk) }}
      />
    </div>
  );
}

function RiskBadge({ risk }: { risk: Risk }) {
  return (
    <span
      className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
      style={{
        color: riskColor(risk),
        backgroundColor: `${riskColor(risk)}15`,
        border: `1px solid ${riskColor(risk)}40`,
      }}
    >
      {risk}
    </span>
  );
}

function Index() {
  const [view, setView] = useState<"intake" | "list">("intake");

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)] flex flex-col">
      <TopNav view={view} setView={setView} />
      <main className="flex-1">
        {view === "intake" ? <IntakeView /> : <CauseListView />}
      </main>
      <Footer />
    </div>
  );
}

function TopNav({ view, setView }: { view: "intake" | "list"; setView: (v: "intake" | "list") => void }) {
  return (
    <header className="bg-[var(--ink)] text-[var(--surface)] border-b border-[var(--ink)]">
      <div className="px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[var(--accent-blue)] flex items-center justify-center">
            <Gavel size={16} className="text-white" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight">NyayaFlow</span>
        </div>
        <nav className="flex items-center gap-1">
          {([["intake", "Case Intake"], ["list", "Cause List"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className={`px-4 py-1.5 text-sm rounded-sm transition-colors ${
                view === k
                  ? "bg-[var(--accent-blue)] text-white"
                  : "text-[var(--surface)]/70 hover:text-[var(--surface)] hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--surface)]/70 font-sans">District Court, Hyderabad</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-[var(--flag-green)]/15 text-[var(--flag-green)] border border-[var(--flag-green)]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--flag-green)] animate-pulse" />
            AI Active
          </span>
        </div>
      </div>
    </header>
  );
}

/* ---------------- INTAKE VIEW ---------------- */

type IntakeState = "idle" | "processing" | "done";

function IntakeView() {
  const [state, setState] = useState<IntakeState>("idle");
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});

  const handleUpload = () => {
    if (state === "processing") return;
    setState("processing");
    setTimeout(() => {
      setState("done");
      toast.success("Case file processed", { description: "AI extraction complete." });
    }, 2000);
  };

  const reset = () => {
    setState("idle");
    setApprovals({});
  };

  const approve = (key: string, label: string) => {
    setApprovals((a) => ({ ...a, [key]: true }));
    toast.success(`${label} approved`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-px bg-[var(--rule)] min-h-[calc(100vh-3.5rem-2.5rem)]">
      {/* LEFT PANEL */}
      <section className="bg-[var(--surface)] p-6 overflow-y-auto">
        <PanelHeader title="Upload Case File" sub="Submit a new petition for AI-assisted intake" />

        {state === "idle" && (
          <>
            <div
              onClick={handleUpload}
              className="mt-4 border-2 border-dashed border-[var(--rule)] hover:border-[var(--accent-blue)] hover:bg-white transition-colors rounded-md p-10 text-center cursor-pointer"
            >
              <Upload size={32} className="mx-auto text-[var(--muted-foreground)]" />
              <p className="mt-3 text-sm font-medium">Drop case PDF here</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">or click to browse</p>
            </div>
            <button
              onClick={handleUpload}
              className="mt-3 w-full bg-[var(--accent-blue)] text-white py-2.5 text-sm font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              Upload File
            </button>
          </>
        )}

        {state === "processing" && (
          <div className="mt-4 border border-[var(--rule)] bg-white rounded-md p-6 flex items-center gap-3">
            <Loader2 className="animate-spin text-[var(--accent-blue)]" size={20} />
            <div>
              <p className="text-sm font-medium">Processing…</p>
              <p className="text-xs text-[var(--muted-foreground)] font-mono">Extracting fields · classifying · checking defects</p>
            </div>
          </div>
        )}

        {state === "done" && (
          <>
            <ExtractionCard />
            <DefectReport />
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={reset}
                className="border border-[var(--ink)] text-[var(--ink)] py-2.5 text-sm font-medium rounded-sm hover:bg-[var(--ink)] hover:text-white transition-colors"
              >
                Override &amp; Register
              </button>
              <button
                onClick={() => {
                  toast.success("Case approved & scheduled");
                  reset();
                }}
                className="bg-[var(--accent-blue)] text-white py-2.5 text-sm font-medium rounded-sm hover:opacity-90"
              >
                Approve &amp; Schedule
              </button>
            </div>
          </>
        )}
      </section>

      {/* RIGHT PANEL */}
      <section className="bg-[var(--surface)] p-6 overflow-y-auto">
        <PanelHeader
          title="AI Recommendations"
          sub="Generated from 12,847 similar prior cases · Human approval required"
          right={<AiPill />}
        />
        {state !== "done" ? (
          <div className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            <FileText size={36} className="mx-auto mb-3 opacity-30" />
            Upload a case file to receive AI-generated scheduling, judge assignment, and risk analysis.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-4 animate-in fade-in duration-500">
            <RecommendationCard
              icon={<CalendarDays size={18} />}
              title="Recommended Hearing Date"
              primary="Thu, 26 Jun 2026 · 10:30 AM"
              sub="Judge Availability: High · Courtroom 4"
              approved={!!approvals.date}
              onApprove={() => approve("date", "Hearing date")}
            />
            <RecommendationCard
              icon={<Gavel size={18} />}
              title="Judge Recommendation"
              primary="Hon. S. Raghunathan"
              sub="NI Act specialist · 12 similar cases this month · Load 74%"
              approved={!!approvals.judge}
              onApprove={() => approve("judge", "Judge")}
            />
            <RecommendationCard
              icon={<ShieldAlert size={18} />}
              title="Adjournment Risk"
              primary="MEDIUM"
              primaryColor="var(--flag-amber)"
              bar={{ pct: 55, risk: "MEDIUM" }}
              sub="Reason: Respondent advocate has 3 pending conflicts this week."
              action="Recommended: Pre-notify respondent counsel 5 days prior."
              approved={!!approvals.risk}
              onApprove={() => approve("risk", "Risk mitigation")}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function PanelHeader({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--rule)]">
      <div>
        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">{sub}</p>
      </div>
      {right}
    </div>
  );
}

function ExtractionCard() {
  const rows: [string, string][] = [
    ["Case Type", "NI Act — Cheque Bounce"],
    ["Petitioner", "Ramesh Kumar Gupta"],
    ["Respondent", "M/s Shree Traders Pvt. Ltd."],
    ["Acts Cited", "Section 138, Negotiable Instruments Act"],
    ["Urgency Level", "Medium"],
    ["Filing Date", "04 Jun 2026"],
  ];
  return (
    <div className="mt-4 bg-white border border-[var(--rule)] rounded-md animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--rule)]">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-[var(--accent-blue)]" />
          <span className="text-xs font-medium uppercase tracking-wider">Extracted Fields</span>
        </div>
        <AiPill />
      </div>
      <dl className="divide-y divide-[var(--rule)]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5">
            <dt className="text-xs text-[var(--muted-foreground)] font-sans pt-0.5">{k}</dt>
            <dd className="text-sm font-mono text-[var(--ink)]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DefectReport() {
  const defects = [
    { label: "Missing", text: "Vakalatnama not attached" },
    { label: "Jurisdiction", text: "Pecuniary limit may exceed this court's jurisdiction" },
  ];
  return (
    <div className="mt-4 border border-[var(--flag-red)]/40 bg-[var(--flag-red)]/5 rounded-md">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--flag-red)]/30">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-[var(--flag-red)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--flag-red)]">
            Defect Report — 2 issues
          </span>
        </div>
        <AiPill />
      </div>
      <ul className="divide-y divide-[var(--flag-red)]/20">
        {defects.map((d) => (
          <li key={d.label} className="px-4 py-2.5 flex items-start gap-3">
            <AlertTriangle size={14} className="text-[var(--flag-red)] mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-mono text-xs text-[var(--flag-red)] uppercase mr-2">{d.label}:</span>
              {d.text}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationCard({
  icon,
  title,
  primary,
  primaryColor,
  sub,
  action,
  bar,
  approved,
  onApprove,
}: {
  icon: React.ReactNode;
  title: string;
  primary: string;
  primaryColor?: string;
  sub: string;
  action?: string;
  bar?: { pct: number; risk: Risk };
  approved: boolean;
  onApprove: () => void;
}) {
  return (
    <div className="bg-white border border-[var(--rule)] rounded-md p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          {icon}
          <span className="text-xs uppercase tracking-wider font-medium">{title}</span>
        </div>
        <AiPill />
      </div>
      <div
        className="mt-3 font-serif text-xl font-semibold"
        style={primaryColor ? { color: primaryColor } : undefined}
      >
        {primary}
      </div>
      {bar && (
        <div className="mt-2">
          <ConfidenceBar pct={bar.pct} risk={bar.risk} />
        </div>
      )}
      <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">{sub}</p>
      {action && <p className="mt-2 text-xs text-[var(--ink)] leading-relaxed">{action}</p>}
      <div className="mt-4 pt-3 border-t border-[var(--rule)]">
        {approved ? (
          <button
            disabled
            className="w-full py-2 text-sm font-medium rounded-sm bg-[var(--flag-green)]/10 text-[var(--flag-green)] border border-[var(--flag-green)]/40 flex items-center justify-center gap-1.5"
          >
            <Check size={14} /> Approved
          </button>
        ) : (
          <button
            onClick={onApprove}
            className="w-full py-2 text-sm font-medium rounded-sm border border-[var(--accent-blue)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-white transition-colors"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- CAUSE LIST VIEW ---------------- */

type Filter = "ALL" | "HIGH" | "LOK" | "APPROVED";

function CauseListView() {
  const [cases, setCases] = useState<CaseRow[]>(INITIAL_CASES);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selected, setSelected] = useState<CaseRow | null>(null);
  const [pendingLok, setPendingLok] = useState<CaseRow | null>(null);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (filter === "ALL") return true;
      if (filter === "HIGH") return c.risk === "HIGH";
      if (filter === "LOK") return c.action === "lokadalat";
      if (filter === "APPROVED") return c.status === "approved";
      return true;
    });
  }, [cases, filter]);

  const updateRow = (id: string, patch: Partial<CaseRow>) =>
    setCases((all) => all.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const confirmLok = () => {
    if (!pendingLok) return;
    updateRow(pendingLok.id, { status: "routed" });
    toast.success("Routed to Lok Adalat", { description: `${pendingLok.id} removed from judge calendar.` });
    setPendingLok(null);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Today&apos;s Cause List</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            <span className="font-mono">Fri, 13 Jun 2026</span> · District Court, Hyderabad
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            18 cases listed · <span className="text-[var(--flag-red)] font-medium">3 high-risk</span> ·{" "}
            <span className="text-[var(--accent-blue)] font-medium">2 Lok Adalat recommended</span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-[var(--rule)] rounded-sm p-1">
          {(
            [
              ["ALL", "All"],
              ["HIGH", "High Risk"],
              ["LOK", "Lok Adalat"],
              ["APPROVED", "Approved"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                filter === k
                  ? "bg-[var(--ink)] text-[var(--surface)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--ink)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white border border-[var(--rule)] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--ink)] text-[var(--surface)] text-left">
              <Th>#</Th>
              <Th>Case ID</Th>
              <Th>Case Type</Th>
              <Th>Petitioner vs Respondent</Th>
              <Th>Hearing</Th>
              <Th>Judge</Th>
              <Th>Risk Score</Th>
              <Th className="text-right pr-4">Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                className="border-t border-[var(--rule)] hover:bg-[var(--surface)] cursor-pointer transition-colors"
              >
                <Td className="text-[var(--muted-foreground)] font-mono text-xs">{i + 1}</Td>
                <Td className="font-mono text-xs">{c.id}</Td>
                <Td>{c.type}</Td>
                <Td>
                  <span className="font-medium">{c.petitioner}</span>
                  <span className="text-[var(--muted-foreground)] mx-1.5">vs</span>
                  <span>{c.respondent}</span>
                </Td>
                <Td className="font-mono text-xs">{c.time}</Td>
                <Td>{c.judge}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={c.risk} />
                    <ConfidenceBar pct={c.riskPct} risk={c.risk} width="80px" />
                  </div>
                </Td>
                <Td className="text-right pr-4">
                  <ActionButton
                    row={c}
                    onLok={(r) => setPendingLok(r)}
                    onReview={(r) => {
                      updateRow(r.id, { status: "approved" });
                      toast.success(`${r.id} reviewed & approved`);
                    }}
                    onIntervene={(r) => setSelected(r)}
                  />
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-sm text-[var(--muted-foreground)] py-10">
                  No cases match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-[var(--ink)] text-[var(--surface)] rounded-md px-5 py-3 text-xs font-mono flex flex-wrap items-center gap-x-6 gap-y-1">
        <span>Courtroom utilization today: <span className="text-[var(--flag-amber)] font-medium">78%</span></span>
        <span className="opacity-30">·</span>
        <span>2 likely adjournments flagged</span>
        <span className="opacity-30">·</span>
        <span className="flex items-center gap-1.5"><Bell size={12} /> Notifications sent to 14 parties via SMS</span>
      </div>

      <CaseDrawer row={selected} onClose={() => setSelected(null)} />

      <Dialog open={!!pendingLok} onOpenChange={(o) => !o && setPendingLok(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Route to Lok Adalat?</DialogTitle>
            <DialogDescription>
              This will remove <span className="font-mono">{pendingLok?.id}</span> from{" "}
              {pendingLok?.judge}&apos;s calendar and assign it to the next Lok Adalat sitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setPendingLok(null)}
              className="px-4 py-2 text-sm font-medium border border-[var(--rule)] rounded-sm hover:bg-[var(--surface)]"
            >
              Cancel
            </button>
            <button
              onClick={confirmLok}
              className="px-4 py-2 text-sm font-medium bg-[var(--accent-blue)] text-white rounded-sm hover:opacity-90"
            >
              Confirm Routing
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-2.5 text-[10px] font-mono font-medium uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function ActionButton({
  row,
  onLok,
  onReview,
  onIntervene,
}: {
  row: CaseRow;
  onLok: (r: CaseRow) => void;
  onReview: (r: CaseRow) => void;
  onIntervene: (r: CaseRow) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (row.status === "routed") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-[#0e7490]/10 text-[#0e7490] border border-[#0e7490]/40">
        Routed
      </span>
    );
  }
  if (row.status === "approved" || row.action === "approved") {
    return (
      <button
        disabled
        onClick={stop}
        className="text-xs font-medium px-3 py-1.5 rounded-sm bg-[var(--flag-green)]/10 text-[var(--flag-green)] border border-[var(--flag-green)]/40 inline-flex items-center gap-1"
      >
        <Check size={12} /> Approved
      </button>
    );
  }
  if (row.action === "intervene") {
    return (
      <button
        onClick={(e) => { stop(e); onIntervene(row); }}
        className="text-xs font-medium px-3 py-1.5 rounded-sm border border-[var(--flag-red)] text-[var(--flag-red)] hover:bg-[var(--flag-red)] hover:text-white transition-colors"
      >
        Intervene
      </button>
    );
  }
  if (row.action === "review") {
    return (
      <button
        onClick={(e) => { stop(e); onReview(row); }}
        className="text-xs font-medium px-3 py-1.5 rounded-sm border border-[var(--flag-amber)] text-[var(--flag-amber)] hover:bg-[var(--flag-amber)] hover:text-white transition-colors"
      >
        Review
      </button>
    );
  }
  return (
    <button
      onClick={(e) => { stop(e); onLok(row); }}
      className="text-xs font-medium px-3 py-1.5 rounded-sm border border-[var(--accent-blue)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-white transition-colors"
    >
      Route to Lok Adalat
    </button>
  );
}

function CaseDrawer({ row, onClose }: { row: CaseRow | null; onClose: () => void }) {
  const [approved, setApproved] = useState(false);
  // reset on row change via key
  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && (onClose(), setApproved(false))}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-[var(--surface)] p-0">
        {row && (
          <div key={row.id} className="flex flex-col h-full">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-[var(--rule)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--muted-foreground)]">{row.id}</span>
                <RiskBadge risk={row.risk} />
              </div>
              <SheetTitle className="font-serif text-2xl text-left">
                {row.petitioner} <span className="text-[var(--muted-foreground)] font-sans text-base">vs</span> {row.respondent}
              </SheetTitle>
              <SheetDescription className="text-left">
                {row.type} · Hearing {row.time} · Before {row.judge}
              </SheetDescription>
            </SheetHeader>

            <div className="p-6 space-y-6 flex-1">
              <section>
                <SectionTitle>Adjournment Risk Breakdown <AiPill /></SectionTitle>
                <div className="mt-3 bg-white border border-[var(--rule)] rounded-md p-4 space-y-3">
                  <RiskFactor label="Counsel Conflict Score" pct={Math.min(95, row.riskPct + 5)} risk={row.risk} />
                  <RiskFactor label="Document Completeness" pct={Math.max(15, 100 - row.riskPct)} risk={row.riskPct > 60 ? "MEDIUM" : "LOW"} />
                  <RiskFactor label="Witness Availability" pct={row.riskPct - 10} risk={row.risk} />
                  <p className="text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--rule)]">
                    {row.reason}
                  </p>
                </div>
              </section>

              <section>
                <SectionTitle>AI Scheduling Note <AiPill /></SectionTitle>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
                  Slot is optimally placed in the morning block. Estimated hearing duration:{" "}
                  <span className="font-mono">22 minutes</span>. Adjacent slots have 18-min buffers; no
                  cascading delays expected if this case overruns by ≤10 minutes.
                </p>
              </section>

              <section className="flex gap-3">
                <button
                  onClick={() => toast.success("SMS sent to 3 parties")}
                  className="flex-1 border border-[var(--ink)] text-[var(--ink)] py-2.5 text-sm font-medium rounded-sm hover:bg-[var(--ink)] hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Bell size={14} /> Send Notification
                </button>
                {approved ? (
                  <button disabled className="flex-1 py-2.5 text-sm font-medium rounded-sm bg-[var(--flag-green)]/10 text-[var(--flag-green)] border border-[var(--flag-green)]/40 flex items-center justify-center gap-1.5">
                    <Check size={14} /> Slot Approved
                  </button>
                ) : (
                  <button
                    onClick={() => { setApproved(true); toast.success("Hearing slot approved"); }}
                    className="flex-1 bg-[var(--accent-blue)] text-white py-2.5 text-sm font-medium rounded-sm hover:opacity-90"
                  >
                    Approve Hearing Slot
                  </button>
                )}
              </section>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs uppercase tracking-wider font-medium text-[var(--muted-foreground)] flex items-center gap-2">
      {children}
    </h3>
  );
}

function RiskFactor({ label, pct, risk }: { label: string; pct: number; risk: Risk }) {
  const clamped = Math.max(5, Math.min(100, pct));
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span>{label}</span>
        <span className="font-mono text-[var(--muted-foreground)]">{clamped}%</span>
      </div>
      <ConfidenceBar pct={clamped} risk={risk} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--rule)] bg-[var(--surface)] py-3 px-6 text-center">
      <p className="text-[11px] font-mono text-[var(--muted-foreground)] tracking-wide">
        NyayaFlow AI · Compliant with Supreme Court AI Guidelines 2026 · Human-in-the-loop architecture
      </p>
    </footer>
  );
}
