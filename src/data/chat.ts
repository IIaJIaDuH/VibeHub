import type { ChatChannelId, ChatMessage } from "../types/hub";

export const CHAT_CHANNELS: { id: ChatChannelId; label: string }[] = [
  { id: "general", label: "общий" },
  { id: "coding", label: "coding" },
  { id: "models", label: "models" },
  { id: "tools", label: "tools" },
];

const a = {
  mara: { name: "Mara", handle: "mara", initials: "MA" },
  nik: { name: "Nikita", handle: "nik", initials: "NK" },
  ira: { name: "Ira", handle: "ira", initials: "IR" },
  den: { name: "Denis", handle: "den", initials: "DN" },
  ola: { name: "Ola", handle: "ola", initials: "OL" },
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "g1",
    channelId: "general",
    author: a.mara,
    text: "Кто уже пробовал @Kimi K2.5 на больших репозиториях?",
    createdAt: "21:04",
  },
  {
    id: "g2",
    channelId: "general",
    author: a.nik,
    text: "Я пока через @Codex CLI гоняю, нормально держится.",
    createdAt: "21:06",
  },
  {
    id: "g3",
    channelId: "general",
    author: a.ira,
    text: "Для документации поставь @Context7, сильно удобнее.",
    createdAt: "21:08",
  },
  {
    id: "g4",
    channelId: "general",
    author: a.den,
    text: "Согласен. Каталог справа как раз для этого: ткнул mention — сразу карточка.",
    createdAt: "21:09",
  },
  {
    id: "c1",
    channelId: "coding",
    author: a.ola,
    text: "@Playwright MCP кто-нибудь использует с Codex?",
    createdAt: "18:22",
  },
  {
    id: "c2",
    channelId: "coding",
    author: a.nik,
    text: "Да, на смоуке UI. Снапшоты стабильнее, чем сырой Playwright без MCP.",
    createdAt: "18:25",
  },
  {
    id: "c3",
    channelId: "coding",
    author: a.mara,
    text: "@PR Review Skill тоже ок, если не ждать от него архитектурных решений.",
    createdAt: "18:31",
  },
  {
    id: "m1",
    channelId: "models",
    author: a.ira,
    text: "Кто тестировал @GPT-5 против @Kimi K2.5 на больших репах?",
    createdAt: "12:14",
  },
  {
    id: "m2",
    channelId: "models",
    author: a.den,
    text: "@Claude Opus 4.1 всё ещё спокойнее на рефакторингах. GPT быстрее, но чаще спешит.",
    createdAt: "12:18",
  },
  {
    id: "m3",
    channelId: "models",
    author: a.ola,
    text: "Для локалки смотрю @Qwen3 14B. Кодинг слабее, но latency приятный.",
    createdAt: "12:41",
  },
  {
    id: "t1",
    channelId: "tools",
    author: a.mara,
    text: "Для этого попробуй @Context7 — подтягивает актуальную доку, а не кэш модели.",
    createdAt: "20:02",
  },
  {
    id: "t2",
    channelId: "tools",
    author: a.nik,
    text: "@Cursor + @Codex CLI у меня в связке: IDE на правках, CLI на обходе репы.",
    createdAt: "20:11",
  },
  {
    id: "t3",
    channelId: "tools",
    author: a.ira,
    text: "@Ollama не путайте с каталогом моделей. Это рантайм, карточка в Инструментах.",
    createdAt: "20:16",
  },
];
