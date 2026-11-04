import type { Data, PromptBody } from '../types';

/** Shape the app loads up front: everything except the prompt bodies themselves. */
export async function loadData(): Promise<Data> {
  const res = await fetch(`${import.meta.env.BASE_URL}data.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Data;
}

// Bodies are fetched one at a time, when a drawer needs them. Successful loads
// are kept for the session so reopening a prompt or toggling languages is free.
const bodyCache = new Map<string, Promise<string>>();

/**
 * Raw body text for one system prompt in one language. Rejects when the
 * translation has not been written yet — callers fall back to English.
 */
export function loadBody(lang: string, systemPromptId: string): Promise<string> {
  const key = `${lang}/${systemPromptId}`;
  let pending = bodyCache.get(key);
  if (!pending) {
    pending = fetch(`${import.meta.env.BASE_URL}system-bodies/${lang}/${systemPromptId}.txt`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .catch((e: unknown) => {
        // Do not cache a failure: a later attempt should be able to retry.
        bodyCache.delete(key);
        throw e;
      });
    bodyCache.set(key, pending);
  }
  return pending;
}

// Same deal for the jailbreak archive: both language sides of an entry arrive
// together, one file per prompt.
const promptBodyCache = new Map<string, Promise<PromptBody>>();

export function loadPromptBody(id: string): Promise<PromptBody> {
  let pending = promptBodyCache.get(id);
  if (!pending) {
    pending = fetch(`${import.meta.env.BASE_URL}prompt-bodies/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PromptBody>;
      })
      .catch((e: unknown) => {
        promptBodyCache.delete(id);
        throw e;
      });
    promptBodyCache.set(id, pending);
  }
  return pending;
}
