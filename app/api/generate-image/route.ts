import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { uploadImage } from '@/lib/storage'
import { GoogleGenerativeAI } from '@google/generative-ai'

const generateImageSchema = z.object({
  shop: z.string(),
  prompt: z.string().min(1, 'Prompt is required'),
  style: z.string().optional(),
  negativePrompt: z.string().optional(),
})

// Google Gemini API integration for image generation
async function generateImageWithGemini(prompt: string, style?: string, negativePrompt?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your environment variables.')
  }

  try {
    // Note: Gemini Pro Vision can generate images, but for image generation specifically,
    // you might want to use Imagen API or combine with other services
    // For now, we'll use Gemini to enhance the prompt and then use Imagen if available
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Enhanced prompt with style
    let enhancedPrompt = prompt
    if (style) {
      enhancedPrompt = `${prompt}, ${style} style`
    }
    
    // Use Gemini to generate image description or use Imagen API
    // Since Gemini doesn't directly generate images, we'll use it for prompt enhancement
    // and then use a compatible image generation service
    
    // For direct image generation, use Google's Imagen API or another service
    // Here's an example using a text-to-image approach with Gemini's capabilities
    
    // Alternative: Use Replicate or Stability AI with Gemini-enhanced prompts
    // Or use Google's Imagen API if you have access
    
    // For now, let's use a combination approach:
    // 1. Enhance prompt with Gemini
    // 2. Use Imagen or another image generation service
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    // Create a detailed image generation prompt
    const imagePrompt = `Generate a detailed, high-quality image description for: ${enhancedPrompt}. 
    ${negativePrompt ? `Avoid: ${negativePrompt}` : ''}
    The description should be vivid and detailed, suitable for image generation.`
    
    const result = await model.generateContent(imagePrompt)
    const response = await result.response
    const enhancedDescription = response.text()
    
    // Now use the enhanced description with an image generation service
    // For Google Imagen (if available):
    if (process.env.USE_IMAGEN === 'true' && process.env.GOOGLE_CLOUD_PROJECT) {
      return await generateWithImagen(enhancedDescription || enhancedPrompt)
    }
    
    // Fallback: Use Stability AI or Replicate with Gemini-enhanced prompt
    return await generateWithStabilityAI(enhancedDescription || enhancedPrompt)
    
  } catch (error: any) {
    console.error('Gemini API error:', error)
    throw new Error(`Failed to generate image with Gemini: ${error.message}`)
  }
}

// Generate with Google Imagen API
async function generateWithImagen(prompt: string): Promise<string> {
  // This requires Google Cloud setup and Imagen API access
  // For now, we'll use a fallback
  throw new Error('Imagen API not configured. Using fallback service.')
}

// Fallback: Generate with Stability AI (or you can use Replicate)
async function generateWithStabilityAI(prompt: string): Promise<string> {
  const stabilityApiKey = process.env.STABILITY_API_KEY
  
  if (!stabilityApiKey) {
    // If no Stability AI key, try using Gemini with a different approach
    // or throw a helpful error
    throw new Error('No image generation service configured. Please set STABILITY_API_KEY or configure Imagen API.')
  }

  try {
    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stabilityApiKey}`,
          'Accept': 'image/*',
        },
        body: JSON.stringify({
          prompt: prompt,
          output_format: 'png',
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Stability AI error: ${errorText}`)
    }

    // Stability AI returns the image directly
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    // Convert to data URL for upload
    return `data:image/png;base64,${base64}`
  } catch (error: any) {
    console.error('Stability AI error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = generateImageSchema.parse(body)

    // Generate image with Gemini API
    const imageDataUrl = await generateImageWithGemini(
      validated.prompt,
      validated.style,
      validated.negativePrompt
    )

    // Upload to storage
    const uploadedUrl = await uploadImage(
      imageDataUrl,
      `ai-generated-${Date.now()}.png`,
      'ai-generated'
    )

    return NextResponse.json({
      success: true,
      imageUrl: uploadedUrl,
    })
  } catch (error: any) {
    console.error('Generate image error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error.message,
        note: 'Please ensure GEMINI_API_KEY is set in environment variables. Optionally set STABILITY_API_KEY for image generation.'
      },
      { status: 500 }
    )
  }
}

