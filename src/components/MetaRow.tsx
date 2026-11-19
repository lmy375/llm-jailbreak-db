import type { ReactNode } from 'react';

/** One label/value row; shared by both archive drawers so they stay in sync. */
export function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 text-[13px]">
      <span className="w-[78px] flex-none pt-[3px] text-[10.5px] uppercase leading-[1.65] tracking-[0.07em] text-faint">
        {label}
      </span>
      <div className="min-w-0 flex-1 leading-[1.65] text-muted">{children}</div>
    </div>
  );
}