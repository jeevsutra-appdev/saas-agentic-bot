import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

// Returns documents grouped by base name (multi-chunk docs appear as one entry with parts[])
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const agentId = searchParams.get("agentId");

  if (!tenantSlug) {
    return NextResponse.json({ error: "tenantSlug required" }, { status: 400 });
  }

  let docs = LocalDbController.getDocumentsByTenant(tenantSlug);
  if (agentId) {
    docs = docs.filter(d => d.agentId === agentId);
  }

  // Group chunks that share the same base name (Part N/M pattern)
  const grouped: Record<string, {
    name: string;
    chunks: number;
    characters: number;
    agentId?: string;
    parts: Array<{ id: string; name: string; previewCoordinates: number[] }>;
  }> = {};

  for (const doc of docs) {
    const baseName = doc.name.replace(/\s*\[Part \d+\/\d+\]$/, "");
    if (!grouped[baseName]) {
      grouped[baseName] = { name: baseName, chunks: 0, characters: 0, agentId: doc.agentId, parts: [] };
    }
    grouped[baseName].chunks += 1;
    grouped[baseName].characters += doc.characters || 0;
    grouped[baseName].parts.push({
      id: doc.id,
      name: doc.name,
      previewCoordinates: doc.previewCoordinates || []
    });
  }

  return NextResponse.json({ success: true, docs: Object.values(grouped) });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const docBaseName = searchParams.get("name");

  if (!tenantSlug || !docBaseName) {
    return NextResponse.json({ error: "tenantSlug and name required" }, { status: 400 });
  }

  // Delete all chunks matching base name
  const docs = LocalDbController.getDocumentsByTenant(tenantSlug);
  const toDelete = docs.filter(
    d => d.name === docBaseName || d.name.startsWith(`${docBaseName} [Part `)
  );
  for (const doc of toDelete) {
    LocalDbController.deleteDocument(tenantSlug, doc.id);
  }

  return NextResponse.json({ success: true, deleted: toDelete.length });
}
