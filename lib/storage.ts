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

export async function uploadImageToS3(
  base64Data: string,
  fileName: string,
  folder: string = 'designs'
): Promise<string> {
  // Alternative S3 implementation
  // This would require aws-sdk to be installed
  const AWS = require('aws-sdk')
  
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  })

  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')
  const fileExt = fileName.split('.').pop() || 'png'
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: `image/${fileExt}`,
    ACL: 'public-read',
  }

  const result = await s3.upload(params).promise()
  return result.Location
}

