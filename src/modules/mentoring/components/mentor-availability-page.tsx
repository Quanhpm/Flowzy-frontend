"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { CalendarClock, Copy, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
  Select,
  TextInput,
} from "@/shared/components";
import { ApiError, cn } from "@/shared/lib";
import type { SlotStatus } from "@/shared/types";

import {
  useCancelSlot,
  useCreateSlot,
  useMyAvailability,
  useUpdateSlot,
} from "../hooks";
import type {
  CreateAvailabilitySlotRequest,
  MentorAvailabilitySlotDto,
  UpdateAvailabilitySlotRequest,
} from "../types";

type SlotFormState = {
  endAt: string;
  meetLink: string;
  note: string;
  startAt: string;
};

type ConfirmAction = {
  confirmLabel: string;
  description: string;
  onConfirm: () => Promise<unknown>;
  title: string;
};

const MEET_LINK_REGEX =
  /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;

const EMPTY_SLOT_FORM: SlotFormState = {
  endAt: "",
  meetLink: "",
  note: "",
  startAt: "",
};

const pageClassName = "grid min-w-0 gap-6";
const toolbarClassName =
  "grid grid-cols-[minmax(180px,240px)] items-end gap-3 max-[680px]:grid-cols-[minmax(0,1fr)]";
const actionsClassName = "flex flex-wrap justify-end gap-2";
const errorPanelClassName =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-normal text-red-700";
const modalBackdropClassName =
  "fixed inset-0 z-40 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6 max-[680px]:p-3";
const modalClassName =
  "grid w-[min(620px,100%)] max-h-[min(760px,calc(100svh-48px))] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal max-[680px]:max-h-[calc(100svh-24px)]";
const modalSmallClassName = "w-[min(500px,100%)]";
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

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

function createFormFromSlot(slot: MentorAvailabilitySlotDto): SlotFormState {
  return {
    endAt: toLocalDateTimeInput(slot.endAt),
    meetLink: slot.meetLink,
    note: slot.note ?? "",
    startAt: toLocalDateTimeInput(slot.startAt),
  };
}

function getSlotStatusTone(status: SlotStatus) {
  if (status === "AVAILABLE") return "success";
  if (status === "BOOKED") return "warning";
  return "danger";
}

function validateSlotForm(form: SlotFormState) {
  if (!form.startAt || !form.endAt) {
    return "Start and end time are required.";
  }

  if (new Date(form.endAt).getTime() <= new Date(form.startAt).getTime()) {
    return "End time must be after start time.";
  }

  if (!MEET_LINK_REGEX.test(form.meetLink.trim())) {
    return "Meet link must match https://meet.google.com/abc-defg-hij.";
  }

  return null;
}

function createSlotPayload(form: SlotFormState): CreateAvailabilitySlotRequest {
  return {
    endAt: toIsoDateTime(form.endAt),
    meetLink: form.meetLink.trim(),
    note: optional(form.note),
    startAt: toIsoDateTime(form.startAt),
  };
}

function updateSlotPayload(form: SlotFormState): UpdateAvailabilitySlotRequest {
  return createSlotPayload(form);
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
          <Button disabled={isSubmitting} onClick={handleConfirm} variant="danger">
            {isSubmitting ? "Canceling..." : action.confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function SlotFormModal({
  mode,
  onClose,
  onSubmit,
  slot,
}: {
  mode: "create" | "duplicate" | "edit";
  onClose: () => void;
  onSubmit: (form: SlotFormState) => Promise<unknown>;
  slot?: MentorAvailabilitySlotDto;
}) {
  const [form, setForm] = useState<SlotFormState>(() =>
    slot ? createFormFromSlot(slot) : EMPTY_SLOT_FORM,
  );
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof SlotFormState>(
    field: K,
    value: SlotFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validationError = validateSlotForm(form);
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

  const title =
    mode === "edit"
      ? "Edit slot"
      : mode === "duplicate"
        ? "Duplicate slot"
        : "Create slot";

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
            <p className={modalDescriptionClassName}>
              Publish a Google Meet slot that assigned groups can book.
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
            icon={<CalendarClock size={16} />}
            label="Start"
            onChange={(event) => updateField("startAt", event.target.value)}
            type="datetime-local"
            value={form.startAt}
          />
          <TextInput
            icon={<CalendarClock size={16} />}
            label="End"
            onChange={(event) => updateField("endAt", event.target.value)}
            type="datetime-local"
            value={form.endAt}
          />
          <TextInput
            label="Google Meet link"
            onChange={(event) => updateField("meetLink", event.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            value={form.meetLink}
          />
          <TextInput
            label="Note"
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="Office hours, project review..."
            value={form.note}
          />
        </div>
        <footer className={modalFooterClassName}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save slot"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

function groupSlotsByDate(slots: MentorAvailabilitySlotDto[]) {
  return slots.reduce<Record<string, MentorAvailabilitySlotDto[]>>(
    (groups, slot) => {
      const key = formatDate(slot.startAt);
      return {
        ...groups,
        [key]: [...(groups[key] ?? []), slot],
      };
    },
    {},
  );
}

function AvailabilitySlotTimeline({
  onCancel,
  onDuplicate,
  onEdit,
  slots,
}: {
  onCancel: (slot: MentorAvailabilitySlotDto) => void;
  onDuplicate: (slot: MentorAvailabilitySlotDto) => void;
  onEdit: (slot: MentorAvailabilitySlotDto) => void;
  slots: MentorAvailabilitySlotDto[];
}) {
  if (slots.length === 0) {
    return (
      <CardContent>
        <EmptyState
          description="Create a slot or adjust the current status filter."
          title="No slots found"
        />
      </CardContent>
    );
  }

  const groupedSlots = groupSlotsByDate(slots);

  return (
    <CardContent>
      <div className="grid gap-5">
        {Object.entries(groupedSlots).map(([date, daySlots]) => (
          <section
            className="grid gap-3 rounded-xl border border-border bg-background p-4"
            key={date}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="m-0 text-base font-bold text-foreground">{date}</h3>
              <Badge tone="neutral">{daySlots.length} slots</Badge>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3">
              {daySlots.map((slot) => (
                <article
                  className="grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card"
                  key={slot.id}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <strong className="text-base text-foreground">
                        {formatTime(slot.startAt)} - {formatTime(slot.endAt)}
                      </strong>
                      <span className="text-xs text-muted">
                        {formatDateTime(slot.startAt)}
                      </span>
                    </div>
                    <Badge tone={getSlotStatusTone(slot.status)}>
                      {slot.status}
                    </Badge>
                  </div>
                  <p className="m-0 text-sm leading-relaxed text-muted">
                    {slot.note ?? "No note"}
                  </p>
                  <a
                    className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover"
                    href={slot.meetLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open meet
                  </a>
                  {slot.status === "AVAILABLE" ? (
                    <div className={actionsClassName}>
                      <Button
                        icon={<Copy size={15} />}
                        onClick={() => onDuplicate(slot)}
                        size="sm"
                        variant="secondary"
                      >
                        Duplicate
                      </Button>
                      <Button
                        icon={<Pencil size={15} />}
                        onClick={() => onEdit(slot)}
                        size="sm"
                        variant="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        icon={<Trash2 size={15} />}
                        onClick={() => onCancel(slot)}
                        size="sm"
                        variant="danger"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[13px] text-muted">No actions</span>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </CardContent>
  );
}

export function MentorAvailabilityPage() {
  const [statusFilter, setStatusFilter] = useState<"" | SlotStatus>("");
  const [modal, setModal] = useState<"create" | "duplicate" | "edit" | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] =
    useState<MentorAvailabilitySlotDto | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const availabilityQuery = useMyAvailability();
  const createSlotMutation = useCreateSlot();
  const updateSlotMutation = useUpdateSlot();
  const cancelSlotMutation = useCancelSlot();

  const availableSlots = useMemo(
    () =>
      (availabilityQuery.data?.data ?? []).filter(
        (slot) => slot.status === "AVAILABLE",
      ),
    [availabilityQuery.data?.data],
  );

  const filteredSlots = useMemo(() => {
      const slots = availabilityQuery.data?.data ?? [];
      const visibleSlots = statusFilter
        ? slots.filter((slot) => slot.status === statusFilter)
        : slots;

      return [...visibleSlots].sort(
        (left, right) =>
          new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
      );
    }, [availabilityQuery.data?.data, statusFilter]);

  async function handleCreateSlot(form: SlotFormState) {
    await createSlotMutation.mutateAsync(createSlotPayload(form));
  }

  async function handleUpdateSlot(form: SlotFormState) {
    if (!selectedSlot) return;

    await updateSlotMutation.mutateAsync({
      payload: updateSlotPayload(form),
      slotId: selectedSlot.id,
    });
  }

  function requestCancelSlot(slot: MentorAvailabilitySlotDto) {
    setConfirmAction({
      confirmLabel: "Cancel slot",
      description: `Cancel the availability slot starting ${formatDateTime(
        slot.startAt,
      )}.`,
      onConfirm: () => cancelSlotMutation.mutateAsync(slot.id),
      title: "Cancel availability slot",
    });
  }

  function requestCancelAvailableSlots() {
    setConfirmAction({
      confirmLabel: "Cancel available slots",
      description: `Cancel all ${availableSlots.length} currently available slots?`,
      onConfirm: () =>
        Promise.all(
          availableSlots.map((slot) => cancelSlotMutation.mutateAsync(slot.id)),
        ),
      title: "Bulk cancel slots",
    });
  }

  return (
    <div className={pageClassName}>
      <PageHeader
        actions={
          <>
            {availableSlots.length > 0 && (
              <Button
                icon={<Trash2 size={16} />}
                onClick={requestCancelAvailableSlots}
                variant="secondary"
              >
                Cancel available
              </Button>
            )}
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setSelectedSlot(null);
                setModal("create");
              }}
            >
              Create slot
            </Button>
          </>
        }
        description="Create, update, and cancel availability slots that assigned groups can book."
        eyebrow="Mentor"
        title="Availability"
      />

      <Card>
        <CardHeader
          description="Filter slots by status and manage any open availability."
          title="Upcoming slots"
        />
        <CardContent>
          <div className={toolbarClassName}>
            <Select
              label="Status"
              onChange={(event) =>
                setStatusFilter(event.target.value as "" | SlotStatus)
              }
              value={statusFilter}
            >
              <option value="">All statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="BOOKED">Booked</option>
              <option value="CANCELED">Canceled</option>
            </Select>
          </div>
        </CardContent>

        {availabilityQuery.isLoading ? (
          <CardContent>
            <LoadingState title="Loading availability" />
          </CardContent>
        ) : availabilityQuery.isError ? (
          <CardContent>
            <div className={errorPanelClassName}>
              {getErrorMessage(availabilityQuery.error)}
            </div>
          </CardContent>
        ) : (
          <AvailabilitySlotTimeline
            onCancel={requestCancelSlot}
            onDuplicate={(slot) => {
              setSelectedSlot(slot);
              setModal("duplicate");
            }}
            onEdit={(slot) => {
              setSelectedSlot(slot);
              setModal("edit");
            }}
            slots={filteredSlots}
          />
        )}
      </Card>

      {modal === "create" && (
        <SlotFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSubmit={handleCreateSlot}
        />
      )}

      {modal === "duplicate" && selectedSlot && (
        <SlotFormModal
          mode="duplicate"
          onClose={() => {
            setModal(null);
            setSelectedSlot(null);
          }}
          onSubmit={handleCreateSlot}
          slot={selectedSlot}
        />
      )}

      {modal === "edit" && selectedSlot && (
        <SlotFormModal
          mode="edit"
          onClose={() => {
            setModal(null);
            setSelectedSlot(null);
          }}
          onSubmit={handleUpdateSlot}
          slot={selectedSlot}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          action={confirmAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
