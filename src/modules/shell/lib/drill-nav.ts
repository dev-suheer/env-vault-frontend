export type DrillDirection = "forward" | "back" | "none";

type Drill =
  | { tree: "ws"; depth: 0 | 1 | 2 }
  | { tree: "personal"; depth: 0 }
  | { tree: "env" };

export function drillDirection(from: string, to: string): DrillDirection {
  if (from === to) return "none";
  const a = parseDrill(from);
  const b = parseDrill(to);
  if (!a || !b) return "none";

  if (a.tree === "ws" && b.tree === "ws") {
    if (b.depth > a.depth) return "forward";
    if (b.depth < a.depth) return "back";
    return "none";
  }

  if (b.tree === "env") {
    if (a.tree === "ws" && a.depth === 2) return "forward";
    if (a.tree === "personal") return "forward";
    return "none";
  }

  if (a.tree === "env") {
    if (b.tree === "ws" && b.depth >= 1) return "back";
    if (b.tree === "personal") return "back";
    return "none";
  }

  return "none";
}

function parseDrill(pathname: string): Drill | null {
  if (pathname === "/workspaces") return { tree: "ws", depth: 0 };
  if (/^\/workspaces\/[^/]+$/.test(pathname)) return { tree: "ws", depth: 1 };
  if (/^\/workspaces\/[^/]+\/projects\/[^/]+$/.test(pathname)) return { tree: "ws", depth: 2 };
  if (pathname === "/envs") return { tree: "personal", depth: 0 };
  if (/^\/envs\/[^/]+$/.test(pathname)) return { tree: "env" };
  return null;
}
