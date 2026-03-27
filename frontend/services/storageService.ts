import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const uploadFile = async (file: File, roomId: string) => {
  // 1. Check file size (Limit: 10MB for "Fast" experience)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  // 2. Generate a random AES key for this file (E2EE)
  const fileKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // 2. Encrypt the file content
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    fileKey,
    fileBuffer
  );

  // 3. Export the fileKey to be shared in the chat message (encrypted with room key)
  const exportedKey = await window.crypto.subtle.exportKey('raw', fileKey);
  const keyBase64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(exportedKey))));

  // 4. Upload the encrypted blob to Supabase
  const fileName = `${roomId}/${Date.now()}-${file.name}.enc`;
  const { data, error } = await supabase.storage
    .from('room-files')
    .upload(fileName, encryptedBuffer);

  if (error) throw error;

  // 5. Get the public/signed URL
  const { data: { publicUrl } } = supabase.storage
    .from('room-files')
    .getPublicUrl(fileName);

  return { 
    url: publicUrl, 
    key: keyBase64, 
    iv: btoa(String.fromCharCode(...Array.from(iv))),
    fileName: file.name 
  };
};

export const downloadAndDecryptFile = async (url: string, keyBase64: string, ivBase64: string) => {
  const response = await fetch(url);
  const encryptedBuffer = await response.arrayBuffer();

  const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  const fileKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'AES-GCM',
    true,
    ['decrypt']
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    fileKey,
    encryptedBuffer
  );

  return URL.createObjectURL(new Blob([decryptedBuffer]));
};
