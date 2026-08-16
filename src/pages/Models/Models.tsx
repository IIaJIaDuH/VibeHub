import { useEffect, useMemo, useState } from "react";
import { CategoryStrip } from "../../components/CategoryStrip/CategoryStrip";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { IconButton } from "../../components/IconButton/IconButton";
import { IconBookmark, IconCompare, IconOpen } from "../../components/icons";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { ProviderMark } from "../../components/ProviderMark/ProviderMark";
import { useHub } from "../../state/HubContext";
import type { BenchmarkScores, Model, ModelFilter, ModelSort } from "../../types/hub";
import styles from "./Models.module.css";

const FILTERS: { id: ModelFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "coding", label: "Coding" },
  { id: "reasoning", label: "Reasoning" },
  { id: "vision", label: "Vision" },
  { id: "agents", label: "Agents" },
  { id: "local", label: "Local" },
];

const SCORE_META: { key: keyof BenchmarkScores; glyph: string; label: string }[] = [
  { key: "coding", glyph: "</>", label: "Coding" },
  { key: "reasoning", glyph: "◈", label: "Reasoning" },
  { key: "research", glyph: "◉", label: "Research" },
  { key: "vision", glyph: "▣", label: "Vision" },
  { key: "speed", glyph: "▷", label: "Speed" },
];

function matchesFilter(model: Model, filter: ModelFilter) {
  if (filter === "all") return true;
  if (filter === "agents") return model.capabilities.some((c) => /agent/i.test(c));
  if (filter === "local") return model.capabilities.some((c) => /local|gguf/i.test(c));
  return model.benchmarkScores[filter] != null;
}

function sortModels(models: Model[], sort: ModelSort) {
  const copy = [...models];
  if (sort === "popular") copy.sort((a, b) => b.voteCount - a.voteCount);
  if (sort === "rating") copy.sort((a, b) => b.communityRating - a.communityRating);
  if (sort === "new") copy.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  if (sort === "context") copy.sort((a, b) => b.contextTokens - a.contextTokens);
  return copy;
}

export function ModelsPage() {
  const { models, toggleModelBookmark, focusedEntity } = useHub();
  const [filter, setFilter] = useState<ModelFilter>("all");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState<ModelSort>("popular");
  const [compare, setCompare] = useState<string[]>([]);

  const providers = useMemo(
    () => [...new Set(models.map((m) => m.provider))].sort(),
    [models],
  );

  const visible = sortModels(
    models.filter((model) => {
      if (focusedEntity?.kind === "model" && focusedEntity.id === model.id) return true;
      const byFilter = matchesFilter(model, filter);
      const byProvider = provider === "all" || model.provider === provider;
      return byFilter && byProvider;
    }),
    sort,
  );

  useEffect(() => {
    if (focusedEntity?.kind !== "model") return;
    document.getElementById(`model-${focusedEntity.id}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusedEntity]);

  const toggleCompare = (id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1] ?? prev[0], id];
      return [...prev, id];
    });
  };

  const selected = models.filter((m) => compare.includes(m.id));

  return (
    <div className={styles.page}>
      <PageHeader title="Модели">
        <CategoryStrip
          items={FILTERS}
          value={filter}
          onChange={(id) => setFilter(id as ModelFilter)}
        />
        <div className={styles.secondary}>
          <div className={styles.selects}>
            <label>
              Provider
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="all">Все</option>
                {providers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Сортировка
              <select value={sort} onChange={(e) => setSort(e.target.value as ModelSort)}>
                <option value="popular">Популярные</option>
                <option value="rating">Рейтинг</option>
                <option value="new">Новые</option>
                <option value="context">Context</option>
              </select>
            </label>
          </div>
        </div>
      </PageHeader>

      {selected.length > 0 ? (
        <p className={styles.compare}>К сравнению: {selected.map((m) => m.name).join(" · ")}</p>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState>Модели не найдены.</EmptyState>
      ) : (
        <ul className={styles.list}>
          {visible.map((model) => (
            <li key={model.id} id={`model-${model.id}`}>
              <ModelRow
                model={model}
                compared={compare.includes(model.id)}
                focused={focusedEntity?.kind === "model" && focusedEntity.id === model.id}
                onCompare={() => toggleCompare(model.id)}
                onBookmark={() => toggleModelBookmark(model.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ModelRow({
  model,
  compared,
  focused,
  onCompare,
  onBookmark,
}: {
  model: Model;
  compared: boolean;
  focused: boolean;
  onCompare: () => void;
  onBookmark: () => void;
}) {
  const scores = SCORE_META.filter((item) => model.benchmarkScores[item.key] != null);

  return (
    <article className={`${styles.row}${focused ? ` ${styles.focused}` : ""}`}>
      <ProviderMark model={model} />
      <div className={styles.body}>
        <h2>{model.name}</h2>
        <p className={styles.provider}>{model.provider}</p>
        <p className={styles.scores} aria-label="Benchmark scores">
          {scores.map((item) => {
            const value = model.benchmarkScores[item.key] ?? 0;
            return (
              <span
                key={item.key}
                className={styles.score}
                title={`${item.label} ${value.toFixed(1)} · внешний бенчмарк`}
              >
                <em>{item.glyph}</em> {value.toFixed(1)}
              </span>
            );
          })}
          <span className={styles.ctx}>{model.contextWindow}</span>
          <span className={styles.rating} title="Оценка сообщества">
            ★ {model.communityRating.toFixed(1)} · {model.voteCount}
          </span>
        </p>
      </div>
      <div className={styles.actions}>
        <IconButton
          label={model.bookmarked ? "Убрать из закладок" : "Сохранить"}
          active={model.bookmarked}
          onClick={onBookmark}
        >
          <IconBookmark width={18} height={18} />
        </IconButton>
        <IconButton
          label={compared ? "Убрать из сравнения" : "Добавить к сравнению"}
          active={compared}
          onClick={onCompare}
        >
          <IconCompare width={18} height={18} />
        </IconButton>
        <IconButton label="Открыть">
          <IconOpen width={18} height={18} />
        </IconButton>
      </div>
    </article>
  );
}
