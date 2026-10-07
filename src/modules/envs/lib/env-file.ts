export function parseEnv(text: string) {
  const pairs: { k: string; v: string }[] = [];
  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;
    let value = match[2].trim();
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    pairs.push({ k: match[1], v: value });
  });
  return pairs;
}

export function toEnv(vars: { k: string; v: string }[]) {
  return vars.map((item) => `${item.k}=${/[\s#"']/.test(item.v) ? JSON.stringify(item.v) : item.v}`).join("\n") + "\n";
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function downloadEnv(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "env.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
