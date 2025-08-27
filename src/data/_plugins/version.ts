// /src/data/plugins/versionSemver.ts
import type { Schema } from "mongoose";

export type VersionSemverOpts = {
  field?: string; // defaults to "schemaVersion"
  defaultVersion?: string; // defaults to "1.0.0"
};

const SEMVER_RE =
  /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;

function parse(v: string) {
  const m = v.match(SEMVER_RE);
  if (!m) return null;
  return {
    major: +m[1],
    minor: +m[2],
    patch: +m[3],
    pre: m[4] ?? null,
  };
}

export function compareSemver(a: string, b: string): number {
  const A = parse(a),
    B = parse(b);
  if (!A || !B) throw new Error("Invalid semver compare");
  if (A.major !== B.major) return A.major - B.major;
  if (A.minor !== B.minor) return A.minor - B.minor;
  if (A.patch !== B.patch) return A.patch - B.patch;
  if (A.pre === B.pre) return 0;
  // Release > pre-release
  if (A.pre === null) return 1;
  if (B.pre === null) return -1;
  return A.pre.localeCompare(B.pre);
}

export function versionSemverPlugin(
  schema: Schema,
  opts: VersionSemverOpts = {}
) {
  const field = opts.field ?? "schemaVersion";
  const def = opts.defaultVersion ?? "1.0.0";

  schema.add({
    [field]: {
      type: String,
      default: def,
      validate: {
        validator: (v: string) => SEMVER_RE.test(v),
        message: (props: any) => `${props.value} is not valid semver`,
      },
    },
  });

  schema.method("isOlderThan", function (target: string) {
    const cur = this[field] as string;
    return compareSemver(cur, target) < 0;
  });

  schema.method("setVersion", function (v: string) {
    if (!SEMVER_RE.test(v)) throw new Error("Invalid semver");
    this[field] = v;
  });

  schema.statics.compareSemver = compareSemver;
}
