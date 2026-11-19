import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Short identifier shown in the drawer header. */
  title: string;
  /** Accessible label for the close button. */
  closeLabel: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Right-hand side drawer shared by both archives. It stays mounted so it can
 * slide in/out; while hidden it is inert and unfocusable, and while open focus
 * is trapped inside and returned to the trigger on close.
 */
export function Drawer({ open, onClose, title, closeLabel, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  // App passes an inline close handler, so keep the latest one in a ref: the
  // focus/escape effect must not re-run every time the parent re-renders.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // The closed drawer is only translated off-screen, so `inert` is what keeps
  // its controls out of the tab order and the accessibility tree.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (open) root.removeAttribute('inert');
    else root.setAttribute('inert', '');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const frame = requestAnimationFrame(() => panel?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0 && el.getAttribute('aria-hidden') !== 'true'
      );
      if (!nodes.length) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      const restore = restoreRef.current;
      restoreRef.current = null;
      if (restore && document.contains(restore)) restore.focus();
    };
  }, [open]);

  // A newly opened record always starts at the top.
  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [open, title]);

  return (
    <div
      ref={rootRef}
      className={'fixed inset-0 z-50 overflow-hidden ' + (open ? '' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={
          'absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ' +
          (open ? 'opacity-100' : 'opacity-0')
        }
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={
          'absolute inset-y-0 right-0 flex w-full max-w-[840px] flex-col overflow-hidden border-l border-line bg-surface shadow-[-24px_0_60px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none sm:rounded-l-[20px] ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <header className="flex flex-none items-center gap-3 border-b border-line px-6 py-3.5">
          <span className="font-mono text-[12px] tracking-wide text-muted">{title}</span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-hover text-muted transition hover:text-ink"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </header>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}