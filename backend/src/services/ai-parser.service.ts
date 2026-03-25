import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import fs from 'fs';

interface ParsedItem {
  productName: string;
  quantity: number;
  unit: string;
  brand?: string;
  modelNumber?: string;
  notes?: string;
  confidence: number;
}

interface ParsedSlip {
  items: ParsedItem[];
  totalItems: number;
  warnings: string[];
  needsConfirmation: boolean;
  detectedLocation?: string;
}

interface BrandSuggestion {
  name: string;
  segment: 'premium' | 'quality' | 'budget';
  reason: string;
}

// Initialize Anthropic Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const PARSE_SYSTEM_PROMPT = `You are an expert at analyzing electrical products, contractor slips, and construction material lists for an Indian construction materials platform (Hub4Estate).

You understand:
- Indian electrical brands: Havells, Polycab, Legrand, Anchor, Finolex, KEI, V-Guard, Crompton, Philips, Syska, RR Kabel, Schneider, Siemens, ABB, L&T, GM Modular, Eveready, Wipro, Orient, Bajaj, Oreva
- Indian electrical products: wires, cables, MCBs, switches, sockets, fans, LED bulbs, conduits, DB boxes, earthing equipment, etc.
- Indian units and measurements

CRITICAL INSTRUCTIONS:
1. If the image is a SINGLE PRODUCT PHOTO (box/packaging): combine ALL text into ONE product entry
2. If the image is a MULTI-ITEM LIST: create one entry per line/item
3. Never split brand + product name + specs into separate items
4. Default quantity = 1 piece if not specified

Return ONLY valid JSON, no markdown:
{
  "items": [
    {
      "productName": "specific product name",
      "quantity": number,
      "unit": "meters/pieces/kg/etc",
      "brand": "brand name or null",
      "modelNumber": "model if found or null",
      "notes": "extra details or null",
      "confidence": number 0-1
    }
  ],
  "warnings": ["any issues"],
  "needsConfirmation": boolean,
  "detectedLocation": "city name if found or null"
}`;

/**
 * Analyze image directly with Claude Vision API
 * Much more accurate than OCR → text → Claude
 */
export async function analyzeImageWithClaudeVision(imagePath: string): Promise<ParsedSlip> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, using simple parser');
    const { parseSlipImage } = await import('./ocr.service');
    const text = await parseSlipImage(imagePath);
    return simpleTextParser(text);
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Detect image media type
    const ext = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
    const mediaTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const mediaType = mediaTypeMap[ext] || 'image/jpeg';

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: PARSE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as any,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Analyze this image and extract all products. Return JSON only.',
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return parseClaudeResponse(responseText);
  } catch (error: any) {
    console.error('Claude Vision error:', error.message);
    // Fall back to OCR + text parsing
    const { parseSlipImage } = await import('./ocr.service');
    const text = await parseSlipImage(imagePath);
    return parseProductsWithAI(text);
  }
}

/**
 * Parse extracted text using Claude AI
 */
export async function parseProductsWithAI(extractedText: string): Promise<ParsedSlip> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, using simple parser');
    return simpleTextParser(extractedText);
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: PARSE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Parse this text extracted from a contractor slip or product image. Return JSON only.\n\nTEXT:\n${extractedText}`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return parseClaudeResponse(responseText);
  } catch (error) {
    console.error('Claude AI parsing error:', error);
    return simpleTextParser(extractedText);
  }
}

/**
 * Get top 5 brand suggestions for a product when brand is unknown
 */
export async function getBrandSuggestions(productName: string): Promise<BrandSuggestion[]> {
  // Static brand database for common product categories (works without API key)
  const brandDatabase: Record<string, BrandSuggestion[]> = {
    wire: [
      { name: 'Polycab', segment: 'premium', reason: 'Largest wire manufacturer in India, excellent quality & compliance' },
      { name: 'Havells', segment: 'premium', reason: 'Premium brand, trusted for safety and durability' },
      { name: 'Finolex', segment: 'quality', reason: 'ISI certified, very good quality at fair price' },
      { name: 'KEI Industries', segment: 'quality', reason: 'Good quality, widely available' },
      { name: 'RR Kabel', segment: 'budget', reason: 'Affordable, decent quality for budget builds' },
    ],
    cable: [
      { name: 'Polycab', segment: 'premium', reason: 'Top rated cable brand in India' },
      { name: 'Havells', segment: 'premium', reason: 'Premium quality power cables' },
      { name: 'KEI Industries', segment: 'quality', reason: 'Industrial grade quality' },
      { name: 'Finolex', segment: 'quality', reason: 'Reliable, ISI certified' },
      { name: 'RR Kabel', segment: 'budget', reason: 'Budget friendly option' },
    ],
    mcb: [
      { name: 'Legrand', segment: 'premium', reason: 'French brand, highest quality MCBs in market' },
      { name: 'Schneider Electric', segment: 'premium', reason: 'Global leader in electrical protection' },
      { name: 'Havells', segment: 'quality', reason: 'ISI certified, excellent value for money' },
      { name: 'Siemens', segment: 'quality', reason: 'German engineering, very reliable' },
      { name: 'Anchor', segment: 'budget', reason: 'Affordable, Panasonic-backed brand' },
    ],
    switch: [
      { name: 'Legrand', segment: 'premium', reason: 'Premium European switches, designer range' },
      { name: 'Havells', segment: 'premium', reason: 'Wide range, premium finish' },
      { name: 'Schneider Electric', segment: 'quality', reason: 'Good quality, extensive range' },
      { name: 'GM Modular', segment: 'quality', reason: 'Popular mid-range choice' },
      { name: 'Anchor', segment: 'budget', reason: 'Best selling budget switches in India' },
    ],
    fan: [
      { name: 'Atomberg', segment: 'premium', reason: 'BLDC technology, energy efficient, smart features' },
      { name: 'Havells', segment: 'premium', reason: 'Premium ceiling fans, great aesthetics' },
      { name: 'Crompton', segment: 'quality', reason: 'Energy star rated, reliable motors' },
      { name: 'Orient Electric', segment: 'quality', reason: 'Good value, energy efficient models' },
      { name: 'Usha', segment: 'budget', reason: 'Affordable, widely available' },
    ],
    'led bulb': [
      { name: 'Philips', segment: 'premium', reason: 'Global brand, longest lifespan, best color rendering' },
      { name: 'Havells', segment: 'premium', reason: 'Premium quality, good warranty' },
      { name: 'Wipro Lighting', segment: 'quality', reason: 'Good quality, reliable brand' },
      { name: 'Syska', segment: 'quality', reason: 'Popular, good brightness-to-price ratio' },
      { name: 'Eveready', segment: 'budget', reason: 'Affordable, decent performance' },
    ],
    conduit: [
      { name: 'Polycab', segment: 'premium', reason: 'Heavy duty PVC conduits, ISI certified' },
      { name: 'Havells', segment: 'quality', reason: 'Good quality conduits and accessories' },
      { name: 'Anchor', segment: 'quality', reason: 'Widely used, good quality' },
      { name: 'Astral', segment: 'quality', reason: 'Good quality PVC products' },
      { name: 'Supreme', segment: 'budget', reason: 'Affordable pipes and conduits' },
    ],
  };

  // Find matching category
  const lowerProduct = productName.toLowerCase();
  let suggestions: BrandSuggestion[] = [];

  for (const [keyword, brands] of Object.entries(brandDatabase)) {
    if (lowerProduct.includes(keyword)) {
      suggestions = brands;
      break;
    }
  }

  // If no specific match, use AI if available
  if (suggestions.length === 0 && process.env.ANTHROPIC_API_KEY) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: `For the electrical product "${productName}" used in Indian construction, suggest exactly 5 brands across these segments:
- 1-2 premium/luxury brands (best quality, higher price)
- 1-2 best quality for money brands (good quality, fair price)
- 1 budget brands (lowest price, basic quality)

Return JSON only:
[
  {"name": "Brand Name", "segment": "premium|quality|budget", "reason": "one line reason"}
]`,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '[]';
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
      }
      suggestions = JSON.parse(jsonText);
    } catch (error) {
      console.error('Brand suggestions AI error:', error);
    }
  }

  // Ultimate fallback
  if (suggestions.length === 0) {
    suggestions = [
      { name: 'Havells', segment: 'premium', reason: 'Premium Indian brand, excellent quality' },
      { name: 'Polycab', segment: 'premium', reason: 'Leading manufacturer, ISI certified' },
      { name: 'Legrand', segment: 'quality', reason: 'Good quality, widely trusted' },
      { name: 'Anchor', segment: 'quality', reason: 'Reliable, good value for money' },
      { name: 'Finolex', segment: 'budget', reason: 'Affordable, ISI certified' },
    ];
  }

  return suggestions.slice(0, 5);
}

/**
 * Use Google Cloud Vision API for OCR + web detection
 */
export async function analyzeImageWithGoogle(imagePath: string): Promise<{
  text: string;
  labels: string[];
  webDetection: any;
}> {
  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    throw new Error('GOOGLE_CLOUD_API_KEY not configured');
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: 'TEXT_DETECTION' },
            { type: 'LABEL_DETECTION' },
            { type: 'WEB_DETECTION' },
          ],
        },
      ],
    }
  );

  const result = response.data.responses[0];
  return {
    text: result.textAnnotations?.[0]?.description || '',
    labels: result.labelAnnotations?.map((l: any) => l.description) || [],
    webDetection: result.webDetection || {},
  };
}

/**
 * Enhanced parsing using both Google Vision and Claude AI
 */
export async function enhancedImageParsing(imagePath: string): Promise<ParsedSlip> {
  try {
    const googleResults = await analyzeImageWithGoogle(imagePath);
    return await parseProductsWithAI(googleResults.text);
  } catch (error) {
    console.error('Enhanced parsing error:', error);
    // Fall back to Claude Vision
    return analyzeImageWithClaudeVision(imagePath);
  }
}

function parseClaudeResponse(responseText: string): ParsedSlip {
  let jsonText = responseText.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const parsed: ParsedSlip = JSON.parse(jsonText);
  parsed.totalItems = parsed.items.length;

  parsed.items = parsed.items.map((item) => ({
    ...item,
    productName: item.productName.trim(),
    quantity: Math.max(1, item.quantity),
    unit: item.unit.trim(),
    brand: item.brand?.trim() || undefined,
    modelNumber: item.modelNumber?.trim() || undefined,
    notes: item.notes?.trim() || undefined,
    confidence: Math.min(1, Math.max(0, item.confidence)),
  }));

  if (parsed.items.length === 0) {
    parsed.warnings = parsed.warnings || [];
    parsed.warnings.push('No products could be identified. Please try a clearer image or enter manually.');
  }

  return parsed;
}

/**
 * Simple fallback parser when AI is not available
 */
function simpleTextParser(text: string): ParsedSlip {
  const items: ParsedItem[] = [];
  const warnings: string[] = [];
  const lines = text.split('\n').filter((line) => line.trim().length > 3);

  const quantityPatterns = [
    /(\d+(?:\.\d+)?)\s*(m|meter|metre|meters|metres|mtr)/i,
    /(\d+(?:\.\d+)?)\s*(pc|pcs|piece|pieces|nos|no)/i,
    /(\d+(?:\.\d+)?)\s*(kg|kilogram|kilograms)/i,
    /(\d+(?:\.\d+)?)\s*(ft|feet|foot)/i,
    /(\d+(?:\.\d+)?)\s*(roll|rolls|coil|coils)/i,
    /(\d+(?:\.\d+)?)\s*(box|boxes|packet|packets)/i,
  ];

  const brands = ['Havells', 'Polycab', 'Legrand', 'Anchor', 'Finolex', 'KEI', 'V-Guard', 'Crompton', 'Philips', 'Syska', 'RR Kabel', 'Schneider', 'Siemens', 'ABB'];
  const skipWords = ['and', 'the', 'of', 'for', 'to', 'in', 'at', 'by', 'from'];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (skipWords.some((word) => lowerLine === word)) continue;

    let quantity = 1;
    let unit = 'pieces';
    let productName = line.trim();
    let brand: string | undefined;
    let foundQuantity = false;

    for (const pattern of quantityPatterns) {
      const match = line.match(pattern);
      if (match) {
        quantity = parseFloat(match[1]);
        unit = match[2].toLowerCase();
        foundQuantity = true;
        productName = line.replace(match[0], '').trim();
        break;
      }
    }

    for (const brandName of brands) {
      if (line.toLowerCase().includes(brandName.toLowerCase())) {
        brand = brandName;
        break;
      }
    }

    productName = productName.replace(/[^\w\s.-]/g, ' ').trim();
    if (productName.length < 2) continue;

    items.push({ productName, quantity, unit, brand, confidence: foundQuantity ? 0.5 : 0.3 });
  }

  if (items.length === 0) {
    warnings.push('Could not extract any items. Please add your ANTHROPIC_API_KEY for AI-powered scanning.');
  } else {
    warnings.push('Using basic parser — set ANTHROPIC_API_KEY in backend/.env for much better results.');
  }

  return { items, totalItems: items.length, warnings, needsConfirmation: true };
}
