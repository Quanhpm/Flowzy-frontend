"use client";

import { ArrowRightLeft, Crown, Trash2, Users } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
} from "@/shared/components";

import type { GroupDetailDto, GroupMemberDto } from "../../types";

type MemberListProps = {
  group: GroupDetailDto;
  isLeader: boolean;
  onRemoveMember: (member: GroupMemberDto) => void;
  onTransferLeadership: (member: GroupMemberDto) => void;
};

export function MemberList({
  group,
  isLeader,
  onRemoveMember,
  onTransferLeadership,
}: MemberListProps) {
  return (
    <Card>
      <CardHeader
        description="Current members and leader actions."
        title="Members"
      />
      <CardContent>
        {group.members.length === 0 ? (
          <EmptyState
            className="min-h-40"
            icon={<Users size={22} />}
            title="No members"
          />
        ) : (
          <div className="grid gap-3">
            {group.members.map((member) => {
              const isMemberLeader = member.role === "LEADER";

              return (
                <article
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 max-[680px]:grid"
                  key={member.studentId}
                >
                  <div className="grid min-w-0 gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-foreground">
                        {member.fullName}
                      </strong>
                      <Badge
                        icon={isMemberLeader ? <Crown size={13} /> : undefined}
                        tone={isMemberLeader ? "brand" : "neutral"}
                        size="sm"
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted">
                      {member.studentCode} - {member.email}
                    </span>
                  </div>

                  {isLeader && !isMemberLeader && (
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        icon={<ArrowRightLeft size={16} />}
                        onClick={() => onTransferLeadership(member)}
                        size="sm"
                        variant="secondary"
                      >
                        Make leader
                      </Button>
                      <Button
                        icon={<Trash2 size={16} />}
                        onClick={() => onRemoveMember(member)}
                        size="sm"
                        variant="danger"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
