import { describe, expect, it, vi } from "vitest";

vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///docs/",
  readDirectoryAsync: async () => ["notes.sqlite"],
}));
vi.mock("expo-sqlite", () => ({}));

import { allAssets } from "../models/assetRegistry";
import { knowledgePacks } from "../rag/packs";
import { ANDROID_TOPIC_PACK_IDS, isChatKnowledgePack, settingsCorpusItems } from "./registerPacks";

describe("Android knowledge pack registration", () => {
  it("registers preparedness and crypto, and offers them in Settings", () => {
    const registered = allAssets().map((a) => a.id);
    for (const id of ANDROID_TOPIC_PACK_IDS) expect(registered).toContain(id);
    expect(registered).not.toContain("boar-wikivoyage-en");
    expect(registered.some((id) => id.startsWith("boar-wiki-en"))).toBe(false);

    const offered = settingsCorpusItems().map((a) => a.id);
    expect(offered).toEqual(
      expect.arrayContaining(["corpus-standard", "corpus-full", "wiki-vital5", "boar-preparedness", "boar-crypto"])
    );
    expect(offered.filter((id) => id === "boar-preparedness" || id === "boar-crypto")).toEqual([
      "boar-preparedness",
      "boar-crypto",
    ]);
    expect(offered).not.toContain("boar-wikivoyage-en");
    expect(offered.some((id) => id.startsWith("boar-wiki-en"))).toBe(false);
  });

  it("checks sqlite packs via the asset registry, so preparedness can unlock chat suggestions", () => {
    const checked = allAssets().filter(isChatKnowledgePack).map((a) => a.id);
    expect(checked).toEqual(expect.arrayContaining(["wiki-vital5", "boar-preparedness", "boar-crypto"]));
    expect(checked).not.toContain("corpus-standard");
    expect(checked.some((id) => id.startsWith("boar-wiki-en"))).toBe(false);
    expect(checked).not.toContain("boar-wikivoyage-en");
  });

  it("knowledgePacks() follows registered sqlite packs, not only CORPUS_CATALOG", async () => {
    const ids = (await knowledgePacks()).map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(["wiki-vital5", "boar-preparedness", "boar-crypto", "local-notes"]));
    expect(ids).not.toContain("corpus-standard");
    expect(ids).not.toContain("corpus-full");
  });
});
