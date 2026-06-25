"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  CalendarClock,
  Check,
  Crown,
  Eye,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { useAuthStore } from "@/modules/auth";
import {
  useBookMeeting,
  useGroupMeetings,
  useMentorAvailabilityForGroup,
} from "@/modules/mentoring";
import type { MentorAvailabilitySlotDto } from "@/modules/mentoring";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
  TextInput,
} from "@/shared/components";
import { ApiError, cn } from "@/shared/lib";
import type { GroupStatus, InvitationStatus } from "@/shared/types";

import {
  useAcceptInvitation,
  useCancelInvitation,
  useCreateGroup,
  useDeclineInvitation,
  useGroup,
  useGroupInvitations,
  useGroups,
  useInviteStudent,
  useLeaveGroup,
  useMyGroups,
  useMyInvitations,
  useRemoveMember,
  useTransferLeadership,
  useUpdateGroup,
} from "../hooks";
import type {
  CreateGroupRequest,
  GroupDetailDto,
  GroupMemberDto,
  GroupSummaryDto,
  InvitationDto,
  UpdateGroupRequest,
} from "../types";

type GroupFormState = {
  courseCode: string;
  ideaDescription: string;
  name: string;
  projectName: string;
  requiredGpa: string;
  researchDomain: string;
  targetGrade: string;
  term: string;
};

type ConfirmAction = {
  confirmLabel: string;
  description: string;
  onConfirm: () => Promise<unknown>;
  title: string;
  variant?: "primary" | "danger";
};

const EMPTY_GROUP_FORM: GroupFormState = {
  courseCode: "",
  ideaDescription: "",
  name: "",
  projectName: "",
  requiredGpa: "",
  researchDomain: "",
  targetGrade: "",
  term: "",
};

const pageClassName = "grid min-w-0 gap-6";
const gridClassName =
  "grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4";
const modalBackdropClassName =
  "fixed inset-0 z-40 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6 max-[680px]:p-3";
const modalClassName =
  "grid w-[min(820px,100%)] max-h-[min(820px,calc(100svh-48px))] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal max-[680px]:max-h-[calc(100svh-24px)]";
const modalSmallClassName = "w-[min(520px,100%)]";
const modalHeaderClassName =
  "flex items-start justify-between gap-4 border-b border-border px-6 py-[22px] max-[680px]:px-[18px]";
const modalTitleClassName =
  "m-0 text-xl leading-tight font-bold text-foreground";
const modalDescriptionClassName =
  "mt-1.5 mb-0 text-sm leading-[1.55] text-muted";
const modalBodyClassName =
  "grid gap-[18px] overflow-y-auto p-6 max-[680px]:px-[18px]";
const modalFooterClassName =
  "flex justify-end gap-2.5 border-t border-border bg-surface px-6 py-[18px] max-[680px]:px-[18px]";
const formGridClassName =
  "grid grid-cols-2 gap-3.5 max-[680px]:grid-cols-[minmax(0,1fr)]";
const fullSpanClassName = "col-span-full";
const errorPanelClassName =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-normal text-red-700";
const subtlePanelClassName =
  "rounded-xl border border-border bg-background px-4 py-3.5 text-sm leading-normal text-muted";
const detailGridClassName =
  "grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3";
const labelClassName = "text-xs font-bold tracking-[0.04em] text-muted uppercase";
const valueClassName = "mt-1 text-sm leading-[1.5] text-foreground";
const actionsClassName = "flex flex-wrap justify-end gap-2";

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : undefined;
}

function formatNullable(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getGroupStatusTone(status: GroupStatus) {
  return status === "ACTIVE" ? "success" : "neutral";
}

function getInvitationTone(status: InvitationStatus) {
  if (status === "PENDING") return "warning";
  if (status === "ACCEPTED") return "success";
  if (status === "DECLINED" || status === "CANCELED") return "danger";
  return "neutral";
}

function createFormFromGroup(group: GroupDetailDto): GroupFormState {
  return {
    courseCode: group.courseCode,
    ideaDescription: group.ideaDescription ?? "",
    name: group.name,
    projectName: group.projectName ?? "",
    requiredGpa:
      group.requiredGpa === null || group.requiredGpa === undefined
        ? ""
        : String(group.requiredGpa),
    researchDomain: group.researchDomain ?? "",
    targetGrade:
      group.targetGrade === null || group.targetGrade === undefined
        ? ""
        : String(group.targetGrade),
    term: group.term,
  };
}

function validateGroupForm(form: GroupFormState, mode: "create" | "edit") {
  if (mode === "create" && (!form.term.trim() || !form.courseCode.trim())) {
    return "Term and course code are required.";
  }

  if (!form.name.trim()) {
    return "Group name is required.";
  }

  if (form.requiredGpa && Number.isNaN(Number(form.requiredGpa))) {
    return "Required GPA must be a valid number.";
  }

  if (form.targetGrade && Number.isNaN(Number(form.targetGrade))) {
    return "Target grade must be a valid number.";
  }

  return null;
}

function createGroupPayload(form: GroupFormState): CreateGroupRequest {
  return {
    courseCode: form.courseCode.trim(),
    ideaDescription: optional(form.ideaDescription),
    name: form.name.trim(),
    projectName: optional(form.projectName),
    requiredGpa: optionalNumber(form.requiredGpa),
    researchDomain: optional(form.researchDomain),
    targetGrade: optionalNumber(form.targetGrade),
    term: form.term.trim(),
  };
}

function updateGroupPayload(form: GroupFormState): UpdateGroupRequest {
  return {
    ideaDescription: optional(form.ideaDescription),
    name: form.name.trim(),
    projectName: optional(form.projectName),
    requiredGpa: optionalNumber(form.requiredGpa),
    researchDomain: optional(form.researchDomain),
    targetGrade: optionalNumber(form.targetGrade),
  };
}

function isCurrentUserLeader(group: GroupDetailDto, email: string | undefined) {
  if (!email) return false;

  return group.members.some(
    (member) =>
      member.email.toLowerCase() === email.toLowerCase() &&
      member.role === "LEADER",
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
    <div className="min-w-0 rounded-xl border border-border bg-surface px-4 py-3">
      <div className={labelClassName}>{label}</div>
      <div className={valueClassName}>{formatNullable(value)}</div>
    </div>
  );
}

function ConfirmDialog({
  action,
  onClose,
}: {
  action: ConfirmAction;
  onClose: () => void;
}) {
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setFormError("");

    try {
      setIsSubmitting(true);
      await action.onConfirm();
      onClose();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={modalBackdropClassName}>
      <div
        aria-label={action.title}
        aria-modal="true"
        className={cn(modalClassName, modalSmallClassName)}
        role="dialog"
      >
        <header className={modalHeaderClassName}>
          <div>
            <h2 className={modalTitleClassName}>{action.title}</h2>
            <p className={modalDescriptionClassName}>
              {action.description}
            </p>
          </div>
          <Button
            aria-label="Close"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>
        <div className={modalBodyClassName}>
          {formError && <div className={errorPanelClassName}>{formError}</div>}
        </div>
        <footer className={modalFooterClassName}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleConfirm}
            variant={action.variant ?? "primary"}
          >
            {isSubmitting ? "Working..." : action.confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function GroupFormModal({
  group,
  mode,
  onClose,
  onSubmit,
}: {
  group?: GroupDetailDto;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (form: GroupFormState) => Promise<unknown>;
}) {
  const [form, setForm] = useState<GroupFormState>(() =>
    mode === "edit" && group ? createFormFromGroup(group) : EMPTY_GROUP_FORM,
  );
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof GroupFormState>(
    field: K,
    value: GroupFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validationError = validateGroupForm(form, mode);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = mode === "create" ? "Create group" : "Edit group";
  const description =
    mode === "create"
      ? "Start a group workspace and define the recruiting criteria."
      : "Update group information, project direction, and target criteria.";

  return (
    <div className={modalBackdropClassName}>
      <form
        aria-label={title}
        aria-modal="true"
        className={modalClassName}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <header className={modalHeaderClassName}>
          <div>
            <h2 className={modalTitleClassName}>{title}</h2>
            <p className={modalDescriptionClassName}>{description}</p>
          </div>
          <Button
            aria-label="Close"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>
        <div className={modalBodyClassName}>
          {formError && <div className={errorPanelClassName}>{formError}</div>}
          <div className={formGridClassName}>
            <TextInput
              disabled={mode === "edit"}
              label="Term"
              onChange={(event) => updateField("term", event.target.value)}
              placeholder="Summer2025"
              value={form.term}
            />
            <TextInput
              disabled={mode === "edit"}
              label="Course code"
              onChange={(event) =>
                updateField("courseCode", event.target.value)
              }
              placeholder="EXE201"
              value={form.courseCode}
            />
            <TextInput
              fieldClassName={fullSpanClassName}
              label="Group name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="F-Spark Team"
              value={form.name}
            />
            <TextInput
              label="Project name"
              onChange={(event) =>
                updateField("projectName", event.target.value)
              }
              placeholder="F-Spark Platform"
              value={form.projectName}
            />
            <TextInput
              label="Research domain"
              onChange={(event) =>
                updateField("researchDomain", event.target.value)
              }
              placeholder="AI, EdTech, Web..."
              value={form.researchDomain}
            />
            <TextInput
              label="Required GPA"
              min="0"
              onChange={(event) =>
                updateField("requiredGpa", event.target.value)
              }
              placeholder="2.5"
              step="0.1"
              type="number"
              value={form.requiredGpa}
            />
            <TextInput
              label="Target grade"
              min="0"
              onChange={(event) =>
                updateField("targetGrade", event.target.value)
              }
              placeholder="8.0"
              step="0.1"
              type="number"
              value={form.targetGrade}
            />
            <TextInput
              fieldClassName={fullSpanClassName}
              label="Idea description"
              onChange={(event) =>
                updateField("ideaDescription", event.target.value)
              }
              placeholder="Describe the group idea or product direction"
              value={form.ideaDescription}
            />
          </div>
        </div>
        <footer className={modalFooterClassName}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save group"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

function InviteStudentModal({
  group,
  onClose,
  onSubmit,
}: {
  group: GroupDetailDto;
  onClose: () => void;
  onSubmit: (payload: {
    groupId: number;
    studentCodeOrEmail: string;
    message?: string;
  }) => Promise<unknown>;
}) {
  const [studentCodeOrEmail, setStudentCodeOrEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!studentCodeOrEmail.trim()) {
      setFormError("Student code or email is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        groupId: group.id,
        message: optional(message),
        studentCodeOrEmail: studentCodeOrEmail.trim(),
      });
      onClose();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={modalBackdropClassName}>
      <form
        aria-label="Invite student"
        aria-modal="true"
        className={cn(modalClassName, modalSmallClassName)}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <header className={modalHeaderClassName}>
          <div>
            <h2 className={modalTitleClassName}>Invite student</h2>
            <p className={modalDescriptionClassName}>
              Send an invitation to join {group.name}.
            </p>
          </div>
          <Button
            aria-label="Close"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>
        <div className={modalBodyClassName}>
          {formError && <div className={errorPanelClassName}>{formError}</div>}
          <TextInput
            icon={<UserPlus size={16} />}
            label="Student code or email"
            onChange={(event) => setStudentCodeOrEmail(event.target.value)}
            placeholder="SE12345 or student@fpt.edu.vn"
            value={studentCodeOrEmail}
          />
          <TextInput
            label="Message"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Join our EXE team"
            value={message}
          />
        </div>
        <footer className={modalFooterClassName}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSubmitting} icon={<Mail size={16} />} type="submit">
            {isSubmitting ? "Sending..." : "Send invite"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

function GroupCard({
  group,
  onViewDetails,
}: {
  group: GroupSummaryDto;
  onViewDetails?: () => void;
}) {
  return (
    <Card className="transition-all duration-200 ease-in-out hover:shadow-card-interactive">
      <CardContent className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="m-0 text-[17px] leading-tight font-bold text-foreground">
              {group.name}
            </h3>
            <p className="mt-1 mb-0 text-sm text-muted">
              {group.groupNo} · {group.term} · {group.courseCode}
            </p>
          </div>
          <Badge tone={getGroupStatusTone(group.status)}>{group.status}</Badge>
        </div>
        <div className={detailGridClassName}>
          <InfoItem label="Leader" value={group.leaderName} />
          <InfoItem label="Members" value={group.memberCount} />
          <InfoItem label="Target grade" value={group.targetGrade} />
        </div>
        {group.selectedProblem && (
          <div className={subtlePanelClassName}>
            <span className="font-medium text-foreground">
              {group.selectedProblem.code}
            </span>{" "}
            {group.selectedProblem.title}
          </div>
        )}
        {onViewDetails && (
          <div className="flex justify-end">
            <Button
              icon={<Eye size={16} />}
              onClick={onViewDetails}
              size="sm"
              variant="secondary"
            >
              View details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvitationList({
  invitations,
  mode,
  onAccept,
  onCancel,
  onDecline,
}: {
  invitations: InvitationDto[];
  mode: "received" | "sent";
  onAccept?: (invitationId: number) => void;
  onCancel?: (invitationId: number) => void;
  onDecline?: (invitationId: number) => void;
}) {
  if (invitations.length === 0) {
    return (
      <EmptyState
        description={
          mode === "received"
            ? "You do not have pending group invitations."
            : "No invitations have been sent from this group yet."
        }
        title="No invitations"
      />
    );
  }

  return (
    <div className="grid gap-3">
      {invitations.map((invitation) => (
        <div
          className="grid gap-3 rounded-xl border border-border bg-surface p-4"
          key={invitation.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="m-0 text-sm font-bold text-foreground">
                {invitation.groupName} · {invitation.groupNo}
              </h3>
              <p className="mt-1 mb-0 text-[13px] text-muted">
                {mode === "received"
                  ? `Invited by ${invitation.inviterName}`
                  : `Sent to ${invitation.studentName}`}
              </p>
            </div>
            <Badge tone={getInvitationTone(invitation.status)}>
              {invitation.status}
            </Badge>
          </div>
          {invitation.message && (
            <p className="m-0 text-sm leading-[1.55] text-foreground">
              {invitation.message}
            </p>
          )}
          {invitation.status === "PENDING" && (
            <div className={actionsClassName}>
              {mode === "received" && onAccept && (
                <Button
                  icon={<Check size={15} />}
                  onClick={() => onAccept(invitation.id)}
                  size="sm"
                >
                  Accept
                </Button>
              )}
              {mode === "received" && onDecline && (
                <Button
                  onClick={() => onDecline(invitation.id)}
                  size="sm"
                  variant="secondary"
                >
                  Decline
                </Button>
              )}
              {mode === "sent" && onCancel && (
                <Button
                  onClick={() => onCancel(invitation.id)}
                  size="sm"
                  variant="danger"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MemberList({
  group,
  isLeader,
  onRemoveMember,
  onTransferLeadership,
}: {
  group: GroupDetailDto;
  isLeader: boolean;
  onRemoveMember: (member: GroupMemberDto) => void;
  onTransferLeadership: (member: GroupMemberDto) => void;
}) {
  return (
    <Card>
      <CardHeader
        description="Review roles and manage team membership."
        title="Members"
      />
      <CardContent className="grid gap-3">
        {group.members.map((member) => (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
            key={member.studentId}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-foreground">
                  {member.fullName}
                </span>
                <Badge
                  icon={member.role === "LEADER" ? <Crown size={13} /> : null}
                  tone={member.role === "LEADER" ? "brand" : "neutral"}
                >
                  {member.role}
                </Badge>
              </div>
              <p className="mt-1 mb-0 text-[13px] text-muted">
                {member.studentCode} · {member.email}
              </p>
            </div>
            {isLeader && member.role !== "LEADER" && (
              <div className={actionsClassName}>
                <Button
                  icon={<ArrowRightLeft size={15} />}
                  onClick={() => onTransferLeadership(member)}
                  size="sm"
                  variant="secondary"
                >
                  Make leader
                </Button>
                <Button
                  icon={<Trash2 size={15} />}
                  onClick={() => onRemoveMember(member)}
                  size="sm"
                  variant="danger"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MeetingBookingSection({
  group,
  isLeader,
}: {
  group: GroupDetailDto;
  isLeader: boolean;
}) {
  const availabilityQuery = useMentorAvailabilityForGroup(
    group.mentor ? group.id : null,
  );
  const meetingsQuery = useGroupMeetings(group.id);
  const bookMeetingMutation = useBookMeeting();

  async function bookSlot(slot: MentorAvailabilitySlotDto) {
    await bookMeetingMutation.mutateAsync({
      groupId: group.id,
      payload: { slotId: slot.id },
    });
  }

  const slots = availabilityQuery.data?.data ?? [];
  const meetings = meetingsQuery.data?.data ?? [];

  return (
    <Card>
      <CardHeader
        description="Coordinate mentor availability and scheduled meetings."
        title="Mentor & meetings"
      />
      <CardContent className="grid gap-5">
        {group.mentor ? (
          <div className={detailGridClassName}>
            <InfoItem label="Mentor" value={group.mentor.fullName} />
            <InfoItem label="Code" value={group.mentor.mentorCode} />
            <InfoItem label="Expertise" value={group.mentor.expertise} />
            <InfoItem label="Company" value={group.mentor.company} />
          </div>
        ) : (
          <EmptyState
            description="This group does not have an assigned mentor yet."
            title="No mentor assigned"
          />
        )}

        {group.mentor && (
          <div className="grid gap-3">
            <h3 className="m-0 text-sm font-bold text-foreground">
              Available slots
            </h3>
            {availabilityQuery.isLoading ? (
              <LoadingState title="Loading mentor availability" />
            ) : availabilityQuery.isError ? (
              <div className={errorPanelClassName}>
                {getErrorMessage(availabilityQuery.error)}
              </div>
            ) : slots.length === 0 ? (
              <EmptyState
                description="There are no open slots from this mentor."
                title="No slots available"
              />
            ) : (
              <div className="grid gap-3">
                {slots.map((slot) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
                    key={slot.id}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-foreground">
                        {formatDateTime(slot.startAt)}
                      </div>
                      <p className="mt-1 mb-0 text-[13px] text-muted">
                        Ends {formatDateTime(slot.endAt)}
                      </p>
                      {slot.note && (
                        <p className="mt-2 mb-0 text-sm text-foreground">
                          {slot.note}
                        </p>
                      )}
                    </div>
                    <div className={actionsClassName}>
                      <Badge tone="success">{slot.status}</Badge>
                      {isLeader && (
                        <Button
                          disabled={bookMeetingMutation.isPending}
                          icon={<CalendarClock size={15} />}
                          onClick={() => bookSlot(slot)}
                          size="sm"
                        >
                          Book
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-3">
          <h3 className="m-0 text-sm font-bold text-foreground">
            Scheduled meetings
          </h3>
          {meetingsQuery.isLoading ? (
            <LoadingState title="Loading meetings" />
          ) : meetingsQuery.isError ? (
            <div className={errorPanelClassName}>
              {getErrorMessage(meetingsQuery.error)}
            </div>
          ) : meetings.length === 0 ? (
            <EmptyState
              description="No meetings have been booked for this group."
              title="No meetings"
            />
          ) : (
            <div className="grid gap-3">
              {meetings.map((meeting) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
                  key={meeting.id}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-foreground">
                      {formatDateTime(meeting.startAt)}
                    </div>
                    <a
                      className="mt-1 inline-block text-[13px] font-medium text-brand-primary"
                      href={meeting.meetLink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open meet link
                    </a>
                  </div>
                  <Badge
                    tone={meeting.status === "SCHEDULED" ? "success" : "danger"}
                  >
                    {meeting.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GroupDetailModal({
  groupId,
  onClose,
}: {
  groupId: number;
  onClose: () => void;
}) {
  const groupQuery = useGroup(groupId);
  const group = groupQuery.data?.data;

  return (
    <div className={modalBackdropClassName}>
      <div
        aria-label="Group details"
        aria-modal="true"
        className={modalClassName}
        role="dialog"
      >
        <header className={modalHeaderClassName}>
          <div>
            <h2 className={modalTitleClassName}>
              {group?.name ?? "Group details"}
            </h2>
            <p className={modalDescriptionClassName}>
              Review group profile, criteria, members, and mentor assignment.
            </p>
          </div>
          <Button
            aria-label="Close"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>
        <div className={modalBodyClassName}>
          {groupQuery.isLoading ? (
            <LoadingState title="Loading group details" />
          ) : groupQuery.isError ? (
            <div className={errorPanelClassName}>
              {getErrorMessage(groupQuery.error)}
            </div>
          ) : group ? (
            <>
              <div className={detailGridClassName}>
                <InfoItem label="Term" value={group.term} />
                <InfoItem label="Course" value={group.courseCode} />
                <InfoItem label="Project" value={group.projectName} />
                <InfoItem label="Domain" value={group.researchDomain} />
                <InfoItem label="Required GPA" value={group.requiredGpa} />
                <InfoItem label="Target grade" value={group.targetGrade} />
              </div>
              {group.ideaDescription && (
                <div className={subtlePanelClassName}>
                  {group.ideaDescription}
                </div>
              )}
              <div className="grid gap-3">
                <h3 className="m-0 text-sm font-bold text-foreground">
                  Members
                </h3>
                {group.members.map((member) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                    key={member.studentId}
                  >
                    <div>
                      <div className="font-bold text-foreground">
                        {member.fullName}
                      </div>
                      <div className="text-[13px] text-muted">
                        {member.studentCode} · {member.email}
                      </div>
                    </div>
                    <Badge tone={member.role === "LEADER" ? "brand" : "neutral"}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ActiveGroupWorkspace({
  group,
  isLeader,
  onEdit,
  onInvite,
  onLeave,
  onRemoveMember,
  onShowInvitations,
  onTransferLeadership,
}: {
  group: GroupDetailDto;
  isLeader: boolean;
  onEdit: () => void;
  onInvite: () => void;
  onLeave: () => void;
  onRemoveMember: (member: GroupMemberDto) => void;
  onShowInvitations: () => void;
  onTransferLeadership: (member: GroupMemberDto) => void;
}) {
  return (
    <div className={pageClassName}>
      <PageHeader
        actions={
          <div className={actionsClassName}>
            {isLeader ? (
              <>
                <Button
                  icon={<Pencil size={16} />}
                  onClick={onEdit}
                  variant="secondary"
                >
                  Edit group
                </Button>
                <Button
                  icon={<UserPlus size={16} />}
                  onClick={onInvite}
                >
                  Invite member
                </Button>
                <Button
                  icon={<Mail size={16} />}
                  onClick={onShowInvitations}
                  variant="ghost"
                >
                  Sent invites
                </Button>
              </>
            ) : (
              <Button icon={<LogOut size={16} />} onClick={onLeave} variant="danger">
                Leave group
              </Button>
            )}
          </div>
        }
        description="Track group profile, members, criteria, mentor availability, and meetings in one workspace."
        eyebrow="Student"
        title="My Group Workspace"
      />

      <div className={gridClassName}>
        <Card>
          <CardHeader title="Group information" />
          <CardContent className="grid gap-4">
            <div className={detailGridClassName}>
              <InfoItem label="Group" value={`${group.groupNo} · ${group.name}`} />
              <InfoItem label="Term" value={group.term} />
              <InfoItem label="Course" value={group.courseCode} />
              <InfoItem label="Project" value={group.projectName} />
              <InfoItem label="Domain" value={group.researchDomain} />
              <InfoItem label="Status" value={group.status} />
            </div>
            {group.ideaDescription && (
              <div className={subtlePanelClassName}>
                {group.ideaDescription}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Criteria" />
          <CardContent className={detailGridClassName}>
            <InfoItem label="Required GPA" value={group.requiredGpa} />
            <InfoItem label="Target grade" value={group.targetGrade} />
            <InfoItem
              label="Selected problem"
              value={group.selectedProblem?.title}
            />
          </CardContent>
        </Card>
      </div>

      <MemberList
        group={group}
        isLeader={isLeader}
        onRemoveMember={onRemoveMember}
        onTransferLeadership={onTransferLeadership}
      />

      <MeetingBookingSection group={group} isLeader={isLeader} />
    </div>
  );
}

export function StudentGroupsPage() {
  const sessionEmail = useAuthStore((state) => state.session?.user.email);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<
    "create" | "edit" | "invite" | "sent-invitations" | null
  >(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const myGroupsQuery = useMyGroups();
  const myInvitationsQuery = useMyInvitations();
  const groupsQuery = useGroups({ search: optional(search) });
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const inviteStudentMutation = useInviteStudent();
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();
  const cancelInvitationMutation = useCancelInvitation();
  const leaveGroupMutation = useLeaveGroup();
  const removeMemberMutation = useRemoveMember();
  const transferLeadershipMutation = useTransferLeadership();

  const myGroup = myGroupsQuery.data?.data?.[0] ?? null;
  const activeGroupQuery = useGroup(myGroup?.id);
  const activeGroup = activeGroupQuery.data?.data ?? null;
  const activeGroupInvitationsQuery = useGroupInvitations(activeGroup?.id);
  const activeGroupInvitations = activeGroupInvitationsQuery.data?.data ?? [];

  const recruitingGroups = useMemo(() => {
    const groups = groupsQuery.data?.data ?? [];
    if (!myGroup) return groups.filter((group) => group.status === "ACTIVE");
    return groups;
  }, [groupsQuery.data?.data, myGroup]);

  const isLeader = activeGroup
    ? isCurrentUserLeader(activeGroup, sessionEmail)
    : false;

  async function handleCreateGroup(form: GroupFormState) {
    await createGroupMutation.mutateAsync(createGroupPayload(form));
  }

  async function handleUpdateGroup(form: GroupFormState) {
    if (!activeGroup) return;

    await updateGroupMutation.mutateAsync({
      groupId: activeGroup.id,
      payload: updateGroupPayload(form),
    });
  }

  function requestLeaveGroup() {
    if (!activeGroup) return;

    setConfirmAction({
      confirmLabel: "Leave group",
      description:
        "You will leave this group workspace and lose access to its member tools.",
      onConfirm: () => leaveGroupMutation.mutateAsync(activeGroup.id),
      title: "Leave group",
      variant: "danger",
    });
  }

  function requestRemoveMember(member: GroupMemberDto) {
    if (!activeGroup) return;

    setConfirmAction({
      confirmLabel: "Remove member",
      description: `Remove ${member.fullName} from ${activeGroup.name}.`,
      onConfirm: () =>
        removeMemberMutation.mutateAsync({
          groupId: activeGroup.id,
          studentId: member.studentId,
        }),
      title: "Remove member",
      variant: "danger",
    });
  }

  function requestTransferLeadership(member: GroupMemberDto) {
    if (!activeGroup) return;

    setConfirmAction({
      confirmLabel: "Transfer leadership",
      description: `Transfer group leadership to ${member.fullName}.`,
      onConfirm: () =>
        transferLeadershipMutation.mutateAsync({
          groupId: activeGroup.id,
          payload: { studentId: member.studentId },
        }),
      title: "Transfer leadership",
    });
  }

  if (myGroupsQuery.isLoading) {
    return (
      <div className={pageClassName}>
        <PageHeader eyebrow="Student" title="Groups" />
        <Card isPadded>
          <LoadingState title="Loading your group workspace" />
        </Card>
      </div>
    );
  }

  if (myGroupsQuery.isError) {
    return (
      <div className={pageClassName}>
        <PageHeader eyebrow="Student" title="Groups" />
        <Card isPadded>
          <div className={errorPanelClassName}>
            {getErrorMessage(myGroupsQuery.error)}
          </div>
        </Card>
      </div>
    );
  }

  if (myGroup) {
    return (
      <>
        {activeGroupQuery.isLoading ? (
          <div className={pageClassName}>
            <PageHeader eyebrow="Student" title="My Group Workspace" />
            <Card isPadded>
              <LoadingState title="Loading group detail" />
            </Card>
          </div>
        ) : activeGroupQuery.isError ? (
          <div className={pageClassName}>
            <PageHeader eyebrow="Student" title="My Group Workspace" />
            <Card isPadded>
              <div className={errorPanelClassName}>
                {getErrorMessage(activeGroupQuery.error)}
              </div>
            </Card>
          </div>
        ) : activeGroup ? (
          <ActiveGroupWorkspace
            group={activeGroup}
            isLeader={isLeader}
            onEdit={() => setModal("edit")}
            onInvite={() => setModal("invite")}
            onLeave={requestLeaveGroup}
            onRemoveMember={requestRemoveMember}
            onShowInvitations={() => setModal("sent-invitations")}
            onTransferLeadership={requestTransferLeadership}
          />
        ) : null}

        {modal === "edit" && activeGroup && (
          <GroupFormModal
            group={activeGroup}
            mode="edit"
            onClose={() => setModal(null)}
            onSubmit={handleUpdateGroup}
          />
        )}

        {modal === "invite" && activeGroup && (
          <InviteStudentModal
            group={activeGroup}
            onClose={() => setModal(null)}
            onSubmit={({ groupId, message, studentCodeOrEmail }) =>
              inviteStudentMutation.mutateAsync({
                groupId,
                payload: { message, studentCodeOrEmail },
              })
            }
          />
        )}

        {modal === "sent-invitations" && (
          <div className={modalBackdropClassName}>
            <div
              aria-label="Sent invitations"
              aria-modal="true"
              className={modalClassName}
              role="dialog"
            >
              <header className={modalHeaderClassName}>
                <div>
                  <h2 className={modalTitleClassName}>Sent invitations</h2>
                  <p className={modalDescriptionClassName}>
                    Review invitation status and cancel pending invitations.
                  </p>
                </div>
                <Button
                  aria-label="Close"
                  icon={<X size={16} />}
                  onClick={() => setModal(null)}
                  size="sm"
                  variant="ghost"
                />
              </header>
              <div className={modalBodyClassName}>
                {activeGroupInvitationsQuery.isLoading ? (
                  <LoadingState title="Loading invitations" />
                ) : activeGroupInvitationsQuery.isError ? (
                  <div className={errorPanelClassName}>
                    {getErrorMessage(activeGroupInvitationsQuery.error)}
                  </div>
                ) : (
                  <InvitationList
                    invitations={activeGroupInvitations}
                    mode="sent"
                    onCancel={(invitationId) =>
                      cancelInvitationMutation.mutate(invitationId)
                    }
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {confirmAction && (
          <ConfirmDialog
            action={confirmAction}
            onClose={() => setConfirmAction(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className={pageClassName}>
      <PageHeader
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setModal("create")}>
            Create group
          </Button>
        }
        description="Find an active team, review invitations, or create a group for your project."
        eyebrow="Student"
        title="Groups"
      />

      <Card>
        <CardHeader
          description="Accept or decline invitations from team leaders."
          title="Invitations"
        />
        <CardContent>
          {myInvitationsQuery.isLoading ? (
            <LoadingState title="Loading invitations" />
          ) : myInvitationsQuery.isError ? (
            <div className={errorPanelClassName}>
              {getErrorMessage(myInvitationsQuery.error)}
            </div>
          ) : (
            <InvitationList
              invitations={myInvitationsQuery.data?.data ?? []}
              mode="received"
              onAccept={(invitationId) =>
                acceptInvitationMutation.mutate(invitationId)
              }
              onDecline={(invitationId) =>
                declineInvitationMutation.mutate(invitationId)
              }
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="grid grid-cols-[minmax(220px,1fr)] gap-3">
          <TextInput
            icon={<Search size={16} />}
            label="Search groups"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by group name or course code"
            value={search}
          />
        </div>

        {groupsQuery.isLoading ? (
          <Card isPadded>
            <LoadingState title="Loading recruiting groups" />
          </Card>
        ) : groupsQuery.isError ? (
          <Card isPadded>
            <div className={errorPanelClassName}>
              {getErrorMessage(groupsQuery.error)}
            </div>
          </Card>
        ) : recruitingGroups.length === 0 ? (
          <Card isPadded>
            <EmptyState
              description="Try a different search or create a new group."
              title="No active groups found"
            />
          </Card>
        ) : (
          <div className={gridClassName}>
            {recruitingGroups.map((group) => (
              <GroupCard
                group={group}
                key={group.id}
                onViewDetails={() => setSelectedGroupId(group.id)}
              />
            ))}
          </div>
        )}
      </div>

      {modal === "create" && (
        <GroupFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSubmit={handleCreateGroup}
        />
      )}

      {selectedGroupId && (
        <GroupDetailModal
          groupId={selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </div>
  );
}
