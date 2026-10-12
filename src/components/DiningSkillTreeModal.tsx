"use client";

import { useEffect, useRef, useState } from "react";
import DiningSkillTree from "@/components/DiningSkillTree";
import { SKILL_NODES, TREE_SIZE } from "@/data/skillTree";
import styles from "@/styles/SkillTree.module.css";
import modalStyles from "@/styles/Passport.module.css";

export default function DiningSkillTreeModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(
      () => {
        setOpen(false);
        setClosing(false);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260,
    );
    return () => window.clearTimeout(timer);
  }, [closing]);

  return (
    <>
      <button type="button" className={styles.previewButton} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <svg className={styles.preview} viewBox={`0 0 ${TREE_SIZE.width} ${TREE_SIZE.height}`} aria-hidden="true">
          {SKILL_NODES.flatMap((node) =>
            (node.parents ?? []).map((id) => {
              const parent = SKILL_NODES.find((candidate) => candidate.id === id)!;
              return (
                <path
                  key={`${id}-${node.id}`}
                  d={`M${parent.x} ${parent.y} Q${parent.x} ${node.y} ${node.x} ${node.y}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  opacity="0.5"
                />
              );
            }),
          )}
          {SKILL_NODES.map((node) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.reward ? 35 : 24}
              fill={node.reward ? "#f4b477" : "#382b22"}
              stroke="currentColor"
              strokeWidth="12"
            />
          ))}
        </svg>
        <span className={styles.previewText}>
          <strong>Your Skill Tree</strong>
          <small>{SKILL_NODES.length} skills. New paths. Dining rewards.</small>
          <span>Explore your tree →</span>
        </span>
      </button>
      <dialog
        ref={dialog}
        className={`${modalStyles.dialog} ${styles.treeDialog}`}
        data-closing={closing}
        aria-labelledby="skill-tree-title"
        onClose={() => {
          setOpen(false);
          setClosing(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          setClosing(true);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setClosing(true);
        }}
      >
        <div className={styles.modalBody}>
          <button
            type="button"
            className={`${modalStyles.close} ${styles.modalClose}`}
            onClick={() => setClosing(true)}
            aria-label="Close skill tree"
            autoFocus
          >
            ×
          </button>
          {open && <DiningSkillTree />}
        </div>
      </dialog>
    </>
  );
}
