interface Props {
  html: string;
}

export function SourceView({ html }: Props) {
  return (
    <section
      className="source-content rounded-panel border border-line bg-surface px-7 py-9 shadow-[var(--shadow-card)] sm:px-10"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}