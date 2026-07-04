"use client";

import { useState } from "react";
import { LogOut, Pencil, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  PageHeader,
} from "@/shared/components";

import {
  useCancelInvitation,
  useGroupInvitations,
  useLeaveGroup,
  useRemoveMember,
  useTransferLeadership,
  useUpdateGroup,
} from "../../hooks";
import type { GroupDetailDto, GroupMemberDto } from "../../types";
import { ConfirmDialog } from "./confirm-dialog";
import { GroupFormModal } from "./group-form-modal";
import { InvitationList } from "./invitation-list";
import { JoinRequestSection } from "./join-request-section";
import { MeetingBookingSection } from "./meeting-booking-section";
import { MemberList } from "./member-list";

type ConfirmAction = {
  confirmLabel: string;
  description: string;
  onConfirm: () => Promise<unknown>;
  title: string;
  tone?: "default" | "danger";
};

type ActiveGroupWorkspaceProps = {
  group: GroupDetailDto;
  sessionEmail?: string;
};

function formatNullable(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function isCurrentUserLeader(group: GroupDetailDto, email: string | undefined) {
  if (!email) return false;

  if (group.leader?.email === email) return true;

  return group.members.some(
    (member) => member.email === email && member.role === "LEADER",
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <dt className="text-xs font-bold tracking-[0.04em] text-muted uppercase">
        {label}
      </dt>
      <dd className="m-0 mt-1 text-sm leading-relaxed text-foreground">
        {formatNullable(value)}
      </dd>
    </div>
  );
}

export function ActiveGroupWorkspace({
  group,
  sessionEmail,
}: ActiveGroupWorkspaceProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [localError, setLocalError] = useState("");

  const updateGroupMutation = useUpdateGroup();
  const cancelInvitationMutation = useCancelInvitation();
  const leaveGroupMutation = useLeaveGroup();
  const removeMemberMutation = useRemoveMember();
  const transferLeadershipMutation = useTransferLeadership();
  const invitationsQuery = useGroupInvitations(group.id);

  const invitations = invitationsQuery.data?.data ?? [];
  const isLeader = isCurrentUserLeader(group, sessionEmail);

  function requestLeaveGroup() {
    setLocalError("");

    if (isLeader && group.members.length > 1) {
      setLocalError("Transfer leadership before leaving this group.");
      return;
    }

    setConfirmAction({
      confirmLabel: "Leave group",
      description: "Are you sure you want to leave this group?",
      onConfirm: () => leaveGroupMutation.mutateAsync(group.id),
      title: "Leave group",
      tone: "danger",
    });
  }

  function requestRemoveMember(member: GroupMemberDto) {
    setConfirmAction({
      confirmLabel: "Remove member",
      description: `Remove ${member.fullName} from this group?`,
      onConfirm: () =>
        removeMemberMutation.mutateAsync({
          groupId: group.id,
          studentId: member.studentId,
        }),
      title: "Remove member",
      tone: "danger",
    });
  }

  function requestTransferLeadership(member: GroupMemberDto) {
    setConfirmAction({
      confirmLabel: "Transfer leadership",
      description: `Make ${member.fullName} the new group leader?`,
      onConfirm: () =>
        transferLeadershipMutation.mutateAsync({
          groupId: group.id,
          payload: { studentId: member.studentId },
        }),
      title: "Transfer leadership",
    });
  }

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            {isLeader && (
              <>
                <Button
                  icon={<Pencil size={16} />}
                  onClick={() => setIsEditOpen(true)}
                  variant="secondary"
                >
                  Edit group
                </Button>
                <Button
                  icon={<UserPlus size={16} />}
                  onClick={() => router.push("/student/groups/invite")}
                >
                  Invite member
                </Button>
              </>
            )}
            <Button
              icon={<LogOut size={16} />}
              onClick={requestLeaveGroup}
              variant="danger"
            >
              Leave group
            </Button>
          </div>
        }
        description="Manage your group profile, members, invitations, join requests, and mentor meetings."
        eyebrow="Student"
        title="My Group Workspace"
      />

      {localError && (
        <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </p>
      )}

      <Card>
        <CardHeader
          actions={<Badge tone={group.status === "ACTIVE" ? "success" : "neutral"}>{group.status}</Badge>}
          description={`${group.term} - ${group.courseCode} - ${group.groupNo}`}
          title={group.name}
        />
        <CardContent>
          <div className="grid gap-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              <InfoItem label="Project" value={group.projectName} />
              <InfoItem label="Research domain" value={group.researchDomain} />
              <InfoItem label="Required GPA" value={group.requiredGpa} />
              <InfoItem label="Target grade" value={group.targetGrade} />
              <InfoItem label="Leader" value={group.leader?.fullName} />
              <InfoItem label="Mentor" value={group.mentor?.fullName} />
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <h3 className="m-0 text-sm font-bold text-foreground">
                Idea description
              </h3>
              <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
                {group.ideaDescription ?? "No idea description yet."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <MemberList
        group={group}
        isLeader={isLeader}
        onRemoveMember={requestRemoveMember}
        onTransferLeadership={requestTransferLeadership}
      />

      {isLeader && (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] gap-6 max-[1080px]:grid-cols-1">
          <JoinRequestSection groupId={group.id} />
          <InvitationList
            emptyDescription="No sent invitations for this group."
            invitations={invitations}
            mode="sent"
            onCancel={(invitation) =>
              setConfirmAction({
                confirmLabel: "Cancel invitation",
                description: `Cancel invitation for ${invitation.studentName}?`,
                onConfirm: () =>
                  cancelInvitationMutation.mutateAsync(invitation.id),
                title: "Cancel invitation",
              })
            }
            title="Sent Invitations"
          />
        </div>
      )}

      <MeetingBookingSection canBook={isLeader} group={group} />

      {isEditOpen && (
        <GroupFormModal
          group={group}
          mode="edit"
          onClose={() => setIsEditOpen(false)}
          onSubmit={(payload) =>
            updateGroupMutation.mutateAsync({ groupId: group.id, payload })
          }
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          confirmLabel={confirmAction.confirmLabel}
          description={confirmAction.description}
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          tone={confirmAction.tone}
        />
      )}
    </div>
  );
}
