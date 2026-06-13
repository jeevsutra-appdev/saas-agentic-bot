import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface StoredDocument {
  id: string;
  name: string;
  content: string;
  embedding: number[];
  tenantSlug: string;
  createdAt: string;
}

export const sandboxDocumentsStore: StoredDocument[] = [];

// Fallback mock embedding if API fails or no key is provided
export function generateMockEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0);
  for (let i = 0; i < 1536; i++) {
    const charCode1 = text.charCodeAt(i % text.length) || 32;
    const charCode2 = text.charCodeAt((i + 7) % text.length) || 64;
    embedding[i] = Math.sin((charCode1 * i + charCode2) * 0.05);
  }
  let sumSquares = 0;
  for (let i = 0; i < 1536; i++) sumSquares += embedding[i] * embedding[i];
  const magnitude = Math.sqrt(sumSquares);
  for (let i = 0; i < 1536; i++) embedding[i] = embedding[i] / magnitude;
  return embedding;
}

import type { LocalTenantSettings } from "@aether/db";

class PipelineSingleton {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
      if (this.instance === null) {
          // @ts-ignore
          const { pipeline, env } = await import('@xenova/transformers');
          env.allowLocalModels = false; // Only load from HF hub
          // @ts-ignore
          this.instance = pipeline(this.task, this.model, { progress_callback });
      }
      return this.instance;
  }
}

// Generate real multidimensional embeddings using specified provider.
// task = "index" for document ingestion, "search" for user queries.
// nomic-embed-text requires task-specific prefixes for accurate retrieval.
export async function generateRealEmbedding(
  text: string,
  tenantSettings?: Partial<LocalTenantSettings>,
  task: "index" | "search" = "index"
): Promise<number[]> {
  const provider = tenantSettings?.embeddingProvider || "openai";
  const model = tenantSettings?.embeddingModel || "text-embedding-3-small";

  // nomic-embed-text-v1.5 requires task prefixes for proper retrieval quality
  let input = text;
  if (provider === "openrouter" && model.includes("nomic")) {
    input = task === "search" ? `search_query: ${text}` : `search_document: ${text}`;
  }

  try {
    if (provider === "local") {
       const extractor = await PipelineSingleton.getInstance();
       // @ts-ignore
       const output = await extractor(input, { pooling: 'mean', normalize: true });
       return Array.from(output.data);
    } else if (provider === "gemini") {
      const apiKey = tenantSettings?.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing Gemini API Key");

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text: input }] }
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.embedding.values;
    } else if (provider === "openrouter") {
      const apiKey = tenantSettings?.openRouterApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("Missing OpenRouter API Key");

      const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          input,
          model: model || "nomic-ai/nomic-embed-text-v1.5"
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.data[0].embedding;
    } else {
      // Default OpenAI
      const apiKey = tenantSettings?.openAIApiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("Missing OpenAI API Key");

      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          input,
          model: model || "text-embedding-3-small"
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.data[0].embedding;
    }
  } catch (error: any) {
    console.error(`Failed to generate real embedding using ${provider}:`, error.message || error);
    // Graceful fallback to local transformers if API keys fail
    if (provider !== "local") {
      console.log("Falling back to local Xenova embedding model...");
      try {
        const extractor = await PipelineSingleton.getInstance();
        // @ts-ignore
        const output = await extractor(input, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
      } catch (localError: any) {
        console.error("Local embedding also failed:", localError.message || localError);
        throw new Error(`Embedding generation failed. ${provider} returned an error, and local fallback also failed. Please check your API keys.`);
      }
    }
    throw new Error(`Local embedding generation failed: ${error.message || error}`);
  }
}

// Advanced chunking logic using RecursiveCharacterTextSplitter
export async function chunkDocumentText(text: string, chunkSize = 1000, chunkOverlap = 200): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  const output = await splitter.createDocuments([text]);
  return output.map(doc => doc.pageContent);
}
