import { useEffect, useMemo, useRef, useState } from "react";
import { CHAT_CHANNELS } from "../../data/chat";
import { atQuery, entityIndex, filterEntities, parseMessage } from "../../lib/mentions";
import { useHub } from "../../state/HubContext";
import type { ChatMessage, EntityRef } from "../../types/hub";
import {
  IconBookmark,
  IconChevron,
  IconClose,
  IconPlus,
  IconReply,
  IconSend,
} from "../icons";
import { ProviderMark } from "../ProviderMark/ProviderMark";
import styles from "./ChatPanel.module.css";

export function ChatPanel() {
  const {
    models,
    tools,
    chatChannel,
    setChatChannel,
    messages,
    sendMessage,
    setChatOpen,
    openEntity,
  } = useHub();
  const entities = useMemo(() => entityIndex(models, tools), [models, tools]);
  const channel = CHAT_CHANNELS.find((c) => c.id === chatChannel)!;
  const list = messages.filter((m) => m.channelId === chatChannel);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [list.length, chatChannel]);

  return (
    <aside className={styles.panel} aria-label="Чат сообщества">
      <header className={styles.header}>
        <ChannelMenu
          label={channel.label}
          current={chatChannel}
          onChange={setChatChannel}
        />
        <button
          type="button"
          className={styles.iconBtn}
          title="Свернуть чат"
          aria-label="Свернуть чат"
          onClick={() => setChatOpen(false)}
        >
          <IconClose width={18} height={18} />
        </button>
      </header>

      <div className={styles.thread} ref={scroller}>
        {list.map((message) => (
          <ChatRow
            key={message.id}
            message={message}
            entities={entities}
            onMention={openEntity}
          />
        ))}
      </div>

      <Composer entities={entities} onSend={sendMessage} />
    </aside>
  );
}

function ChannelMenu({
  label,
  current,
  onChange,
}: {
  label: string;
  current: string;
  onChange: (id: (typeof CHAT_CHANNELS)[number]["id"]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.channelWrap}>
      <button
        type="button"
        className={styles.channel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>#{label}</span>
        <IconChevron width={16} height={16} className={styles.chevron} />
      </button>
      {open ? (
        <div className={styles.menu} role="listbox">
          {CHAT_CHANNELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === current ? styles.menuActive : undefined}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
            >
              #{item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChatRow({
  message,
  entities,
  onMention,
}: {
  message: ChatMessage;
  entities: EntityRef[];
  onMention: (kind: EntityRef["kind"], id: string) => void;
}) {
  const parts = parseMessage(message.text, entities);

  return (
    <article className={styles.msg}>
      <span className={styles.avatar} aria-hidden>
        {message.author.initials}
      </span>
      <div className={styles.msgBody}>
        <p className={styles.meta}>
          <strong>{message.author.name}</strong>
          <time>{message.createdAt}</time>
        </p>
        <p className={styles.bubble}>
          {parts.map((part, i) =>
            part.type === "mention" ? (
              <button
                key={i}
                type="button"
                className={styles.mention}
                onClick={() => onMention(part.entity.kind, part.entity.id)}
              >
                @{part.value}
              </button>
            ) : (
              <span key={i}>{part.value}</span>
            ),
          )}
        </p>
      </div>
      <div className={styles.hover}>
        <button type="button" title="Ответить" aria-label="Ответить">
          <IconReply width={15} height={15} />
        </button>
        <button type="button" title="Сохранить" aria-label="Сохранить">
          <IconBookmark width={15} height={15} />
        </button>
      </div>
    </article>
  );
}

function Composer({
  entities,
  onSend,
}: {
  entities: EntityRef[];
  onSend: (text: string) => void;
}) {
  const { models, tools } = useHub();
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  const area = useRef<HTMLTextAreaElement>(null);

  const query = atQuery(value, caret);
  const suggestions = query
    ? filterEntities(query.query, entities).slice(0, 8)
    : [];

  const modelsHits = suggestions.filter((s) => s.kind === "model");
  const toolsHits = suggestions.filter((s) => s.kind === "tool");
  const flat = [...modelsHits, ...toolsHits];

  useEffect(() => {
    setActive(0);
  }, [query?.query]);

  const insert = (entity: EntityRef) => {
    if (!query) return;
    const next = `${value.slice(0, query.start)}@${entity.name} ${value.slice(caret)}`;
    setValue(next);
    requestAnimationFrame(() => {
      const pos = query.start + entity.name.length + 2;
      area.current?.focus();
      area.current?.setSelectionRange(pos, pos);
      setCaret(pos);
    });
  };

  const send = () => {
    onSend(value);
    setValue("");
    setCaret(0);
  };

  return (
    <div className={styles.composerWrap}>
      {query && flat.length > 0 ? (
        <div className={styles.ac} role="listbox">
          {modelsHits.length > 0 ? <p className={styles.acLabel}>Модели</p> : null}
          {modelsHits.map((item) => {
            const model = models.find((m) => m.id === item.id);
            const idx = flat.indexOf(item);
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.acItem} ${idx === active ? styles.acOn : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insert(item);
                }}
              >
                {model ? (
                  <ProviderMark model={model} size={28} />
                ) : (
                  <span className={styles.acMark} />
                )}
                <span>
                  <strong>{item.name}</strong>
                  <em>{model?.provider}</em>
                </span>
              </button>
            );
          })}
          {toolsHits.length > 0 ? <p className={styles.acLabel}>Инструменты</p> : null}
          {toolsHits.map((item) => {
            const tool = tools.find((t) => t.id === item.id);
            const idx = flat.indexOf(item);
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.acItem} ${idx === active ? styles.acOn : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insert(item);
                }}
              >
                <span className={styles.acMark}>{item.name.slice(0, 1)}</span>
                <span>
                  <strong>{item.name}</strong>
                  <em>{tool?.typeLabel}</em>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className={styles.composer}>
        <textarea
          ref={area}
          rows={2}
          value={value}
          placeholder="Написать сообщение..."
          onChange={(e) => {
            setValue(e.target.value);
            setCaret(e.target.selectionStart);
          }}
          onClick={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyUp={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyDown={(e) => {
            if (flat.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              e.preventDefault();
              setActive((i) =>
                e.key === "ArrowDown"
                  ? (i + 1) % flat.length
                  : (i - 1 + flat.length) % flat.length,
              );
              return;
            }
            if (flat.length && e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const pick = flat[active];
              if (pick) insert(pick);
              return;
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className={styles.composerBar}>
          <button type="button" className={styles.plus} title="Вложение (скоро)">
            <IconPlus width={18} height={18} />
          </button>
          <button
            type="button"
            className={styles.send}
            title="Отправить"
            aria-label="Отправить"
            disabled={!value.trim()}
            onClick={send}
          >
            <IconSend width={18} height={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
