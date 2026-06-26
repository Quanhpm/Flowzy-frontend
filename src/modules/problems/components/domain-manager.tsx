import { FormEvent, useState, useEffect } from "react";
import { useProblemDomains } from "../hooks";
import {
  useCreateProblemDomain,
  useUpdateProblemDomain,
} from "../hooks/use-problem-mutations";
import { Button, TextInput, Select, LoadingState, EmptyState } from "@/shared/components";
import type { ProblemStatus } from "@/shared/types";
import { Plus, Search, Edit3, X } from "lucide-react";
import type { ProblemDomainDto } from "../types";

export function DomainManager() {
  const [search, setSearch] = useState("");
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<ProblemDomainDto | null>(null);

  // Form Fields State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [macroDomain, setMacroDomain] = useState("");
  const [subDomain, setSubDomain] = useState("");
  const [typicalExamples, setTypicalExamples] = useState("");
  const [primaryDiscipline, setPrimaryDiscipline] = useState("");
  const [supportingDisciplines, setSupportingDisciplines] = useState("");
  const [bestSources, setBestSources] = useState("");
  const [studentCapabilities, setStudentCapabilities] = useState("");
  const [potentialOutputs, setPotentialOutputs] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProblemStatus>("ACTIVE");

  // Queries
  const { data: domainsResponse, isLoading } = useProblemDomains({ search });
  const domains = domainsResponse?.data || [];

  // Mutations
  const createDomainMutation = useCreateProblemDomain();
  const updateDomainMutation = useUpdateProblemDomain(editingDomain?.id || 0);

  // Set values when editing
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editingDomain) {
      setCode(editingDomain.code || "");
      setName(editingDomain.name || "");
      setDescription(editingDomain.description || "");
      setMacroDomain(editingDomain.macroDomain || "");
      setSubDomain(editingDomain.subDomain || "");
      setTypicalExamples(editingDomain.typicalExamples || "");
      setPrimaryDiscipline(editingDomain.primaryDiscipline || "");
      setSupportingDisciplines(editingDomain.supportingDisciplines || "");
      setBestSources(editingDomain.bestSources || "");
      setStudentCapabilities(editingDomain.studentCapabilities || "");
      setPotentialOutputs(editingDomain.potentialOutputs || "");
      setNotes(editingDomain.notes || "");
      setStatus(editingDomain.status || "ACTIVE");
    } else {
      setCode("");
      setName("");
      setDescription("");
      setMacroDomain("");
      setSubDomain("");
      setTypicalExamples("");
      setPrimaryDiscipline("");
      setSupportingDisciplines("");
      setBestSources("");
      setStudentCapabilities("");
      setPotentialOutputs("");
      setNotes("");
      setStatus("ACTIVE");
    }
  }, [editingDomain]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleOpenAdd = () => {
    setEditingDomain(null);
    setDomainModalOpen(true);
  };

  const handleOpenEdit = (domain: ProblemDomainDto) => {
    setEditingDomain(domain);
    setDomainModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert("Code and Name are required.");
      return;
    }

    const payload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      macroDomain: macroDomain.trim() || undefined,
      subDomain: subDomain.trim() || undefined,
      typicalExamples: typicalExamples.trim() || undefined,
      primaryDiscipline: primaryDiscipline.trim() || undefined,
      supportingDisciplines: supportingDisciplines.trim() || undefined,
      bestSources: bestSources.trim() || undefined,
      studentCapabilities: studentCapabilities.trim() || undefined,
      potentialOutputs: potentialOutputs.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    };

    if (editingDomain) {
      updateDomainMutation.mutate(payload, {
        onSuccess: () => {
          setDomainModalOpen(false);
          setEditingDomain(null);
        },
      });
    } else {
      createDomainMutation.mutate(payload, {
        onSuccess: () => {
          setDomainModalOpen(false);
        },
      });
    }
  };

  const isPending = createDomainMutation.isPending || updateDomainMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface p-4 rounded-2xl shadow-sm">
        <div className="relative min-w-[240px]">
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domains..."
            className="w-full pl-9"
          />
          <Search className="absolute left-3 top-3.5 size-4 text-muted" />
        </div>

        <Button onClick={handleOpenAdd} size="md">
          <Plus className="size-4 mr-1.5" />
          <span>New Domain</span>
        </Button>
      </div>

      {/* List domains */}
      {isLoading ? (
        <LoadingState title="Loading domains..." />
      ) : domains.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface-base">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Discipline</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-neutral-50/50">
                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-muted-foreground">
                    {dom.code}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-foreground text-sm">{dom.name}</div>
                    {dom.description && (
                      <div className="text-xs text-muted-foreground/60 line-clamp-1 max-w-[320px]">
                        {dom.description}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted">
                    {dom.primaryDiscipline || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 font-bold ${
                        dom.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-neutral-50 text-neutral-500 border border-border"
                      }`}
                    >
                      {dom.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEdit(dom)}
                      className="size-8 p-0 rounded-lg"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No domains found" description="Try creating a new problem domain above." />
      )}

      {/* Domain add/edit modal */}
      {domainModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6">
          <div className="grid w-[min(580px,100%)] max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal">
            
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-base">
              <h3 className="m-0 text-base font-bold text-foreground">
                {editingDomain ? "Edit Problem Domain" : "Create Problem Domain"}
              </h3>
              <Button
                variant="secondary"
                onClick={() => setDomainModalOpen(false)}
                className="size-8 p-0 rounded-lg"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <TextInput
                    label="Domain Code *"
                    placeholder="e.g. AI"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={!!editingDomain} // Code typically read-only on edit
                  />
                </div>
                <div className="col-span-2">
                  <TextInput
                    label="Domain Name *"
                    placeholder="e.g. Artificial Intelligence"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of research domain..."
                  className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Macro Domain"
                  placeholder="e.g. Computer Science"
                  value={macroDomain}
                  onChange={(e) => setMacroDomain(e.target.value)}
                />
                <TextInput
                  label="Sub Domain"
                  placeholder="e.g. Machine Learning"
                  value={subDomain}
                  onChange={(e) => setSubDomain(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Primary Discipline"
                  placeholder="e.g. Software Engineering"
                  value={primaryDiscipline}
                  onChange={(e) => setPrimaryDiscipline(e.target.value)}
                />
                <TextInput
                  label="Supporting Disciplines"
                  placeholder="e.g. Data Science"
                  value={supportingDisciplines}
                  onChange={(e) => setSupportingDisciplines(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProblemStatus)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Select>
                </div>
                <TextInput
                  label="Best Sources"
                  placeholder="e.g. IEEE, ACM"
                  value={bestSources}
                  onChange={(e) => setBestSources(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Student Capabilities Needed"
                  placeholder="e.g. Python, TensorFlow"
                  value={studentCapabilities}
                  onChange={(e) => setStudentCapabilities(e.target.value)}
                />
                <TextInput
                  label="Potential Outputs"
                  placeholder="e.g. Prototype, Research Paper"
                  value={potentialOutputs}
                  onChange={(e) => setPotentialOutputs(e.target.value)}
                />
              </div>

              <TextInput
                label="Typical Examples"
                placeholder="e.g. Face recognition app"
                value={typicalExamples}
                onChange={(e) => setTypicalExamples(e.target.value)}
              />

              <TextInput
                label="Notes"
                placeholder="Important remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDomainModalOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Domain"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
