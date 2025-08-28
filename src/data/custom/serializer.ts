import { SnapshotOut, type Snapshot } from "./dto";

/** Build a snapshot from lean() results. */
export function buildSnapshot({
  entries,
  globals,
}: {
  entries: Array<any>;
  globals: Array<any>;
}): Snapshot {
  const gByKey = new Map(globals.map((g) => [g.key, g]));
  const fields: any[] = [];

  // 1) current entries
  for (const e of entries) {
    const g = !e.isLocalDef ? gByKey.get(e.key) : undefined;

    const label = e.isLocalDef
      ? e.label ?? e.key
      : g?.label ?? e.label ?? e.key;
    const type = (e.isLocalDef ? e.type : g?.type) ?? "text";
    const required = (e.isLocalDef ? e.required : g?.required) ?? false;

    const hydrated = e.value !== undefined;
    const displayValue = hydrated ? e.value : e.defaultValue ?? g?.defaultValue;

    fields.push({
      key: e.key,
      label,
      type,
      required,
      scope: e.isLocalDef ? "local" : "global",
      value: e.value,
      displayValue,
      hydrated,
      missingRequired: !!required && !hydrated,
    });
  }

  // 2) missing globals
  const have = new Set(fields.map((f) => f.key));
  for (const g of globals) {
    if (have.has(g.key)) continue;
    fields.push({
      key: g.key,
      label: g.label,
      type: g.type,
      required: !!g.required,
      scope: "global",
      value: undefined,
      displayValue: g.defaultValue,
      hydrated: false,
      missingRequired: !!g.required,
    });
  }

  return SnapshotOut.parse({ fields });
}
