import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "div" | "section";
  padded?: boolean;
}

export function Card({ as: Tag = "article", padded = true, className = "", ...props }: CardProps) {
  return (
    <Tag
      className={`${styles.card} ${padded ? styles.padded : ""} ${className}`.trim()}
      {...props}
    />
  );
}
