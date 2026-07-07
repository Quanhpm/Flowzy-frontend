"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { X } from "lucide-react";

import { Button, Select, TextInput } from "@/shared/components";
import { ApiError, cn } from "@/shared/lib";

import type {
  CreateGroupRequest,
  GroupDetailDto,
  UpdateGroupRequest,
} from "../../types";

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

type GroupFormModalProps =
  | {
      group?: never;
      mode: "create";
      onClose: () => void;
      onSubmit: (payload: CreateGroupRequest) => Promise<unknown>;
    }
  | {
      group: GroupDetailDto;
      mode: "edit";
      onClose: () => void;
      onSubmit: (payload: UpdateGroupRequest) => Promise<unknown>;
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

const COURSE_CODE_OPTIONS = ["EXE101", "EXE201", "EXE401"] as const;

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

function clampNumberInput(value: string, max: number) {
  if (!value) return "";

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;
  if (numericValue < 0) return "0";
  if (numericValue > max) return String(max);

  return value;
}

function createFormFromGroup(group: GroupDetailDto): GroupFormState {
  return {
    courseCode: group.courseCode,
    ideaDescription: group.ideaDescription ?? "",
    name: group.name,
    projectName: group.projectName ?? "",
    requiredGpa: group.requiredGpa?.toString() ?? "",
    researchDomain: group.researchDomain ?? "",
    targetGrade: group.targetGrade?.toString() ?? "",
    term: group.term,
  };
}

function validateGroupForm(form: GroupFormState, mode: "create" | "edit") {
  if (mode === "create" && !form.term.trim()) return "Term is required.";
  if (mode === "create" && !form.courseCode.trim()) {
    return "Course code is required.";
  }
  if (
    form.courseCode &&
    !COURSE_CODE_OPTIONS.includes(
      form.courseCode as (typeof COURSE_CODE_OPTIONS)[number],
    )
  ) {
    return "Course code must be EXE101, EXE201, or EXE401.";
  }
  if (!form.name.trim()) return "Group name is required.";

  const requiredGpa = optionalNumber(form.requiredGpa);
  if (requiredGpa !== undefined && (requiredGpa < 0 || requiredGpa > 4)) {
    return "Required GPA must be between 0 and 4.";
  }

  const targetGrade = optionalNumber(form.targetGrade);
  if (targetGrade !== undefined && (targetGrade < 0 || targetGrade > 10)) {
    return "Target grade must be between 0 and 10.";
  }

  return "";
}

function createGroupPayload(form: GroupFormState): CreateGroupRequest {
  return {
    courseCode: form.courseCode.trim(),
    ideaDescription: optional(form.ideaDescription),
    name: form.name.trim(),
    projectName: optional(form.projectName),
    requiredGpa: optionalNumber(form.requiredGpa),
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

export function GroupFormModal(props: GroupFormModalProps) {
  const { mode, onClose } = props;
  const [form, setForm] = useState<GroupFormState>(() =>
    mode === "edit" ? createFormFromGroup(props.group) : EMPTY_GROUP_FORM,
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof GroupFormState>(
    field: K,
    value: GroupFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateBoundedNumberField(
    field: "requiredGpa" | "targetGrade",
    value: string,
    max: number,
  ) {
    updateField(field, clampNumberInput(value, max));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = validateGroupForm(form, mode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await props.onSubmit(createGroupPayload(form));
      } else {
        await props.onSubmit(updateGroupPayload(form));
      }
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = mode === "create" ? "Create group" : "Edit group";
  const description =
    mode === "create"
      ? "Set up your team profile and project direction."
      : "Update group details, project information, and criteria.";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <form
        className="w-[min(760px,100%)] overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
        onSubmit={handleSubmit}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="grid gap-1">
            <h2 className="m-0 text-lg font-bold text-foreground">{title}</h2>
            <p className="m-0 text-sm leading-relaxed text-muted">
              {description}
            </p>
          </div>
          <Button
            aria-label="Close group form"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
            <TextInput
              disabled={mode === "edit"}
              label="Term"
              onChange={(event) => updateField("term", event.target.value)}
              placeholder="Summer2026"
              value={form.term}
            />
            <Select
              disabled={mode === "edit"}
              label="Course code"
              onChange={(event) => updateField("courseCode", event.target.value)}
              required={mode === "create"}
              value={form.courseCode}
            >
              {mode === "create" && <option value="">Select course</option>}
              {COURSE_CODE_OPTIONS.map((courseCode) => (
                <option key={courseCode} value={courseCode}>
                  {courseCode}
                </option>
              ))}
            </Select>
            <TextInput
              fieldClassName="col-span-full"
              label="Group name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Flowzy Team"
              value={form.name}
            />
            <TextInput
              fieldClassName={mode === "create" ? "col-span-full" : undefined}
              label="Project name"
              onChange={(event) => updateField("projectName", event.target.value)}
              placeholder="Optional"
              value={form.projectName}
            />
            {mode === "edit" && (
              <TextInput
                label="Research domain"
                onChange={(event) =>
                  updateField("researchDomain", event.target.value)
                }
                placeholder="AI, Web, IoT..."
                value={form.researchDomain}
              />
            )}
            <TextInput
              hint="Max 4"
              label="Required GPA"
              max={4}
              min={0}
              onChange={(event) =>
                updateBoundedNumberField("requiredGpa", event.target.value, 4)
              }
              placeholder="2.5"
              step="0.1"
              type="number"
              value={form.requiredGpa}
            />
            <TextInput
              hint="Max 10"
              label="Target grade"
              max={10}
              min={0}
              onChange={(event) =>
                updateBoundedNumberField("targetGrade", event.target.value, 10)
              }
              placeholder="8.0"
              step="0.1"
              type="number"
              value={form.targetGrade}
            />
            <label className="col-span-full grid gap-[7px]">
              <span className="text-[13px] font-medium text-foreground">
                Idea description
              </span>
              <textarea
                className={cn(
                  "min-h-28 resize-y rounded-xl border border-border bg-surface px-3.5 py-3 font-sans text-sm text-foreground outline-0 transition-[border-color,box-shadow] duration-[160ms]",
                  "focus:border-brand-secondary focus:shadow-[0_0_0_4px_rgba(106,0,255,0.12)]",
                )}
                onChange={(event) =>
                  updateField("ideaDescription", event.target.value)
                }
                placeholder="Briefly describe the project idea."
                value={form.ideaDescription}
              />
            </label>
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">
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
