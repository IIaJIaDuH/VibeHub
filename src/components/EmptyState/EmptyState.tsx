import type { HTMLAttributes } from "react";
import styles from "./EmptyState.module.css";

export function EmptyState({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`${styles.empty} ${className}`.trim()} {...props} />;
}
