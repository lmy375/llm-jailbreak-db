import type { ReactNode } from 'react';

/** One label/value row; shared by both archive drawers so they stay in sync. */
export function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 text-[13px]">
      <span className="w-[84px] flex-none pt-[3px] text-[11px] uppercase leading-[1.7] tracking-[0.06em] text-faint">
        {label}
      </span>
      <div className="min-w-0 flex-1 leading-[1.7] text-muted">{children}</div>
    </div>
  );
}