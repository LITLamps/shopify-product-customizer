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
  // Note: This requires @aws-sdk/client-s3 to be installed
  // Install with: npm install @aws-sdk/client-s3
  // 
  // For now, this function is disabled to avoid build errors
  // Uncomment and install the package if you want to use S3 instead of Supabase
  throw new Error(
    'S3 upload is not configured. Please install @aws-sdk/client-s3 and configure AWS credentials, ' +
    'or use Supabase storage by setting NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  )
  
  /* Uncomment when using S3:
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')
  const fileExt = fileName.split('.').pop() || 'png'
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: `image/${fileExt}`,
    ACL: 'public-read',
  })

  await s3Client.send(command)
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
  */
}

