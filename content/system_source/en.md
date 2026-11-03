# System Prompt Library · Data Sources

The full system prompt texts in this archive come from the public sources below. Each record's `source_url` field in `system_prompts.yaml` points at its specific provenance, while `source_id` references the parent archive. The table is generated from the top-level `source` data in `system_prompts.yaml`; `Indexed` is the date the data entered this database, and `Commit` is the revision used at indexing time (not applicable to non-GitHub sources).

<!-- SOURCES_TABLE -->

---

## Inclusion rules

- Only **complete, real** system prompt bodies are archived — never introductions or excerpts. There is **no hard word-count floor**: a genuine product prompt can be a few sentences long (DeepSeek Chat's is 125 words), and short does not mean incomplete.
- Code wrappers, page chrome and Q/A scaffolding are stripped; only the prompt itself is kept.
- Every entry is kept in both English and Chinese; code blocks, JSON schemas and special-token templates stay in the original English.
- Entries whose disclosure date could not be confirmed leave it empty and sort last; an archive date is never substituted.
- **Content is kept verbatim.** Profanity and offensive phrasing in leaked material are never redacted: such text is itself the evidence for studying where a vendor's alignment policy breaks down, and editing it would compromise the archive's accuracy. Grok's `bad_panda` persona is exactly this case — profane throughout and containing slurs — and is preserved in full.