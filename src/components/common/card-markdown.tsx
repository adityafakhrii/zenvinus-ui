import React from 'react';
import type { ReactNode } from 'react';

/**
 * Renders a dataset or model card (the small Markdown subset the Studio editor documents) as React elements, never
 * as raw HTML, so card text cannot inject markup. Supported:
 * - # / ## / ### / #### headings
 * - paragraphs separated by a blank line
 * - "- " or "* " bullet lists and "1. " numbered lists
 * - ``` fenced code blocks, and blocks that are a JSON object or array (sample rows)
 * - `inline code` and **bold**
 * - > quotes
 * Callers apply typography styling via their wrapping prose container.
 */

function inline(text: string, keyBase: string | number): ReactNode[] {
  const parts = text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{part.slice(2, -2)}</strong>;
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

type HeadingTag = 'h3' | 'h4' | 'h5' | 'h6';

const HEADING: ReadonlyArray<readonly [RegExp, HeadingTag]> = [
  [/^####\s+/, 'h6'],
  [/^###\s+/, 'h5'],
  [/^##\s+/, 'h4'],
  [/^#\s+/, 'h3'],
];

const looksLikeJson = (b: string): boolean => /^[[{]/.test(b) && /[\]}]$/.test(b);

/** Split into blocks on blank lines, but keep a fenced code block whole even when it contains blank lines */
function blocks(markdown: string): string[] {
  const out: string[] = [];
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let buf: string[] = [];
  let inFence = false;
  const flush = () => {
    if (buf.length) out.push(buf.join('\n'));
    buf = [];
  };
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inFence) {
        buf.push(line);
        flush();
        inFence = false;
      } else {
        flush();
        buf.push(line);
        inFence = true;
      }
      continue;
    }
    if (!inFence && line.trim() === '') {
      flush();
      continue;
    }
    buf.push(line);
  }
  flush();
  return out;
}

function renderBlock(block: string, i: string | number): ReactNode {
  const b = block.trim();
  if (!b) return null;

  if (b.startsWith('```')) {
    const body = b.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '');
    return <pre key={i}><code>{body}</code></pre>;
  }
  if (looksLikeJson(b)) return <pre key={i}><code>{b}</code></pre>;

  for (const [re, Tag] of HEADING) {
    if (re.test(b) && !b.includes('\n')) return <Tag key={i}>{inline(b.replace(re, ''), i)}</Tag>;
  }

  const lines = b.split('\n').map((l) => l.trim());
  if (lines.every((l) => l.startsWith('>'))) {
    return <blockquote key={i}><p>{inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '), `${i}-q`)}</p></blockquote>;
  }
  if (lines.every((l) => /^[-*]\s+/.test(l))) {
    return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^[-*]\s+/, ''), `${i}-${j}`)}</li>)}</ul>;
  }
  if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
    return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+[.)]\s+/, ''), `${i}-${j}`)}</li>)}</ol>;
  }

  // A heading line directly followed by text without a blank line
  const head = HEADING.find(([re]) => re.test(lines[0]));
  if (head) {
    const [re, Tag] = head;
    return (
      <React.Fragment key={i}>
        <Tag>{inline(lines[0].replace(re, ''), `${i}-h`)}</Tag>
        {renderBlock(lines.slice(1).join('\n'), `${i}-rest`)}
      </React.Fragment>
    );
  }

  return (
    <p key={i}>
      {lines.map((l, j) => (
        <React.Fragment key={j}>
          {j > 0 && <br />}
          {inline(l, `${i}-${j}`)}
        </React.Fragment>
      ))}
    </p>
  );
}

export interface CardMarkdownProps {
  markdown?: string | null;
}

const CardMarkdown = ({ markdown }: CardMarkdownProps) => {
  if (!markdown) return null;
  return <>{blocks(markdown).map((b, i) => renderBlock(b, i))}</>;
};

export default CardMarkdown;
