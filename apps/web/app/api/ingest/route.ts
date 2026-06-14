import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";
import { generateRealEmbedding, chunkDocumentText } from "./helper";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");
    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }
    const docs = (await LocalDbController.getDocumentsByTenant(tenantSlug)).map(d => ({
      id: d.id,
      name: d.name,
      characters: d.characters,
      agentId: d.agentId,
      createdAt: d.createdAt,
      dimensions: d.previewCoordinates?.length || 0
    }));
    return NextResponse.json({ success: true, documents: docs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const docId = searchParams.get("docId");
    if (!tenantSlug || !docId) {
      return NextResponse.json({ error: "Missing tenantSlug or docId" }, { status: 400 });
    }
    await LocalDbController.deleteDocument(tenantSlug, docId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let name = "";
    let tenantSlug = "";
    let agentId = "";
    let rawText = "";

    if (contentType.includes("multipart/form-data")) {
      // File upload path (PDF, DOCX, TXT)
      const formData = await request.formData();
      name = formData.get("name") as string;
      const file = formData.get("file") as File;
      tenantSlug = formData.get("tenantSlug") as string;
      agentId = (formData.get("agentId") as string) || "";

      if (!name || !file || !tenantSlug) {
        return NextResponse.json(
          { error: "Missing required 'name', 'file', or 'tenantSlug' fields." },
          { status: 400 }
        );
      }

      console.log(`[RAG Ingestion] File upload: "${name}" (${file.name}, ${file.type}, ${file.size} bytes) for tenant "${tenantSlug}"`);

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
        // @ts-ignore
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text;
      } else if (
        file.name.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const docxData = await mammoth.extractRawText({ buffer });
        rawText = docxData.value;
      } else {
        rawText = buffer.toString("utf8");
      }

      if (!rawText.trim()) {
        return NextResponse.json(
          { error: "Failed to extract text from the document, or document is empty." },
          { status: 400 }
        );
      }

      const isLikelyScanned =
        (file.name.endsWith(".pdf") || file.type === "application/pdf") &&
        rawText.trim().length < 200 &&
        file.size > 50000;

      if (isLikelyScanned) {
        return NextResponse.json({
          error: `This PDF appears to be scanned (image-based) — only ${rawText.trim().length} characters extracted from a ${Math.round(file.size / 1024)}KB file. Use a text-based PDF or paste as .txt instead.`,
          isScannedPdf: true
        }, { status: 422 });
      }

    } else {
      // JSON text body path (manual text entry from admin UI)
      const body = await request.json();
      name = body.name;
      rawText = body.content;
      tenantSlug = body.tenantSlug;
      agentId = body.agentId || "";

      if (!name || !rawText || !tenantSlug) {
        return NextResponse.json(
          { error: "Missing required 'name', 'content', or 'tenantSlug' fields." },
          { status: 400 }
        );
      }

      console.log(`[RAG Ingestion] Text entry: "${name}" (${rawText.length} chars) for tenant "${tenantSlug}"`);
    }

    console.log(`[RAG Ingestion] Extracted ${rawText.length} characters. Chunking...`);
    const chunks = await chunkDocumentText(rawText, 1000, 200);
    console.log(`[RAG Ingestion] Split into ${chunks.length} chunks.`);

    const rawSettings = await LocalDbController.getTenantSettings(tenantSlug);
    const tenantSettings = rawSettings
      ? {
          ...rawSettings,
          embeddingProvider:
            rawSettings.embeddingProvider ||
            (rawSettings.openRouterApiKey
              ? "openrouter"
              : rawSettings.openAIApiKey
              ? "openai"
              : rawSettings.geminiApiKey
              ? "gemini"
              : "local"),
          embeddingModel:
            rawSettings.embeddingModel ||
            (rawSettings.openRouterApiKey
              ? "nomic-ai/nomic-embed-text-v1.5"
              : rawSettings.openAIApiKey
              ? "text-embedding-3-small"
              : rawSettings.geminiApiKey
              ? "text-embedding-004"
              : "Xenova/all-MiniLM-L6-v2"),
        }
      : null;

    console.log(`[RAG Ingestion] Provider: ${tenantSettings?.embeddingProvider || "local"}, Model: ${tenantSettings?.embeddingModel}`);

    let firstDocumentId = "";
    let firstCoordinatesPreview: number[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const chunkName = chunks.length > 1 ? `${name} [Part ${i + 1}/${chunks.length}]` : name;

      console.log(`[RAG Ingestion] Embedding chunk ${i + 1}/${chunks.length}...`);
      const embedding = await generateRealEmbedding(chunkText, tenantSettings || undefined, "index");

      const newDoc = await LocalDbController.addDocument({
        tenantSlug,
        agentId: agentId || undefined,
        name: chunkName,
        content: chunkText,
        characters: chunkText.length,
        previewCoordinates: embedding
      });

      if (i === 0) {
        firstDocumentId = newDoc.id;
        firstCoordinatesPreview = embedding.slice(0, 5);
      }
    }

    const actualDimensions =
      (await LocalDbController.getDocumentsByTenant(tenantSlug)).find(d => d.id === firstDocumentId)
        ?.previewCoordinates?.length || 0;

    return NextResponse.json({
      success: true,
      message: `Document split into ${chunks.length} chunks and vectorized successfully.`,
      documentId: firstDocumentId,
      name,
      characters: rawText.length,
      chunks: chunks.length,
      dimensions: actualDimensions,
      provider: tenantSettings?.embeddingProvider || "local",
      previewCoordinates: firstCoordinatesPreview,
    });

  } catch (err: any) {
    console.error("[RAG Ingestion] Error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during ingestion." },
      { status: 500 }
    );
  }
}
