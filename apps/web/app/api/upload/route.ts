import { NextResponse } from 'next/server';
import { createAetherClient } from '@aether/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = createAetherClient({ serviceRole: true });
    const bucketName = 'aether_assets';

    // Ensure bucket exists (optional, but good for local dev)
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && !buckets.find(b => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`docs/${fileName}`, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`docs/${fileName}`);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload" }, { status: 500 });
  }
}
