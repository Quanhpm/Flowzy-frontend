import { Bot, Check, Circle, FileText, MessageCircle } from "lucide-react";

import styles from "./login.module.css";

type PreviewCard = {
  label: string;
  title: string;
  muted?: string;
  progress?: boolean;
  complete?: boolean;
};

type PreviewColumn = {
  title: string;
  cards: PreviewCard[];
};

const columns: PreviewColumn[] = [
  {
    title: "Problem (2)",
    cards: [
      { label: "#Discovery", title: "Problem Validation", muted: "Research evidence" },
    ],
  },
  {
    title: "In Progress (1)",
    cards: [
      { label: "#EXE101", title: "Market Research", progress: true },
    ],
  },
  {
    title: "Approved (5)",
    cards: [
      { label: "Approved", title: "Final Proposal", complete: true },
    ],
  },
];

export function AuthShowcase() {
  return (
    <aside className={styles.showcase} aria-label="F-Spark workspace preview">
      <div className={styles.gridGlow} />

      <div className={styles.showcaseTopbar}>
        <div className={styles.workspaceLabel}>
          <span /> F-SPARK PROJECT WORKSPACE
        </div>
        <div className={styles.connectedBadge}>
          <Bot size={14} /> System ready
        </div>
      </div>

      <div className={styles.previewArea}>
        <div className={styles.board}>
          <div className={styles.boardHeader}>
            <strong>EXE101 Project Workspace</strong>
            <span className={styles.activeBadge}>3 active stages</span>
          </div>

          <div className={styles.boardColumns}>
            {columns.map((column) => (
              <div className={styles.boardColumn} key={column.title}>
                <span className={styles.columnTitle}>{column.title}</span>
                {column.cards.map((card) => (
                  <div
                    className={`${styles.taskCard} ${card.progress ? styles.taskCardProgress : ""}`}
                    key={card.title}
                  >
                    <span
                      className={`${styles.taskLabel} ${card.complete ? styles.taskLabelComplete : ""}`}
                    >
                      {card.complete && <Check size={11} />} {card.label}
                    </span>
                    <strong>{card.title}</strong>
                    {card.muted && (
                      <small>
                        <Circle size={8} /> {card.muted}
                      </small>
                    )}
                    {card.progress && (
                      <span className={styles.progressTrack}>
                        <span />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.boardFooter}>
            <span>
              <FileText size={12} /> 4 documents
            </span>
            <span>
              <MessageCircle size={12} /> 22 feedbacks
            </span>
            <strong>F-Spark Board</strong>
          </div>
        </div>
      </div>

      <div className={styles.showcaseCopy}>
        <h2>Build projects that matter</h2>
        <p>
          Manage your EXE journey from problem discovery to final product in one
          collaborative workspace.
        </p>
        <div className={styles.dots} aria-hidden="true">
          <span />
          <span className={styles.activeDot} />
          <span />
        </div>
      </div>
    </aside>
  );
}
