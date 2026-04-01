const DEFAULT_INSTANCES = [
  "https://lingva.ml",
  "https://lingva.thedaviddelta.com",
  "https://translate.plausibility.cloud",
  "https://translate.terraprint.co",
  "https://translate.projectsegfau.lt",
];

const failureCounts = new Map<string, number>();

function getInstances(): string[] {
  const env = process.env.LINGVA_INSTANCES;
  const instances = env
    ? env.split(",").map((s) => s.trim())
    : DEFAULT_INSTANCES;
  return [...instances].sort(
    (a, b) => (failureCounts.get(a) ?? 0) - (failureCounts.get(b) ?? 0)
  );
}

async function translateOne(
  text: string,
  source: string,
  target: string,
  instance: string,
  timeoutMs: number
): Promise<string> {
  const url = `${instance}/api/v1/${source}/${target}/${encodeURIComponent(text)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data.translation) throw new Error("empty translation");
  return data.translation as string;
}

export async function lingvaTranslate(
  strings: string[],
  source: string,
  target: string
): Promise<(string | null)[]> {
  if (strings.length === 0) return [];

  const instances = getInstances();
  const timeoutMs = parseInt(process.env.LINGVA_TIMEOUT_MS ?? "4000");

  const results = await Promise.allSettled(
    strings.map(async (text) => {
      for (const instance of instances) {
        try {
          const translated = await translateOne(
            text,
            source,
            target,
            instance,
            timeoutMs
          );
          failureCounts.set(instance, 0);
          return translated;
        } catch {
          failureCounts.set(instance, (failureCounts.get(instance) ?? 0) + 1);
        }
      }
      return null;
    })
  );

  return results.map((r) => (r.status === "fulfilled" ? r.value : null));
}

export function isLingvaEnabled(): boolean {
  return process.env.LINGVA_ENABLED !== "false";
}

export async function checkLingvaHealth(): Promise<{
  enabled: boolean;
  instances: string[];
  working: string[];
}> {
  const enabled = isLingvaEnabled();
  const instances = getInstances();
  const working: string[] = [];

  if (enabled) {
    await Promise.all(
      instances.map(async (instance) => {
        try {
          const response = await fetch(`${instance}/api/v1/en/es/hello`, {
            signal: AbortSignal.timeout(2000),
          });
          if (response.ok) working.push(instance);
        } catch { /* skip failed health check */ }
      })
    );
  }

  return { enabled, instances, working };
}