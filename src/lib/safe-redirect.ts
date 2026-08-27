const AUTH_ONLY_PATHS = ["/login", "/forgot-password", "/update-password", "/accept-invite"];

function isAuthOnlyPath(path: string): boolean {
  return AUTH_ONLY_PATHS.some((p) => path === p || path.startsWith(`${p}?`) || path.startsWith(`${p}/`));
}

/**
 * Validates a post-login redirect target. Must be a same-origin internal
 * path, never one of the auth pages themselves (prevents /login -> /login),
 * never an already-nested redirect param, never a value referencing
 * Lovable's preview auth-bridge. Returns null for anything that fails.
 *
 * `currentPath`, when given, is also rejected as a target — a redirect
 * pointing back at the page that's about to render it can't make progress.
 */
export function safeRedirect(raw: string | undefined | null, currentPath?: string): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (!value.startsWith("/")) return null; // rejects absolute URLs (any scheme) and non-rooted paths
  if (value.startsWith("//") || value.startsWith("/\\")) return null; // protocol-relative / backslash tricks
  if (isAuthOnlyPath(value)) return null;
  if (value.includes("redirect=")) return null; // nested redirect
  if (/lovable\.dev|auth-bridge/i.test(value)) return null;
  if (currentPath && value === currentPath) return null;
  return value;
}
