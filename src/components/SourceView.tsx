interface Props {
  html: string;
}

export function SourceView({ html }: Props) {
  return (
    <section
      className="source-content rounded-[22px] border border-line bg-surface px-7 py-8 shadow-[var(--shadow-card)] sm:px-10"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}