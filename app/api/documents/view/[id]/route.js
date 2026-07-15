import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fernet from 'fernet';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req, { params }) {
    try {
        const docId = params.id;

        // 1. Get the document metadata
        const { data: doc, error: docErr } = await supabase
            .from('documents')
            .select('file_path, dek_ref')
            .eq('id', docId)
            .single();

        if (docErr || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        // 2. Download the Encrypted File from the Vault
        const { data: fileData, error: fileErr } = await supabase.storage
            .from('vault-files')
            .download(doc.file_path);

        if (fileErr || !fileData) return NextResponse.json({ error: "Vault file not found" }, { status: 404 });

        // 3. Decrypt the file on the server
        const encryptedText = await fileData.text();
        const secret = new fernet.Secret(doc.dek_ref);
        const token = new fernet.Token({ token: encryptedText, secret, ttl: 0 });
        const decryptedBase64 = token.decode();

        // Convert Base64 string to a raw Buffer
        const fileBuffer = Buffer.from(decryptedBase64, 'base64');

        // 4. Send the raw bytes back to the browser viewer
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Cache-Control': 'no-store, max-age=0' // Prevent browser caching
            }
        });

    } catch (e) {
        console.error("Decrypt API Error:", e);
        return NextResponse.json({ error: "Failed to decrypt document" }, { status: 500 });
    }
}