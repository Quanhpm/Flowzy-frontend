"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Search, Users } from "lucide-react";

import { useAuthStore } from "@/modules/auth";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
  TextInput,
} from "@/shared/components";
import { ApiError } from "@/shared/lib";

import {
  useAcceptInvitation,
  useCancelJoinRequest,
  useCreateGroup,
  useCreateJoinRequest,
  useDeclineInvitation,
  useGroup,
  useGroups,
  useMyGroups,
  useMyInvitations,
  useMyJoinRequests,
} from "../../hooks";
import type {
  GroupJoinRequestDto,
  GroupSummaryDto,
  InvitationDto,
} from "../../types";
import { ActiveGroupWorkspace } from "./active-group-workspace";
import { ConfirmDialog } from "./confirm-dialog";
import { GroupCard } from "./group-card";
import { GroupDetailModal } from "./group-detail-modal";
import { GroupFormModal } from "./group-form-modal";
import { InvitationList } from "./invitation-list";
import { MyJoinRequestsSection } from "./join-request-section";

type ConfirmAction = {
  confirmLabel: string;
  description: string;
  onConfirm: () => Promise<unknown>;
  title: string;
  tone?: "default" | "danger";
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function buildPendingRequestMap(requests: GroupJoinRequestDto[]) {
  return new Map(
    requests
      .filter((request) => request.status === "PENDING")
      .map((request) => [request.groupId, request]),
  );
}

export function StudentGroupsPage() {
  const sessionEmail = useAuthStore((state) => state.session?.user.email);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const myGroupsQuery = useMyGroups();
  const myInvitationsQuery = useMyInvitations();
  const groupsQuery = useGroups({ search: optional(search) });
  const myJoinRequestsQuery = useMyJoinRequests();
  const createGroupMutation = useCreateGroup();
  const createJoinRequestMutation = useCreateJoinRequest();
  const cancelJoinRequestMutation = useCancelJoinRequest();
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();

  const myGroup = myGroupsQuery.data?.data?.[0] ?? null;
  const activeGroupQuery = useGroup(myGroup?.id);
  const activeGroup = activeGroupQuery.data?.data ?? null;
  const invitations = myInvitationsQuery.data?.data ?? [];
  const joinRequests = useMemo(
    () => myJoinRequestsQuery.data?.data ?? [],
    [myJoinRequestsQuery.data?.data],
  );
  const pendingRequests = useMemo(
    () => buildPendingRequestMap(joinRequests),
    [joinRequests],
  );

  const recruitingGroups = useMemo(() => {
    const groups = groupsQuery.data?.data ?? [];
    return groups.filter((group) => group.status === "ACTIVE");
  }, [groupsQuery.data?.data]);

  function confirmAcceptInvitation(invitation: InvitationDto) {
    setConfirmAction({
      confirmLabel: "Accept invitation",
      description: `Join ${invitation.groupName}?`,
      onConfirm: () => acceptInvitationMutation.mutateAsync(invitation.id),
      title: "Accept invitation",
    });
  }

  function confirmDeclineInvitation(invitation: InvitationDto) {
    setConfirmAction({
      confirmLabel: "Decline invitation",
      description: `Decline invitation from ${invitation.groupName}?`,
      onConfirm: () => declineInvitationMutation.mutateAsync(invitation.id),
      title: "Decline invitation",
      tone: "danger",
    });
  }

  function confirmCancelJoinRequest(request: GroupJoinRequestDto) {
    setConfirmAction({
      confirmLabel: "Cancel request",
      description: `Cancel your request to join ${request.groupName}?`,
      onConfirm: () =>
        cancelJoinRequestMutation.mutateAsync({
          groupId: request.groupId,
          requestId: request.id,
        }),
      title: "Cancel join request",
    });
  }

  async function requestJoin(group: GroupSummaryDto, message?: string) {
    await createJoinRequestMutation.mutateAsync({
      groupId: group.id,
      payload: { message },
    });
  }

  if (myGroupsQuery.isLoading) {
    return (
      <LoadingState
        description="Checking your current group membership."
        title="Loading groups"
      />
    );
  }

  if (myGroupsQuery.error) {
    return (
      <EmptyState
        className="border-red-200 bg-red-50"
        description={getErrorMessage(myGroupsQuery.error)}
        icon={<AlertTriangle size={22} />}
        title="Unable to load groups"
      />
    );
  }

  if (myGroup) {
    if (activeGroupQuery.isLoading) {
      return <LoadingState title="Loading group workspace" />;
    }

    if (!activeGroup) {
      return (
        <EmptyState
          className="border-red-200 bg-red-50"
          description="Your group summary loaded, but the detail endpoint did not return a group."
          icon={<AlertTriangle size={22} />}
          title="Group detail unavailable"
        />
      );
    }

    return (
      <ActiveGroupWorkspace group={activeGroup} sessionEmail={sessionEmail} />
    );
  }

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
            Create group
          </Button>
        }
        description="Browse recruiting groups, manage invitations, or create a new group."
        eyebrow="Student"
        title="Groups"
      />

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] gap-6 max-[1080px]:grid-cols-1">
        <InvitationList
          emptyDescription="Invitations from group leaders will appear here."
          invitations={invitations}
          mode="received"
          onAccept={confirmAcceptInvitation}
          onDecline={confirmDeclineInvitation}
          title="Invitations"
        />
        <MyJoinRequestsSection />
      </div>

      <Card>
        <CardHeader
          description="Explore active groups and request to join one that fits your project goals."
          title="Recruiting Groups"
        />
        <CardContent>
          <div className="grid gap-4">
            <TextInput
              icon={<Search size={16} />}
              label="Search groups"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by group name"
              value={search}
            />

            {groupsQuery.isLoading ? (
              <LoadingState className="min-h-48" title="Loading groups" />
            ) : groupsQuery.error ? (
              <EmptyState
                className="min-h-48 border-red-200 bg-red-50"
                description={getErrorMessage(groupsQuery.error)}
                icon={<AlertTriangle size={22} />}
                title="Unable to load recruiting groups"
              />
            ) : recruitingGroups.length === 0 ? (
              <EmptyState
                className="min-h-48"
                description="Try a different search term or create your own group."
                icon={<Users size={22} />}
                title="No groups found"
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
                {recruitingGroups.map((group) => (
                  <GroupCard
                    group={group}
                    key={group.id}
                    onCancelRequest={(request) =>
                      confirmCancelJoinRequest(request)
                    }
                    onRequestJoin={(selectedGroup) =>
                      setSelectedGroupId(selectedGroup.id)
                    }
                    onViewDetails={setSelectedGroupId}
                    pendingRequest={pendingRequests.get(group.id) ?? null}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isCreateOpen && (
        <GroupFormModal
          mode="create"
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(payload) => createGroupMutation.mutateAsync(payload)}
        />
      )}

      {selectedGroupId && (
        <GroupDetailModal
          groupId={selectedGroupId}
          onCancelRequest={(request) =>
            cancelJoinRequestMutation.mutateAsync({
              groupId: request.groupId,
              requestId: request.id,
            })
          }
          onClose={() => setSelectedGroupId(null)}
          onRequestJoin={requestJoin}
          pendingRequest={pendingRequests.get(selectedGroupId) ?? null}
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
