export type Route =
  | "models"
  | "tools"
  | "benchmarks"
  | "bookmarks"
  | "collections";

export type ToolCategory =
  | "coding"
  | "agents"
  | "research"
  | "design"
  | "local-ai";

export type ToolType = "skill" | "mcp" | "plugin" | "cli" | "ide";

export type BenchmarkCategory =
  | "coding"
  | "reasoning"
  | "research"
  | "vision"
  | "speed";

export type ModelFilter =
  | "all"
  | "coding"
  | "reasoning"
  | "vision"
  | "agents"
  | "local";

export type ModelSort = "popular" | "rating" | "new" | "context";

export interface BenchmarkScores {
  coding?: number;
  reasoning?: number;
  research?: number;
  vision?: number;
  speed?: number;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  providerId: string;
  providerLogo: string;
  releaseDate: string;
  contextWindow: string;
  contextTokens: number;
  capabilities: string[];
  pricing?: string;
  benchmarkScores: BenchmarkScores;
  communityRating: number;
  voteCount: number;
  userRating?: number;
  source: string;
  lastUpdated: string;
  bookmarked?: boolean;
  searchText: string;
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  type: ToolType;
  typeLabel: string;
  tags: string[];
  summary: string;
  compatibility: string[];
  rating: number;
  ratingsCount: number;
  bookmarked?: boolean;
  searchText: string;
}

export interface BenchmarkRow {
  id: string;
  modelId: string;
  modelName: string;
  benchmark: string;
  category: BenchmarkCategory;
  score: number;
  scoreMax?: number;
  communityScore: number;
  source: string;
  updatedAt: string;
}

export interface CurrentUser {
  name: string;
  handle: string;
  initials: string;
}

export type ChatChannelId = "general" | "coding" | "models" | "tools";

export type EntityKind = "model" | "tool";

export interface EntityRef {
  kind: EntityKind;
  id: string;
  name: string;
}

export interface ChatAuthor {
  name: string;
  handle: string;
  initials: string;
}

export interface ChatMessage {
  id: string;
  channelId: ChatChannelId;
  author: ChatAuthor;
  text: string;
  createdAt: string;
}

export interface QuickAccessSite {
  id: string;
  url: string;
  title: string;
  domain: string;
  favicon: string;
}
