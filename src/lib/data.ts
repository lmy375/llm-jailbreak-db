import type { Data } from '../types';

export async function loadData(): Promise<Data> {
  const res = await fetch(`${import.meta.env.BASE_URL}data.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Data;
}