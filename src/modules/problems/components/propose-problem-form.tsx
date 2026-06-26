import { FormEvent, useState } from "react";
import { Button, TextInput, Select } from "@/shared/components";
import type { ProblemDifficulty, EntityId } from "@/shared/types";
import { useProposeGroupProblem } from "../hooks/use-problem-mutations";
import { useProblemDomains } from "../hooks";
import { X } from "lucide-react";

type ProposeProblemFormProps = {
  groupId: EntityId;
  onClose: () => void;
  onSuccess?: () => void;
};

export function ProposeProblemForm({ groupId, onClose, onSuccess }: ProposeProblemFormProps) {
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [strategicTheme, setStrategicTheme] = useState("");
  const [researchArea, setResearchArea] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<ProblemDifficulty>("INTERMEDIATE");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [domainCode, setDomainCode] = useState("");

  // Queries
  const { data: domainsResponse } = useProblemDomains({ status: "ACTIVE" });
  const domains = domainsResponse?.data || [];

  // Mutations
  const proposeMutation = useProposeGroupProblem(groupId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statement.trim() || !domainCode) {
      alert("Please fill in all required fields (Title, Statement, and Domain).");
      return;
    }

    proposeMutation.mutate(
      {
        title: title.trim(),
        statement: statement.trim(),
        strategicTheme: strategicTheme.trim() || undefined,
        researchArea: researchArea.trim() || undefined,
        difficultyLevel,
        expectedOutput: expectedOutput.trim() || undefined,
        domainCode,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          onClose();
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-45 bg-[rgba(26,26,26,0.36)]" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 grid place-items-center p-6 pointer-events-none">
        <div className="grid w-[min(560px,100%)] max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal pointer-events-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-base">
            <h3 className="m-0 text-lg font-bold text-foreground">
              Propose Project Topic
            </h3>
            <Button
              variant="secondary"
              onClick={onClose}
              className="size-8 p-0 rounded-lg"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <TextInput
              label="Topic Title *"
              placeholder="Enter a descriptive topic title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Domain *
                </label>
                <Select
                  value={domainCode}
                  onChange={(e) => setDomainCode(e.target.value)}
                  required
                >
                  <option value="">Choose a Domain...</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.code}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Difficulty Level
                </label>
                <Select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value as ProblemDifficulty)}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Problem Description / Statement *
              </label>
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Provide a clear description of the problem statement, targets, or business case..."
                required
                className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[100px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Expected Output
              </label>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="What are the expected deliverables? (e.g. source code, model, report)"
                className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Strategic Theme"
                placeholder="e.g. Digital Transformation"
                value={strategicTheme}
                onChange={(e) => setStrategicTheme(e.target.value)}
              />
              <TextInput
                label="Research Area"
                placeholder="e.g. NLP, Cyber Security"
                value={researchArea}
                onChange={(e) => setResearchArea(e.target.value)}
              />
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={proposeMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={proposeMutation.isPending}>
                {proposeMutation.isPending ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
