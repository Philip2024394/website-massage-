/**
 * Image generator — supports any provider (OpenAI, Stable Diffusion, Replicate, local).
 * Configure via IMAGE_API_URL and IMAGE_KEY (or provider-specific env).
 */

const DEFAULT_IMAGE_API_URL = process.env.IMAGE_API_URL || 'https://api.openai.com/v1/images/generations';

export interface GenerateImageOptions {
  /** Override API URL (e.g. proxy or different provider) */
  apiUrl?: string;
  /** Override API key */
  apiKey?: string;
  /** Optional size/style for provider */
  size?: string;
}

/**
 * Generate image from prompt. Returns URL of the generated image.
 * Uses IMAGE_API_URL and IMAGE_KEY (or IMAGE_KEY / OPENAI_API_KEY) from env.
 * Throws on failure so caller can fallback (e.g. stock image or skip).
 */
export async function generateImage(
  prompt: string,
  options: GenerateImageOptions = {}
): Promise<string> {
  const apiUrl = options.apiUrl || process.env.IMAGE_API_URL || DEFAULT_IMAGE_API_URL;
  const apiKey = options.apiKey || process.env.IMAGE_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('IMAGE_KEY or OPENAI_API_KEY is required for image generation');
  }

  // Generic POST body; adapt to your provider (OpenAI expects model, n, size, response_format, etc.)
  const body = buildRequestBody(prompt, apiUrl, options);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image API error ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  return extractImageUrl(data, apiUrl);
}

/** Build provider-specific request body; default shape for OpenAI-style APIs */
function buildRequestBody(
  prompt: string,
  apiUrl: string,
  options: GenerateImageOptions
): Record<string, unknown> {
  if (apiUrl.includes('openai.com')) {
    return {
      model: process.env.IMAGE_MODEL || 'dall-e-3',
      prompt,
      n: 1,
      size: options.size || process.env.IMAGE_SIZE || '1024x1024',
      response_format: 'url',
      quality: 'standard',
    };
  }
  // Generic shape for Replicate / Stable Diffusion / custom proxy
  return {
    prompt,
    ...(options.size && { size: options.size }),
  };
}

/** Extract image URL from provider response */
function extractImageUrl(data: Record<string, unknown>, apiUrl: string): string {
  // OpenAI: data.data[0].url
  const dataArr = data.data as unknown[] | undefined;
  if (Array.isArray(dataArr) && dataArr[0]) {
    const first = dataArr[0] as Record<string, unknown>;
    if (typeof first.url === 'string') return first.url;
  }
  // Some APIs return { url } at top level
  if (typeof data.url === 'string') return data.url;
  // Replicate-style: output as string or array
  const output = data.output;
  if (typeof output === 'string') return output;
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0];

  throw new Error('Image API response did not contain a URL');
}
