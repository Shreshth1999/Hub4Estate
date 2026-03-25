import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import prisma from '../config/database';

let anthropicClient: Anthropic | null = null;

if (env.ANTHROPIC_API_KEY) {
  anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

// ============================================
// SYSTEM PROMPT — Full Hub4Estate Knowledge
// ============================================

const HUB4ESTATE_SYSTEM_PROMPT = `You are Spark — the official AI Assistant for Hub4Estate, India's B2B+B2C electrical products marketplace. You are smart, friendly, and helpful.

## LANGUAGE
Always respond in the SAME LANGUAGE the user writes in. If they write in Hindi, respond in Hindi. If they mix Hindi-English (Hinglish), match their style. Support all Indian languages.

## WHO HUB4ESTATE IS FOR
Hub4Estate is for ANYONE who wants to buy electrical products at the best price — normal everyday people, families, students, anyone — NOT just contractors or builders. Zero middlemen, full transparency, verified dealers.

## ABOUT THE PLATFORM
Hub4Estate connects buyers directly with 500+ verified electrical dealers across 50+ cities in India. Buyers save 15–25% compared to retail MRP by getting quotes from multiple dealers simultaneously.

## FOUNDER — SHRESHTH AGARWAL
- Age: 18 years old (born 12 April 2007)
- Education: Mesa School of Business (Business Management, 2025–2029) + NMIMS BBA Marketing
- Email: shreshth.agarwal@hub4estate.com
- Phone: +91 7690001999
- Company incorporated: HUB4ESTATE LLP, 17 March 2026, LLPIN: ACW-4269
- Location: Sri Ganganagar, Rajasthan
- Background: Father in real estate → constant broker calls → no filtering → "why 50 calls for 1 useful deal?" → pivot → electrical procurement → same product quoted ₹1.05L then sourced at ₹66K → "it's not a communication problem, it's an access problem"
- Made ₹87L through stock market trading (hedging) while in school
- Started dropshipping in Class 9 (selling bottles to UAE/Dubai) — bought own iPhone + MacBook
- Ran Treva Iconic Jewels (jewelry brand) for 1 year
- Met Nithin Kamath (Zerodha), Ronnie Screwvala, Naveen Tewari, Shradha Sharma, Ritesh Agarwal (OYO) personally
- 10 active clients served manually, real deals closed
- Currently at Mesa School of Business + NMIMS distance

## REAL VALIDATED DEALS (proof it works)
1. Sony LED panels ×2: MRP ₹129 each → nearest dealer ₹280 for both → Hub4Estate ₹76/each with delivery
2. Sony Tower Speaker + 2 mics: MRP ₹1,15,000 → Croma ₹1,05,000 → Hub4Estate ₹68,000 (tracked 8 dealers)
3. Philips 15W LED panels ×200: dealer ₹585/piece → Hub4Estate ₹465/piece with shipping = ₹24,000 saved
4. FRLS 2.5mm² cable: 6 dealers quoted ₹83–₹127/m → buyer saved ₹8,800 on 200m order

## CONTACT INFORMATION
- General: hello@hub4estate.com
- Dealer partnerships: dealers@hub4estate.com
- Founder direct: shreshth.agarwal@hub4estate.com
- Phone: +91 7690001999
- Website: hub4estate.com

## PRODUCT CATEGORIES
1. Wires & Cables — house wiring, power cables, FRLS, armoured (Havells, Polycab, Finolex, KEI, RR Kabel)
2. Switches & Sockets — modular switches, dimmers, USB outlets (Legrand, Schneider, Anchor, GM Modular, Goldmedal)
3. MCBs & Distribution — circuit breakers, DB boards, RCCBs, ELCBs (Siemens, ABB, L&T, Havells)
4. Fans & Ventilation — ceiling fans, exhaust fans, BLDC fans (Crompton, Havells, Orient, Atomberg)
5. Lighting — LED panels, downlights, bulbs, strip lights (Philips, Wipro Lighting, Syska, Halonix)
6. Conduits & Accessories — PVC conduits, junction boxes, gang boxes, saddles
7. Earthing & Protection — earthing electrodes, surge protectors, lightning arresters
8. Water Heaters — geysers, instant heaters, storage (Bajaj, Havells, AO Smith, V-Guard)
9. Smart Home — smart switches, automation, voice-controlled devices
10. Solar Products — panels, inverters, charge controllers
11. UPS & Inverters — home UPS, batteries, stabilizers (Luminous, Microtek, Exide)
12. Industrial Electrical — heavy-duty equipment, motors, control panels
13. Tools & Testing — multimeters, clamp meters, testers

## TOP BRANDS WE WORK WITH
Havells, Polycab, Finolex, Legrand, Schneider Electric, Siemens, ABB, Crompton, Philips, Wipro Lighting, Syska, Orient, L&T Electricals, KEI Industries, RR Kabel, Anchor (Panasonic), GM Modular, Goldmedal, Hager, Luminous, V-Guard, Bajaj Electricals, Sterlite Power

## HOW THE PLATFORM WORKS
1. User comes to hub4estate.com
2. Submits a product inquiry (model number, photo, or description + phone + city)
3. Hub4Estate admin identifies the product and finds verified dealers
4. Dealers submit quotes within 24–48 hours
5. User gets the best price with delivery

## PRODUCT INQUIRY PROCESS (what you can do!)
If a user wants to find a product, get a price, or buy something:
- Ask for: their name, 10-digit phone number, product name/model, quantity, and delivery city
- Then use the submit_inquiry tool to submit it
- They'll get a callback within 24 hours with the best price

## PRODUCT COMPARISON (what you can do!)
If a user asks to compare products or brands, use the compare_products tool or answer from your knowledge about Indian electrical products.

## TECHNICAL WIRING STANDARDS (Indian / BIS Standards)
- Lighting circuits: 1.0 sq mm copper wire, 6A MCB
- Power sockets (5A): 1.5 sq mm copper wire
- Power sockets (15A): 2.5 sq mm copper wire
- Air Conditioners (1.5 ton): 4.0 sq mm copper wire, 20–25A MCB (dedicated circuit)
- Geysers: 4.0 sq mm copper wire, 20A MCB (dedicated circuit)
- Main supply (2–3 BHK): 6.0–10.0 sq mm based on total load
- Always use ISI-marked BIS-certified products
- RCCB mandatory for shock protection
- Earthing is mandatory by Indian Electricity Rules

## SAFETY ADVICE
- Always use ISI-marked products
- RCCB is non-negotiable for safety
- Use copper wires ONLY for house wiring (never aluminium inside homes)
- Hire licensed electricians for installation
- Regular inspection of electrical systems every 5 years

## YOUR CAPABILITIES (be transparent about what you can do)
1. Answer questions about products, brands, specifications
2. Give technical wiring advice
3. Submit product inquiries on the user's behalf (collects info → submits)
4. Compare products and brands
5. Explain Hub4Estate's process
6. Share information about Shreshth and the company
7. Help users understand savings potential
8. Guide dealers on how to join

## BEHAVIOR RULES
- Be warm, helpful, and conversational — not robotic
- Match the user's language and formality level
- For product inquiries: collect all required info BEFORE submitting (don't submit with missing data)
- Required for inquiry: name, phone (10 digits), product description, delivery city
- If asked about pricing: explain the RFQ process, share real deals as examples
- Never make up prices — always direct to submit an inquiry for real quotes
- If you're unsure: say so and suggest contacting hello@hub4estate.com or +91 7690001999
- Shreshth is approachable — suggest contacting him directly for serious business queries`;

// ============================================
// TOOL DEFINITIONS
// ============================================

const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'submit_inquiry',
    description: 'Submit a product inquiry on behalf of the user. Use this when the user wants to find a product, get a quote, or buy something. Collect all required information first before calling this tool.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: "Customer's full name" },
        phone: { type: 'string', description: "10-digit mobile number (required)" },
        email: { type: 'string', description: "Email address (optional)" },
        modelNumber: { type: 'string', description: "Product model number, name, or description" },
        quantity: { type: 'number', description: "Quantity needed (default 1)" },
        deliveryCity: { type: 'string', description: "City for delivery" },
        notes: { type: 'string', description: "Any additional requirements or notes" },
      },
      required: ['name', 'phone', 'modelNumber', 'deliveryCity'],
    },
  },
  {
    name: 'search_products',
    description: 'Search for products in the Hub4Estate catalog by name, brand, or category.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (product name, model, or category)' },
        brand: { type: 'string', description: 'Filter by brand name (optional)' },
        category: { type: 'string', description: 'Filter by category (optional)' },
        limit: { type: 'number', description: 'Max results (default 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'compare_products',
    description: 'Compare two or more products or brands in terms of price, quality, specifications, and best use cases.',
    input_schema: {
      type: 'object' as const,
      properties: {
        items: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of product names, model numbers, or brand names to compare',
        },
        aspect: {
          type: 'string',
          description: 'What to compare: price, quality, specifications, use-case, or all (default: all)',
        },
      },
      required: ['items'],
    },
  },
];

// ============================================
// TOOL EXECUTORS
// ============================================

async function executeSubmitInquiry(input: any): Promise<string> {
  try {
    const count = await prisma.productInquiry.count();
    const seq = String(count + 1).padStart(4, '0');
    const tag = (input.modelNumber || 'REQ').toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 20);
    const inquiryNumber = `HUB-${tag}-${seq}`;

    const inquiry = await prisma.productInquiry.create({
      data: {
        inquiryNumber,
        name: input.name,
        phone: String(input.phone),
        email: input.email || null,
        modelNumber: input.modelNumber || null,
        quantity: input.quantity || 1,
        deliveryCity: input.deliveryCity,
        notes: input.notes || null,
      },
    });

    return JSON.stringify({
      success: true,
      inquiryNumber: inquiry.inquiryNumber,
      message: `Inquiry submitted! Your inquiry number is ${inquiry.inquiryNumber}. You will receive a call within 24 hours with the best price.`,
    });
  } catch (error: any) {
    return JSON.stringify({ success: false, error: error.message });
  }
}

async function executeSearchProducts(input: any): Promise<string> {
  try {
    const results = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: input.query, mode: 'insensitive' } },
          { modelNumber: { contains: input.query, mode: 'insensitive' } },
          ...(input.brand ? [{ brand: { name: { contains: input.brand, mode: 'insensitive' as const } } }] : []),
        ],
      },
      include: {
        brand: { select: { name: true } },
        productType: {
          include: {
            subCategory: { include: { category: { select: { name: true } } } },
          },
        },
      },
      take: input.limit || 5,
    });

    if (results.length === 0) {
      return JSON.stringify({ found: 0, message: 'No products found in catalog. User can submit an inquiry and we will source it.' });
    }

    const formatted = results.map(p => ({
      name: p.name,
      brand: p.brand.name,
      model: p.modelNumber,
      category: p.productType.subCategory.category.name,
      specifications: p.specifications,
    }));

    return JSON.stringify({ found: results.length, products: formatted });
  } catch (error: any) {
    return JSON.stringify({ found: 0, error: error.message });
  }
}

async function executeCompareProducts(input: any): Promise<string> {
  // We return structured data back to Claude to generate a comparison
  return JSON.stringify({
    items: input.items,
    aspect: input.aspect || 'all',
    instruction: 'Use your knowledge of Indian electrical products and brands to provide a detailed comparison. Include price range in INR, quality rating, best use case, and recommendation.',
  });
}

async function executeTool(name: string, input: any): Promise<string> {
  switch (name) {
    case 'submit_inquiry': return executeSubmitInquiry(input);
    case 'search_products': return executeSearchProducts(input);
    case 'compare_products': return executeCompareProducts(input);
    default: return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ============================================
// AI CHAT WITH TOOL USE
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatToolResult {
  tool: string;
  result: any;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  _sessionId?: string,
  userContext?: { name?: string; phone?: string; email?: string; city?: string }
): Promise<{ response: string; tokenCount?: number; toolResults?: ChatToolResult[] }> {
  if (!anthropicClient) {
    return {
      response: "I'm currently unavailable. Please contact us at hello@hub4estate.com or call +91 7690001999.",
    };
  }

  try {
    // Inject user context into system prompt if available
    let systemPrompt = HUB4ESTATE_SYSTEM_PROMPT;
    if (userContext?.name || userContext?.phone) {
      systemPrompt += `\n\n## LOGGED-IN USER CONTEXT\n`;
      if (userContext.name) systemPrompt += `- Name: ${userContext.name}\n`;
      if (userContext.phone) systemPrompt += `- Phone: ${userContext.phone}\n`;
      if (userContext.email) systemPrompt += `- Email: ${userContext.email}\n`;
      if (userContext.city) systemPrompt += `- City: ${userContext.city}\n`;
      systemPrompt += `\nYou already have their name${userContext.phone ? ', phone' : ''}${userContext.city ? ', and city' : ''}. When submitting an inquiry, use these details — only ask for missing info.`;
    }

    const formattedMessages: Anthropic.MessageParam[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const toolResults: ChatToolResult[] = [];

    // Agentic loop — handle tool calls
    let iteration = 0;
    const MAX_ITERATIONS = 5;

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      const response = await anthropicClient.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        tools: CHAT_TOOLS,
        messages: formattedMessages,
      });

      // If done, return the text response
      if (response.stop_reason === 'end_turn') {
        const text = response.content
          .filter(b => b.type === 'text')
          .map(b => (b as Anthropic.TextBlock).text)
          .join('');
        return { response: text, tokenCount: response.usage?.output_tokens, toolResults };
      }

      // Handle tool use
      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[];

        // Add assistant message with tool use to history
        formattedMessages.push({ role: 'assistant', content: response.content });

        // Execute all tool calls
        const toolResultContent: Anthropic.ToolResultBlockParam[] = [];
        for (const toolUse of toolUseBlocks) {
          const result = await executeTool(toolUse.name, toolUse.input);
          const parsed = JSON.parse(result);
          toolResults.push({ tool: toolUse.name, result: parsed });
          toolResultContent.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: result,
          });
        }

        // Add tool results to history
        formattedMessages.push({ role: 'user', content: toolResultContent });
        continue;
      }

      // Unexpected stop — return what we have
      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('');
      return { response: text || "I encountered an issue. Please try again.", tokenCount: response.usage?.output_tokens, toolResults };
    }

    return { response: "I'm having trouble completing your request. Please try again.", toolResults };
  } catch (error: any) {
    console.error('Chat response error:', error);
    return {
      response: "I'm experiencing technical difficulties. Please try again or contact hello@hub4estate.com.",
    };
  }
}

// ============================================
// RFQ AI SUGGESTIONS (existing features)
// ============================================

interface RFQItem {
  productId: string;
  quantity: number;
}

interface AISuggestion {
  missingItems?: string[];
  quantityWarnings?: Array<{ productId: string; message: string }>;
  complementaryProducts?: string[];
  estimatedBudget?: { min: number; max: number };
  insights?: string[];
}

export async function getAISuggestions(data: {
  items: RFQItem[];
  city: string;
  urgency?: string;
}): Promise<AISuggestion> {
  if (!anthropicClient) return { insights: ['AI suggestions unavailable'] };

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map(i => i.productId) } },
      include: {
        brand: true,
        productType: { include: { subCategory: { include: { category: true } } } },
      },
    });

    const productContext = products.map(p => ({
      name: p.name,
      brand: p.brand.name,
      category: p.productType.subCategory.category.name,
      quantity: data.items.find(i => i.productId === p.id)?.quantity || 0,
    }));

    const prompt = `You are an expert in Indian home electrical procurement. Analyze this RFQ:
City: ${data.city}, Urgency: ${data.urgency || 'normal'}
Products: ${JSON.stringify(productContext, null, 2)}

Respond ONLY with valid JSON:
{"missingItems":[],"quantityWarnings":[],"complementaryProducts":[],"insights":[]}`;

    const msg = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: ['Analysis unavailable'] };
  } catch (error) {
    return { insights: ['AI analysis temporarily unavailable'] };
  }
}

export async function generateProductExplanation(productId: string): Promise<string> {
  if (!anthropicClient) return 'Product explanation unavailable';

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        productType: { include: { subCategory: { include: { category: true } } } },
      },
    });

    if (!product) return 'Product not found';

    const msg = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Explain this electrical product for Indian homeowners in 2-3 paragraphs. Simple language.
Product: ${product.name}, Brand: ${product.brand.name}, Category: ${product.productType.subCategory.category.name}
Specs: ${product.specifications || 'Not specified'}
Cover: what it is, where it's used, why brand matters, what to check before buying.`,
      }],
    });

    return msg.content[0].type === 'text' ? msg.content[0].text : 'Explanation unavailable';
  } catch {
    return 'Explanation temporarily unavailable';
  }
}

export async function analyzeDealerPerformance(dealerId: string): Promise<string> {
  if (!anthropicClient) return 'Analysis unavailable';

  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: {
        quotes: {
          select: { status: true, lossReason: true, rankPosition: true, totalAmount: true },
          orderBy: { submittedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!dealer) return 'Dealer not found';

    const avgRank = dealer.quotes.filter(q => q.rankPosition !== null).reduce((s, q) => s + (q.rankPosition || 0), 0) / (dealer.quotes.length || 1);

    const msg = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Analyze dealer performance. Quotes: ${dealer.totalQuotesSubmitted}, Conversions: ${dealer.totalConversions}, Rate: ${(dealer.conversionRate * 100).toFixed(1)}%, Avg rank: ${avgRank.toFixed(1)}. Loss reasons: ${JSON.stringify(dealer.quotes.filter(q => q.status === 'REJECTED').map(q => q.lossReason))}. Give 3–4 bullet points of actionable improvements.`,
      }],
    });

    return msg.content[0].type === 'text' ? msg.content[0].text : 'Analysis unavailable';
  } catch {
    return 'Analysis temporarily unavailable';
  }
}
