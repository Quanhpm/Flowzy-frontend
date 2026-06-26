import { Badge } from "@/shared/components";
import type { ProblemDifficulty } from "@/shared/types";

type ProblemDifficultyBadgeProps = {
  difficulty: ProblemDifficulty;
  size?: "sm" | "md";
  className?: string;
};

const difficultyConfig: Record<ProblemDifficulty, { tone: "neutral" | "brand" | "warning" | "success" | "danger"; label: string }> = {
  BEGINNER: { tone: "success", label: "Beginner" },
  INTERMEDIATE: { tone: "warning", label: "Intermediate" },
  ADVANCED: { tone: "danger", label: "Advanced" },
};

export function ProblemDifficultyBadge({ difficulty, size = "sm", className }: ProblemDifficultyBadgeProps) {
  const config = difficultyConfig[difficulty] || { tone: "neutral", label: difficulty };
  return (
    <Badge tone={config.tone} size={size} className={className}>
      {config.label}
    </Badge>
  );
}
