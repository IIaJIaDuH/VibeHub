import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_MESSAGES } from "../data/chat";
import { MODELS } from "../data/models";
import { CURRENT_USER } from "../data/site";
import { TOOLS } from "../data/tools";
import type {
  ChatChannelId,
  ChatMessage,
  EntityKind,
  Model,
  Route,
  Tool,
} from "../types/hub";

const COLLAPSE_KEY = "vibehub-sidebar-collapsed";
const CHAT_KEY = "vibehub-chat-open";

interface HubState {
  route: Route;
  models: Model[];
  tools: Tool[];
  addOpen: boolean;
  searchOpen: boolean;
  sidebarCollapsed: boolean;
  chatOpen: boolean;
  chatChannel: ChatChannelId;
  messages: ChatMessage[];
  focusedEntity: { kind: EntityKind; id: string } | null;
  setRoute: (route: Route) => void;
  setAddOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setChatChannel: (id: ChatChannelId) => void;
  sendMessage: (text: string) => void;
  openEntity: (kind: EntityKind, id: string) => void;
  toggleModelBookmark: (id: string) => void;
  toggleToolBookmark: (id: string) => void;
}

const HubContext = createContext<HubState | null>(null);

export function HubProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>("models");
  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [chatOpen, setChatOpenState] = useState(() => {
    try {
      const stored = localStorage.getItem(CHAT_KEY);
      if (stored === "0") return false;
      if (stored === "1") return true;
      return window.innerWidth >= 1280;
    } catch {
      return true;
    }
  });
  const [chatChannel, setChatChannel] = useState<ChatChannelId>("tools");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [focusedEntity, setFocusedEntity] = useState<{
    kind: EntityKind;
    id: string;
  } | null>(null);
  const [models, setModels] = useState<Model[]>(MODELS);
  const [tools, setTools] = useState<Tool[]>(TOOLS);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setCollapsedState(collapsed);
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, []);

  const setChatOpen = useCallback((open: boolean) => {
    setChatOpenState(open);
    localStorage.setItem(CHAT_KEY, open ? "1" : "0");
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          channelId: chatChannel,
          author: CURRENT_USER,
          text: trimmed,
          createdAt: new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    },
    [chatChannel],
  );

  const openEntity = useCallback((kind: EntityKind, id: string) => {
    setRoute(kind === "model" ? "models" : "tools");
    setFocusedEntity({ kind, id });
  }, []);

  const toggleModelBookmark = useCallback((id: string) => {
    setModels((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
      ),
    );
  }, []);

  const toggleToolBookmark = useCallback((id: string) => {
    setTools((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      route,
      models,
      tools,
      addOpen,
      searchOpen,
      sidebarCollapsed,
      chatOpen,
      chatChannel,
      messages,
      focusedEntity,
      setRoute,
      setAddOpen,
      setSearchOpen,
      setSidebarCollapsed,
      setChatOpen,
      setChatChannel,
      sendMessage,
      openEntity,
      toggleModelBookmark,
      toggleToolBookmark,
    }),
    [
      route,
      models,
      tools,
      addOpen,
      searchOpen,
      sidebarCollapsed,
      chatOpen,
      chatChannel,
      messages,
      focusedEntity,
      setSidebarCollapsed,
      setChatOpen,
      sendMessage,
      openEntity,
      toggleModelBookmark,
      toggleToolBookmark,
    ],
  );

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

export function useHub() {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error("useHub must be used within HubProvider");
  return ctx;
}
