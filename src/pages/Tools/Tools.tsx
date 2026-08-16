import { useEffect, useState } from "react";
import { CategoryStrip } from "../../components/CategoryStrip/CategoryStrip";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { IconButton } from "../../components/IconButton/IconButton";
import { IconBookmark, IconOpen } from "../../components/icons";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { useHub } from "../../state/HubContext";
import type { ToolCategory, ToolType } from "../../types/hub";
import styles from "./Tools.module.css";

const CATEGORIES: { id: "all" | ToolCategory; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "coding", label: "Coding" },
  { id: "agents", label: "Agents" },
  { id: "research", label: "Research" },
  { id: "design", label: "Design" },
  { id: "local-ai", label: "Local AI" },
];

const TYPES: { id: "all" | ToolType; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "skill", label: "Skill" },
  { id: "mcp", label: "MCP" },
  { id: "plugin", label: "Plugin" },
  { id: "cli", label: "CLI" },
  { id: "ide", label: "IDE extension" },
];

export function ToolsPage() {
  const { tools, toggleToolBookmark, focusedEntity } = useHub();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("all");

  const visible = tools.filter((tool) => {
    if (focusedEntity?.kind === "tool" && focusedEntity.id === tool.id) return true;
    const byCat = category === "all" || tool.category === category;
    const byType = type === "all" || tool.type === type;
    return byCat && byType;
  });

  useEffect(() => {
    if (focusedEntity?.kind !== "tool") return;
    document.getElementById(`tool-${focusedEntity.id}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusedEntity]);

  return (
    <div className={styles.page}>
      <PageHeader title="Инструменты">
        <CategoryStrip
          items={CATEGORIES}
          value={category}
          onChange={(id) => setCategory(id as typeof category)}
        />
        <div className={styles.secondary}>
          <label className={styles.type}>
            Тип
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              {TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>
      {visible.length === 0 ? (
        <EmptyState>Инструменты не найдены.</EmptyState>
      ) : (
        <ul className={styles.list}>
          {visible.map((tool) => (
            <li
              key={tool.id}
              id={`tool-${tool.id}`}
              className={`${styles.row}${
                focusedEntity?.kind === "tool" && focusedEntity.id === tool.id
                  ? ` ${styles.focused}`
                  : ""
              }`}
            >
              <span className={styles.mark} aria-hidden>
                {tool.name.slice(0, 1)}
              </span>
              <div className={styles.body}>
                <h2>{tool.name}</h2>
                <p className={styles.summary}>{tool.summary}</p>
                <p className={styles.meta}>
                  {tool.typeLabel}
                  {tool.tags.map((tag) => (
                    <span key={tag}> · {tag}</span>
                  ))}
                  <span> · {tool.compatibility.join(" · ")}</span>
                  <span className={styles.rating}>
                    {" "}
                    ★ {tool.rating.toFixed(1)} · {tool.ratingsCount}
                  </span>
                </p>
              </div>
              <div className={styles.actions}>
                <IconButton
                  label={tool.bookmarked ? "Убрать из закладок" : "Сохранить"}
                  active={tool.bookmarked}
                  onClick={() => toggleToolBookmark(tool.id)}
                >
                  <IconBookmark width={18} height={18} />
                </IconButton>
                <IconButton label="Открыть">
                  <IconOpen width={18} height={18} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
