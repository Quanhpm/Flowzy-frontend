"use client";

import { Eye, Send, X } from "lucide-react";

import { Badge, Button, Card } from "@/shared/components";

import type { GroupJoinRequestDto, GroupSummaryDto } from "../../types";

type GroupCardProps = {
  group: GroupSummaryDto;
  onCancelRequest?: (request: GroupJoinRequestDto) => void;
  onRequestJoin?: (group: GroupSummaryDto) => void;
  onViewDetails: (groupId: number) => void;
  pendingRequest?: GroupJoinRequestDto | null;
};

function formatNullable(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function GroupCard({
  group,
  onCancelRequest,
  onRequestJoin,
  onViewDetails,
  pendingRequest,
}: GroupCardProps) {
  return (
    <Card className="grid gap-4 p-5 transition-all duration-200 hover:shadow-card-interactive">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <h3 className="m-0 text-lg leading-snug font-bold text-foreground">
            {group.name}
          </h3>
          <p className="m-0 text-sm text-muted">
            {group.term} - {group.courseCode} - {group.groupNo}
          </p>
        </div>
        <Badge tone={group.status === "ACTIVE" ? "success" : "neutral"}>
          {group.status}
        </Badge>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Members</dt>
          <dd className="m-0 font-medium text-foreground">
            {group.memberCount}/6
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Leader</dt>
          <dd className="m-0 text-right font-medium text-foreground">
            {formatNullable(group.leaderName)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">GPA</dt>
          <dd className="m-0 font-medium text-foreground">
            {formatNullable(group.requiredGpa)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Target</dt>
          <dd className="m-0 font-medium text-foreground">
            {formatNullable(group.targetGrade)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button
          icon={<Eye size={16} />}
          onClick={() => onViewDetails(group.id)}
          variant="secondary"
        >
          View details
        </Button>
        {pendingRequest ? (
          <>
            <Badge tone="warning">Request pending</Badge>
            {onCancelRequest && (
              <Button
                icon={<X size={16} />}
                onClick={() => onCancelRequest(pendingRequest)}
                variant="ghost"
              >
                Cancel
              </Button>
            )}
          </>
        ) : (
          onRequestJoin && (
            <Button
              icon={<Send size={16} />}
              onClick={() => onRequestJoin(group)}
            >
              Request to join
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
