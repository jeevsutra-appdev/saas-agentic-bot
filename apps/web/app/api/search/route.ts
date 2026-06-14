export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { sandboxDocumentsStore, generateMockEmbedding } from "../ingest/helper";

// Cosine similarity helper (dot product since both are unit vectors)
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  for (let i = 0; i < 1536; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, tenantSlug, limit = 3 } = body;

    if (!query || !tenantSlug) {
      return NextResponse.json(
        { error: "Missing required 'query' or 'tenantSlug' fields in request body." },
        { status: 400 }
      );
    }

    console.log(`[RAG Search] Querying: "${query}" for tenant: "${tenantSlug}" (limit: ${limit})`);

    // 1. Generate query vector coordinates
    const queryVector = generateMockEmbedding(query);

    // 2. Perform Cosine Similarity calculation across matching tenant documents
    const scopedDocs = sandboxDocumentsStore.filter(doc => doc.tenantSlug === tenantSlug);
    
    const matches = scopedDocs.map(doc => {
      const similarity = calculateCosineSimilarity(doc.embedding, queryVector);
      return {
        id: doc.id,
        name: doc.name,
        content: doc.content,
        similarity: parseFloat(similarity.toFixed(4))
      };
    });

    // 3. Sort by descending similarity and slice to limit
    const sortedMatches = matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      query,
      tenantSlug,
      resultsCount: sortedMatches.length,
      matches: sortedMatches
    });

  } catch (err: any) {
    console.error("Error in semantic search API:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected semantic search error occurred." },
      { status: 500 }
    );
  }
}
