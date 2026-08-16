import type { EntityRef, Model, Tool } from "../types/hub";

export function entityIndex(models: Model[], tools: Tool[]): EntityRef[] {
  return [
    ...models.map((m) => ({ kind: "model" as const, id: m.id, name: m.name })),
    ...tools.map((t) => ({ kind: "tool" as const, id: t.id, name: t.name })),
  ].sort((a, b) => b.name.length - a.name.length);
}

export function matchEntity(query: string, entities: EntityRef[]): EntityRef | undefined {
  const q = query.trim().toLowerCase();
  return entities.find((e) => e.name.toLowerCase() === q);
}

export function filterEntities(query: string, entities: EntityRef[]): EntityRef[] {
  const q = query.trim().toLowerCase();
  if (!q) return entities;
  return entities.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q.replace(/\s+/g, "-")),
  );
}

export type MessagePart =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; entity: EntityRef };

export function parseMessage(text: string, entities: EntityRef[]): MessagePart[] {
  const parts: MessagePart[] = [];
  let i = 0;
  while (i < text.length) {
    const at = text.indexOf("@", i);
    if (at === -1) {
      parts.push({ type: "text", value: text.slice(i) });
      break;
    }
    if (at > i) parts.push({ type: "text", value: text.slice(i, at) });
    const rest = text.slice(at + 1);
    const hit = entities.find((e) =>
      rest.toLowerCase().startsWith(e.name.toLowerCase()),
    );
    if (hit) {
      parts.push({ type: "mention", value: hit.name, entity: hit });
      i = at + 1 + hit.name.length;
    } else {
      parts.push({ type: "text", value: "@" });
      i = at + 1;
    }
  }
  return parts;
}

export function atQuery(value: string, caret: number) {
  const before = value.slice(0, caret);
  const idx = before.lastIndexOf("@");
  if (idx < 0) return null;
  const query = before.slice(idx + 1);
  if (query.includes("\n")) return null;
  if (/\s{2}/.test(query)) return null;
  return { start: idx, query };
}