"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Plane,
  Search,
  Star,
  Wallet,
} from "lucide-react";
import { useTripRequest } from "@/lib/trip-context";
import { cn } from "@/lib/utils";
import { useTripStore } from "@/store/trip-store";

type AgentStatus = "completed" | "processing" | "pending";

interface AgentConfig {
  id: string;
  name: string;
  icon: ReactNode;
  flowIcon: ReactNode;
  task: string;
  detail: string;
  doneDetail: string;
}

const AGENTS: AgentConfig[] = [
  {
    id: "research",
    name: "Research Agent",
    icon: <Search className="size-5" />,
    flowIcon: <Search className="size-3.5" />,
    task: "Analyzing destination data",
    detail: "Gathering attractions, routes & climate data…",
    doneDetail: "Attractions, routes & climate data analyzed",
  },
  {
    id: "budget",
    name: "Budget Agent",
    icon: <Wallet className="size-5" />,
    flowIcon: <Wallet className="size-3.5" />,
    task: "Calculating optimal cost breakdown",
    detail: "Comparing hotel & transport options…",
    doneDetail: "Cost breakdown optimized for your budget",
  },
  {
    id: "recommendation",
    name: "Recommendation Agent",
    icon: <Star className="size-5" />,
    flowIcon: <Star className="size-3.5" />,
    task: "Finding personalized places",
    detail: "Filtering for your travel style…",
    doneDetail: "Personalized places curated for you",
  },
  {
    id: "itinerary",
    name: "Itinerary Agent",
    icon: <CalendarDays className="size-5" />,
    flowIcon: <CalendarDays className="size-3.5" />,
    task: "Composing day-wise schedule",
    detail: "Waiting for agent data…",
    doneDetail: "Day-wise schedule composed",
  },
];

const AGENT_WEIGHTS = [0.22, 0.28, 0.28, 0.22];
const ESTIMATED_TOTAL_MS = 90_000;

function getAgentStatus(progress: number): AgentStatus {
  if (progress >= 100) return "completed";
  if (progress > 0) return "processing";
  return "pending";
}

function computeProgress(elapsedMs: number, loading: boolean) {
  if (!loading) {
    return { overall: 100, agents: [100, 100, 100, 100] as number[] };
  }

  const overall = Math.min(95, (elapsedMs / ESTIMATED_TOTAL_MS) * 95);
  let cumulative = 0;
  const agents = AGENT_WEIGHTS.map((weight) => {
    const start = cumulative;
    cumulative += weight;
    const agentStart = start * ESTIMATED_TOTAL_MS;
    const agentEnd = cumulative * ESTIMATED_TOTAL_MS;

    if (elapsedMs < agentStart) return 0;
    if (elapsedMs >= agentEnd) return 100;
    return ((elapsedMs - agentStart) / (agentEnd - agentStart)) * 100;
  });

  return {
    overall: Math.round(overall),
    agents: agents.map((value) => Math.round(value)),
  };
}

function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-slate-100",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-slate-900 transition-[width] duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="size-3.5" />
        Completed
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
        <Loader2 className="size-3.5 animate-spin" />
        Processing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-400">
      <Clock className="size-3.5" />
      Pending
    </span>
  );
}

function AgentCard({
  agent,
  progress,
}: {
  agent: AgentConfig;
  progress: number;
}) {
  const status = getAgentStatus(progress);
  const isDone = status === "completed";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              isDone
                ? "bg-emerald-50 text-emerald-700"
                : status === "processing"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-400"
            )}
          >
            {agent.icon}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{agent.name}</p>
            <p className="mt-0.5 text-sm text-slate-600">
              {isDone ? agent.doneDetail : agent.task}
            </p>
            {!isDone && (
              <p className="mt-1 text-xs text-slate-400">{agent.detail}</p>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-1.5">
        <ProgressBar value={progress} />
        <div className="flex justify-between text-xs text-slate-400">
          <span>
            {isDone
              ? "Done"
              : status === "processing"
                ? "In progress"
                : "Not started"}
          </span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  const router = useRouter();
  const loading = useTripStore((s) => s.loading);
  const tripData = useTripStore((s) => s.tripData);
  const tripRequest = useTripRequest();
  const startTime = useRef<number | null>(null);
  const [overall, setOverall] = useState(0);
  const [agentProgress, setAgentProgress] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!loading && !tripData) {
      const timeout = setTimeout(() => router.replace("/"), 800);
      return () => clearTimeout(timeout);
    }
  }, [loading, tripData, router]);

  useEffect(() => {
    if (startTime.current === null) {
      startTime.current = Date.now();
    }

    const tick = () => {
      const elapsed = Date.now() - (startTime.current ?? Date.now());
      const { overall: nextOverall, agents } = computeProgress(elapsed, loading);
      setOverall(nextOverall);
      setAgentProgress(agents);
    };

    tick();
    const interval = setInterval(tick, 150);
    return () => clearInterval(interval);
  }, [loading]);

  const estimatedSeconds = Math.max(
    5,
    Math.round(((100 - overall) / 100) * (ESTIMATED_TOTAL_MS / 1000))
  );

  const activeFlowIndex = agentProgress.findIndex((p) => p < 100);
  const flowActiveIndex =
    activeFlowIndex === -1 ? AGENTS.length - 1 : activeFlowIndex;

  const subtitle = tripRequest?.destination
    ? `Our AI agents are collaborating to plan your perfect ${tripRequest.destination} ${tripRequest.travelStyle.toLowerCase()} journey`
    : "Our AI agents are collaborating to plan your perfect journey";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Plane className="size-5 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">
              TravelGenie AI
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span
              className={cn(
                "size-2 rounded-full",
                loading ? "animate-pulse bg-emerald-500" : "bg-slate-300"
              )}
            />
            Agents Active
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Building Your Trip
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {overall}% complete
            </span>
          </div>
          <ProgressBar value={overall} className="h-2.5" />
          <p className="mt-3 text-xs text-slate-400">
            {loading
              ? `Estimated time remaining: ~${estimatedSeconds} seconds`
              : "Finalizing your itinerary…"}
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {AGENTS.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              progress={agentProgress[index] ?? 0}
            />
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-slate-900">
            Agent Collaboration Flow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {AGENTS.map((agent, index) => {
              const isActive = index === flowActiveIndex && loading;
              const isComplete = (agentProgress[index] ?? 0) >= 100;

              return (
                <div key={agent.id} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                      isComplete
                        ? "bg-slate-900 text-white"
                        : isActive
                          ? "bg-slate-200 text-slate-900"
                          : "bg-slate-50 text-slate-400"
                    )}
                  >
                    {agent.flowIcon}
                    {agent.name.replace(" Agent", "")}
                  </div>
                  {index < AGENTS.length - 1 && (
                    <ArrowRight className="size-4 shrink-0 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Each agent passes enriched data to the next in the pipeline
          </p>
        </div>
      </main>
    </div>
  );
}
