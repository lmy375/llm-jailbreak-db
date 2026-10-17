interface Props {
  html: string;
}

export function SourceView({ html }: Props) {
  return (
    <section
      className="source-content max-w-[880px] rounded-[14px] border border-line bg-surface px-6 py-7 sm:px-8"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
