const DECK_ROUTE_PREFIX = "d_";

export type DeckView = "study" | "browse-all" | "stats";

export function encodeDeckRouteId(deckId: string): string {
  const bytes = new TextEncoder().encode(deckId);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  const encoded = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${DECK_ROUTE_PREFIX}${encoded}`;
}

export function decodeDeckRouteId(routeId: string): string {
  if (!routeId.startsWith(DECK_ROUTE_PREFIX)) {
    try {
      return decodeURIComponent(routeId);
    } catch {
      return routeId;
    }
  }

  try {
    const encoded = routeId.slice(DECK_ROUTE_PREFIX.length);
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    return new TextDecoder().decode(bytes);
  } catch {
    return routeId;
  }
}

export function getDeckViewPath(deckId: string, view: DeckView): string {
  return `/decks/${encodeDeckRouteId(deckId)}/${view}`;
}

export function getDeckViewFromPath(pathname: string): DeckView {
  const lastSegment = pathname.split("/").filter(Boolean).at(-1);
  if (lastSegment === "browse-all" || lastSegment === "stats") {
    return lastSegment;
  }
  return "study";
}
