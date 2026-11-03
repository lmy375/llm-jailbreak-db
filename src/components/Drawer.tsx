import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Short identifier shown in the drawer header. */
  title: string;
  /** Accessible label for the close button. */
  closeLabel: string;
  children: ReactNode;
}

/**
 * Right-hand side drawer shared by both archives. It stays mounted so it can
 * slide in/out; while hidden it is inert and unfocusable.
 */
export function Drawer({ open, onClose, title, closeLabel, children }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // A newly opened record always starts at the top.
  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [open, title]);

  return (
    <div
      className={'fixed inset-0 z-50 overflow-hidden ' + (open ? '' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={
          'absolute inset-0 bg-black/45 transition-opacity duration-300 ' +
          (open ? 'opacity-100' : 'opacity-0')
        }
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          'absolute inset-y-0 right-0 flex w-full max-w-[880px] flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-300 ease-out ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <header className="flex flex-none items-center gap-3 border-b border-line px-5 py-3">
          <span className="font-mono text-[12px] tracking-wide text-muted">{title}</span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
            className="cursor-pointer rounded-[7px] border border-line px-2.5 py-1 text-[12px] leading-none text-muted transition hover:border-line-strong hover:text-ink"
          >
            ✕
          </button>
        </header>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}