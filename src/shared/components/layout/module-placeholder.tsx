import type { ReactNode } from "react";

import { EmptyState, PageHeader } from "../ui";
import styles from "./module-placeholder.module.css";

type ModulePlaceholderProps = {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function ModulePlaceholder({
  actions,
  description,
  eyebrow,
  title,
}: ModulePlaceholderProps) {
  return (
    <div className={styles.page}>
      <PageHeader description={description} eyebrow={eyebrow} title={title} />
      <EmptyState
        actions={actions}
        description="The route and app shell are ready. Build this module inside its owned folder."
        title="Module workspace"
      />
    </div>
  );
}
