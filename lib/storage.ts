import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export async function uploadImage(
  base64Data: string,
  fileName: string,
  folder: string = 'designs'
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  // Convert base64 to buffer
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')
  const fileExt = fileName.split('.').pop() || 'png'
  const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('customizer')
    .upload(filePath, buffer, {
      contentType: `image/${fileExt}`,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('customizer').getPublicUrl(filePath)

  return urlData.publicUrl
}

// S3 upload function removed - not used and caused build issues
// To implement S3 upload in the future:
// 1. Install: npm install @aws-sdk/client-s3
// 2. Create a new function using the modern AWS SDK v3
// Example implementation (save to a separate file when needed):
//
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
//
// export async function uploadImageToS3(...) {
//   const s3Client = new S3Client({
//     region: process.env.AWS_REGION || 'us-east-1',
//     credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//     },
//   })
//   // ... rest of implementation
// }

