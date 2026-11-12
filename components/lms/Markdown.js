// components/lms/Markdown.js
// Small Markdown renderer for lesson content. It deliberately supports only the
// subset used by the seeded lessons (headings, lists, quotes, code, bold, italic,
// inline code and links) so the project needs no extra dependency.
import Link from "next/link";

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
const HEADING_CLASS = {
  1: "text-[32px] font-bold leading-10",
  2: "text-2xl font-bold leading-8",
  3: "text-xl font-semibold leading-7",
  4: "text-base font-semibold leading-6",
};

function inline(text, keyPrefix) {
  return text.split(INLINE).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded-md bg-tinta-100 px-1.5 py-0.5 text-[0.9em] text-tinta-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/") ? (
        <Link key={key} href={href} className="font-semibold text-sprout-700 underline">
          {label}
        </Link>
      ) : (
        <a key={key} href={href} className="font-semibold text-sprout-700 underline" target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <span key={key}>{part}</span>;
  });
}

function parse(source) {
  const lines = String(source ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={key++} className="overflow-x-auto rounded-2xl bg-tinta-900 p-4 text-sm text-tinta-100">
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${level}`;
      blocks.push(
        <Tag key={key++} className={`${HEADING_CLASS[level]} mt-2`}>
          {inline(heading[2], `h-${key}`)}
        </Tag>,
      );
      index += 1;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="border-tinta-100" />);
      index += 1;
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1.5 pl-5 marker:text-sprout-600">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inline(item, `ul-${key}-${itemIndex}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-sprout-700">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inline(item, `ol-${key}-${itemIndex}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={key++} className="rounded-r-2xl border-l-4 border-sprout-300 bg-sprout-50 py-3 pl-4 pr-4 text-tinta-700">
          {inline(quote.join(" "), `quote-${key}`)}
        </blockquote>,
      );
      continue;
    }

    // Paragraph: consume lines until a blank line or the start of another block.
    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !lines[index].trim().startsWith("```") &&
      !/^-{3,}$/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={key++} className="leading-[26px]">
        {inline(paragraph.join(" "), `p-${key}`)}
      </p>,
    );
  }

  return blocks;
}

export default function Markdown({ text }) {
  return <div className="max-w-[68ch] space-y-4 text-base leading-[26px] text-tinta-700 [&_strong]:text-tinta-900">{parse(text)}</div>;
}
