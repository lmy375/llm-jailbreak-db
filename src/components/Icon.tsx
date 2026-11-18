export type IconName =
  | 'chevronRight'
  | 'arrowRight'
  | 'arrowUp'
  | 'arrowDown'
  | 'sort'
  | 'close'
  | 'external'
  | 'copy'
  | 'check'
  | 'diamond';

const paths: Record<IconName, string> = {
  chevronRight: 'M6 3.75 10.25 8 6 12.25',
  arrowRight: 'M3 8h10M9.25 4.25 13 8l-3.75 3.75',
  arrowUp: 'M8 12.5V3.5M4.25 7.25 8 3.5l3.75 3.75',
  arrowDown: 'M8 3.5v9M4.25 8.75 8 12.5l3.75-3.75',
  sort: 'M5 6.25 8 3.25l3 3M5 9.75l3 3 3-3',
  close: 'M4 4l8 8M12 4l-8 8',
  external: 'M9.5 2.5h4v4M13.5 2.5 7.5 8.5M11.5 9.5v3.5h-8v-8H7',
  copy: 'M5.75 5.75V3.25h7v7h-2.5M3.25 5.75h7.25v7H3.25Z',
  check: 'M3.25 8.5 6.5 11.75 12.75 4.75',
  diamond: 'M8 2.25 13.75 8 8 13.75 2.25 8Z',
};

/** Shared line-icon set; sizes and colors come from the caller's className. */
export function Icon({
  name,
  className = 'h-3.5 w-3.5',
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}