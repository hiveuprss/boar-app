/**
 * Knowledge packs the Android UI offers. Each pack module registers its
 * catalog entry (registerAssetProvider) when it loads. Import this once from
 * the app entry so Settings and chat see the packs at startup.
 *
 * English Wikipedia shards and Wikivoyage stay out: wikiEnPacks.ts is only
 * loaded for a benchmark install, and offering Wikivoyage is a separate change.
 */
import "../rag/preparedness";
import "../rag/cryptoPack";

import { allAssets } from "../models/assetRegistry";
import { CORPUS_CATALOG, type CatalogModel } from "../models/manifest";

/** Topic packs shown in Settings on top of the curated corpus catalog. */
export const ANDROID_TOPIC_PACK_IDS = ["boar-preparedness", "boar-crypto"] as const;

const TOPIC_PACK_IDS = new Set<string>(ANDROID_TOPIC_PACK_IDS);

/**
 * Knowledge rows in Settings: the curated corpus catalog, then registered
 * topic packs it does not already list. Wikipedia shards are not included.
 */
export function settingsCorpusItems(): CatalogModel[] {
  const seen = new Set(CORPUS_CATALOG.map((c) => c.id));
  const extra = allAssets().filter((a) => TOPIC_PACK_IDS.has(a.id) && !seen.has(a.id));
  return [...CORPUS_CATALOG, ...extra];
}

/**
 * Sqlite packs the empty chat asks about, from the asset registry. Preparedness
 * is included once registered, so its suggestions can unlock. English Wikipedia
 * shards (boar-wiki-en-*) are not: they are not offered in this UI.
 */
export function isChatKnowledgePack(asset: CatalogModel): boolean {
  return asset.format === "sqlite-pack" && !asset.id.startsWith("boar-wiki-en");
}
