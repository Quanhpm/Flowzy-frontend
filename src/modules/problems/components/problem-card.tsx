import { cn } from "@/shared/lib";
import type { ProblemSummaryDto } from "../types";
import { ProblemDifficultyBadge } from "./problem-difficulty-badge";
import { ProblemStatusBadge } from "./problem-status-badge";
import { BookOpen, Tag, Layers } from "lucide-react";

type ProblemCardProps = {
  problem: ProblemSummaryDto;
  isSelected?: boolean;
  isProposed?: boolean;
  onClick: () => void;
};

export function ProblemCard({
  problem,
  isSelected,
  isProposed,
  onClick,
}: ProblemCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer hover:border-brand-secondary/35",
        isSelected && "border-2 border-brand-primary bg-brand-primary/5",
        isProposed && "border border-yellow-300 bg-yellow-50/5",
      )}
    >
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ProblemDifficultyBadge difficulty={problem.difficultyLevel} />
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-muted-foreground bg-neutral-100 dark:bg-neutral-200 px-2 py-0.5 rounded">
            {problem.code || "PROPOSAL"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isSelected && (
            <span className="inline-flex h-5 items-center justify-center rounded-full bg-brand-primary px-2 text-[10px] font-bold text-white uppercase tracking-wider">
              Selected
            </span>
          )}
          {isProposed && (
            <span className="inline-flex h-5 items-center justify-center rounded-full bg-yellow-500 px-2 text-[10px] font-bold text-white uppercase tracking-wider">
              Proposed
            </span>
          )}
          <ProblemStatusBadge status={problem.status} size="sm" />
        </div>
      </div>

      {/* Title */}
      <h3 className="m-0 text-base font-bold text-foreground leading-snug group-hover:text-brand-primary transition-colors">
        {problem.title}
      </h3>

      {/* Domain Info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BookOpen className="size-4 shrink-0 text-muted" />
        <span className="font-semibold text-muted">
          {problem.domainName} ({problem.domainCode})
        </span>
      </div>

      {/* Theme & Research Area */}
      {(problem.strategicTheme || problem.researchArea) && (
        <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-3 mt-1.5 text-xs text-muted-foreground">
          {problem.strategicTheme && (
            <div
              className="flex items-center gap-1.5 truncate"
              title={`Theme: ${problem.strategicTheme}`}
            >
              <Layers className="size-3.5 text-muted-foreground/50 shrink-0" />
              <span className="truncate">{problem.strategicTheme}</span>
            </div>
          )}
          {problem.researchArea && (
            <div
              className="flex items-center gap-1.5 truncate"
              title={`Area: ${problem.researchArea}`}
            >
              <Tag className="size-3.5 text-muted-foreground/50 shrink-0" />
              <span className="truncate">{problem.researchArea}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
