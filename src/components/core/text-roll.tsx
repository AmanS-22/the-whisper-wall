import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type TextRollProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
};

// Splits text into tokens preserving spaces and line breaks
function tokenize(node: React.ReactNode): Array<{ key: string; text: string } | { key: string; br: true }>{
  const out: Array<any> = [];
  const pushText = (t: string) => {
    // Split by words but keep spaces
    const parts = t.split(/(\s+)/);
    parts.forEach((p, i) => {
      if (p === '\\n') {
        out.push({ key: `br-${out.length}-${i}`, br: true });
      } else if (p.length) {
        out.push({ key: `t-${out.length}-${i}`, text: p });
      }
    });
  };

  const walk = (n: React.ReactNode) => {
    if (n == null) return;
    if (typeof n === 'string') {
      // Normalize newlines
      const normalized = n.replace(/\r\n?/g, '\n');
      const lines = normalized.split('\n');
      lines.forEach((line, li) => {
        pushText(line);
        if (li < lines.length - 1) out.push({ key: `br-${out.length}-${li}`, br: true });
      });
      return;
    }
    if (typeof n === 'number') {
      pushText(String(n));
      return;
    }
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (React.isValidElement(n)) {
      walk(n.props.children);
    }
  };

  walk(node);
  return out;
}

export function TextRoll({ children, className, delay = 0, stagger = 0.02 }: TextRollProps) {
  const tokens = tokenize(children);
  const reduce = useReducedMotion();

  return (
    <span className={className} aria-live="polite">
      {tokens.map((t, i) => {
        if ('br' in t) return <br key={t.key} />;
        const isSpace = /^\s+$/.test(t.text);
        if (reduce) return <span key={t.key}>{t.text}</span>;
        // Wrap each token so it can roll up independently
        return (
          <span key={t.key} className="inline-block overflow-hidden align-baseline">
            <motion.span
              initial={{ y: '1.2em', opacity: isSpace ? 1 : 0 }}
              animate={{ y: '0em', opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + i * stagger, ease: 'easeOut' }}
              className="inline-block will-change-transform"
            >
              {t.text}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

export default TextRoll;
