# AI Image Generator Theme Extension

This Shopify theme extension allows merchants to add an AI image generator section to any Shopify theme.

## Installation

1. Deploy your app to Vercel or your hosting platform
2. In Shopify Partner Dashboard, go to your app
3. Navigate to "Extensions" → "Theme extensions"
4. The extension should appear automatically after deployment

## Adding to Theme

1. Go to Shopify Admin → Online Store → Themes
2. Click "Customize" on your active theme
3. Click "Add section" → "App embeds"
4. Select "AI Image Generator"
5. Configure the section settings:
   - Section Title
   - Description
   - Enable/disable image upload
   - Enable/disable AI generation
6. Save your changes

## Configuration

The extension requires the following environment variables:
- `SHOPIFY_APP_URL` - Your app's URL (e.g., https://your-app.vercel.app)
- AI Image Generation API key (OpenAI, Stability AI, etc.)

## AI Image Generation Setup

To enable AI image generation, you need to configure an AI service in `/app/api/generate-image/route.ts`:

### Option 1: OpenAI DALL-E
```typescript
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
  }),
})
```

### Option 2: Stability AI
```typescript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text_prompts: [{ text: prompt }],
  }),
})
```

## Features

- Image upload functionality
- AI-powered image generation
- Preview before adding to cart
- Seamless integration with Shopify themes
- Customizable section settings

