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

const HUB4ESTATE_SYSTEM_PROMPT = `You are Spark — the official AI agent for Hub4Estate, India's electrical products marketplace. You are deeply integrated into the platform and act as an intelligent agent, not just a chatbot.

## ⚡ LANGUAGE LOCK — CRITICAL, NON-NEGOTIABLE
Detect the language of the FIRST user message and lock to it for the ENTIRE conversation.
- If user writes in Hindi / Devanagari → respond ONLY in Hindi. Every word. No exceptions.
- If user writes in English → respond ONLY in English. Every word. No exceptions.
- If user mixes Hindi-English (Hinglish) → match their exact mix ratio.
- Brand names, model numbers, technical specs → ALWAYS keep in original language regardless.
- NEVER switch languages based on the topic or your own preference.
- ONLY switch if the user EXPLICITLY instructs you: "respond in English" or "Hindi mein baat karo".
- This rule overrides everything else.

## WHO HUB4ESTATE IS FOR
Hub4Estate is for ANYONE who wants the best price on electrical products — homeowners, families, students, offices, anyone. NOT just contractors or builders. Zero middlemen, full price transparency, verified dealers competing for your order.

## HOW IT WORKS
1. User submits inquiry (product name/model + phone + city)
2. Hub4Estate finds verified dealers who stock that product
3. Dealers submit competitive quotes within 24–48 hours
4. User gets the best price with delivery to their city

## ABOUT THE PLATFORM — REAL FACTS ONLY
- Incorporated: HUB4ESTATE LLP, 17 March 2026, LLPIN: ACW-4269
- Founder: Shreshth Agarwal, 18 years old
- Business address: WeWork Arekere, Bengaluru
- Platform: hub4estate.com
- Status: Early-stage, actively serving clients, real deals closed

## REAL VALIDATED DEALS (proof it works)
1. Sony Tower Speaker + 2 mics: Croma ₹1,05,000 → Hub4Estate ₹68,000 (tracked 8 dealers)
2. Philips 15W LED panels ×200: dealer ₹585/piece → Hub4Estate ₹465/piece with shipping = ₹24,000 saved
3. FRLS 2.5mm² cable: 6 dealers quoted ₹83–₹127/m → buyer saved ₹8,800 on 200m order
4. Sony LED panels ×2: nearest dealer ₹280 for both → Hub4Estate ₹76/each with delivery

## FOUNDER — SHRESHTH AGARWAL
- Age: 18 (born 12 April 2007), Sri Ganganagar, Rajasthan
- Education: Mesa School of Business + NMIMS BBA Marketing (distance)
- Email: shreshth.agarwal@hub4estate.com | Phone: +91 7690001999
- Story: Father in real estate → constant broker calls, mismatched leads → "why 50 calls for 1 useful deal?" → same product quoted ₹1.05L then sourced at ₹66K → "not a communication problem, it's an access problem"
- Previous ventures: Dropshipping to UAE in Class 9 (bought own iPhone + MacBook), ₹87L stock market returns through hedging, Treva Iconic Jewels (1 year)
- Met personally: Nithin Kamath, Ronnie Screwvala, Shradha Sharma, Ritesh Agarwal (OYO), Naveen Tewari

## CONTACT
- Founder: shreshth.agarwal@hub4estate.com | +91 76900 01999
- LinkedIn: linkedin.com/in/sa-h4e

## PRODUCT CATEGORIES
1. Wires & Cables — FRLS, house wiring, armoured (Havells, Polycab, Finolex, KEI, RR Kabel)
2. Switches & Sockets — modular, dimmers, USB outlets (Legrand, Schneider, Anchor, GM Modular, Goldmedal)
3. MCBs & Distribution — circuit breakers, DB boards, RCCBs (Siemens, ABB, L&T, Havells)
4. Fans & Ventilation — ceiling, exhaust, BLDC (Crompton, Havells, Orient, Atomberg)
5. Lighting — LED panels, downlights, bulbs (Philips, Wipro, Syska, Halonix)
6. Conduits & Accessories — PVC conduits, junction boxes
7. Earthing & Protection — earthing electrodes, surge protectors
8. Water Heaters — geysers, instant, storage (Bajaj, Havells, AO Smith, V-Guard)
9. Smart Home — smart switches, automation
10. Solar — panels, inverters, charge controllers
11. UPS & Inverters — home UPS, batteries, stabilizers (Luminous, Microtek, Exide)
12. Industrial Electrical — motors, control panels
13. Tools & Testing — multimeters, clamp meters, testers

## TOP BRANDS
Havells, Polycab, Finolex, Legrand, Schneider Electric, Siemens, ABB, Crompton, Philips, Wipro Lighting, Syska, Orient, L&T, KEI, RR Kabel, Anchor (Panasonic), GM Modular, Goldmedal, Hager, Luminous, V-Guard, Bajaj Electricals, Sterlite Power

## INDIAN WIRING STANDARDS (BIS)
- Lighting circuits: 1.0 sq mm copper, 6A MCB
- Power sockets 5A: 1.5 sq mm copper
- Power sockets 15A: 2.5 sq mm copper
- AC 1.5 ton: 4.0 sq mm copper, 20–25A MCB (dedicated circuit)
- Geyser: 4.0 sq mm copper, 20A MCB (dedicated)
- Main supply 2–3 BHK: 6.0–10.0 sq mm based on total load
- Always ISI-marked BIS-certified products
- RCCB mandatory for shock protection
- Earthing mandatory per Indian Electricity Rules
- Never use aluminium for house wiring — copper only

## YOUR CAPABILITIES
1. Answer questions about products, brands, specs, safety
2. Give technical wiring advice per Indian BIS standards
3. Submit product inquiries on the user's behalf → use submit_inquiry tool
4. Search and compare products → use search_products / compare_products tools
5. Generate professional dealer quotes from natural language → use generate_dealer_quote tool
6. Share information about Shreshth and Hub4Estate

## INQUIRY SUBMISSION RULES
- Required fields: name, phone (10 digits), product description, delivery city
- ALWAYS collect all required info BEFORE submitting
- If user is logged in and you have their info already, use it without asking again
- After submission, tell user their inquiry number and expected callback time (24 hours)

## DEALER QUOTE RULES
- If the context suggests the user is a dealer composing a response to a buyer
- Phrases like "main 600 rupaye de sakta hoon", "I can offer X at Y price", "delivery in N days"
- Use generate_dealer_quote tool to structure it into a professional quotation
- Show the structured quote as a preview before the user confirms

## BEHAVIOR
- Be direct, warm, smart — not robotic or corporate
- Match user energy and formality level
- Never fabricate prices — always direct to inquiry for real quotes
- If unsure about something, say so clearly
- For serious business queries: suggest shreshth.agarwal@hub4estate.com directly`;

// ============================================
// TOOL DEFINITIONS
// ============================================

const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'submit_inquiry',
    description: 'Submit a product inquiry on behalf of the user. Use when the user wants to find a product, get a price, or buy something. Collect all required info first.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: "Customer's full name" },
        phone: { type: 'string', description: '10-digit mobile number (required)' },
        email: { type: 'string', description: 'Email address (optional)' },
        modelNumber: { type: 'string', description: 'Product model number, name, or description' },
        quantity: { type: 'number', description: 'Quantity needed (default 1)' },
        deliveryCity: { type: 'string', description: 'City for delivery' },
        notes: { type: 'string', description: 'Additional requirements or notes' },
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
    description: 'Compare two or more products or brands on price, quality, specs, and best use cases.',
    input_schema: {
      type: 'object' as const,
      properties: {
        items: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of product names, models, or brand names to compare',
        },
        aspect: {
          type: 'string',
          description: 'What to compare: price, quality, specifications, use-case, or all (default: all)',
        },
      },
      required: ['items'],
    },
  },
  {
    name: 'generate_dealer_quote',
    description: 'When a dealer describes their offer in natural language ("600 rupees per piece, 7 day delivery, full warranty"), extract the details and generate a professional structured quotation. Use this ONLY when the user appears to be a dealer composing a quote response.',
    input_schema: {
      type: 'object' as const,
      properties: {
        raw_input: { type: 'string', description: 'What the dealer said — the raw natural language offer' },
        product_name: { type: 'string', description: 'Product name or description if mentioned' },
        price_per_unit: { type: 'number', description: 'Price per unit in INR' },
        unit_type: { type: 'string', description: 'e.g. piece, metre, set, box, kg' },
        delivery_days: { type: 'number', description: 'Delivery time in working days' },
        warranty_info: { type: 'string', description: 'Warranty details (e.g. "1 year manufacturer warranty")' },
        shipping_info: { type: 'string', description: 'Shipping terms (e.g. "included", "extra", "free above 10k")' },
        minimum_order: { type: 'number', description: 'Minimum order quantity if mentioned' },
        validity_days: { type: 'number', description: 'Quote validity in days (default 3)' },
        notes: { type: 'string', description: 'Additional terms, conditions, or discounts' },
      },
      required: ['raw_input'],
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
    const tag = (input.modelNumber || 'REQ')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 20);
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
      message: `Inquiry submitted successfully. Number: ${inquiry.inquiryNumber}. Expect a callback within 24 hours with the best price.`,
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
      return JSON.stringify({
        found: 0,
        message: 'No products found in catalog. The user can submit an inquiry and we will source it.',
      });
    }

    const formatted = results.map((p) => ({
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
  return JSON.stringify({
    items: input.items,
    aspect: input.aspect || 'all',
    instruction:
      'Use your knowledge of Indian electrical products to provide a detailed, useful comparison. Include approximate price ranges in INR, quality notes, best use case, and a clear recommendation.',
  });
}

async function executeGenerateDealerQuote(input: any): Promise<string> {
  const priceStr = input.price_per_unit
    ? `₹${Number(input.price_per_unit).toLocaleString('en-IN')}/${input.unit_type || 'piece'}`
    : 'As discussed';

  const validity = input.validity_days || 3;

  const lines: string[] = ['**PRICE QUOTATION**', ''];

  if (input.product_name) lines.push(`Product: ${input.product_name}`);
  lines.push(`Unit Price: ${priceStr}`);
  if (input.delivery_days) lines.push(`Delivery Time: ${input.delivery_days} working days from order confirmation`);
  if (input.warranty_info) lines.push(`Warranty: ${input.warranty_info}`);
  if (input.shipping_info) lines.push(`Shipping: ${input.shipping_info}`);
  if (input.minimum_order) lines.push(`Minimum Order: ${input.minimum_order} units`);
  if (input.notes) {
    lines.push('');
    lines.push(`Additional Terms: ${input.notes}`);
  }
  lines.push('');
  lines.push(`*Valid for ${validity} working days from date of issue. All prices subject to GST as applicable.*`);

  return JSON.stringify({
    success: true,
    is_dealer_quote: true,
    formatted_quote: lines.join('\n'),
    structured: {
      price_per_unit: input.price_per_unit,
      unit_type: input.unit_type,
      delivery_days: input.delivery_days,
      warranty_info: input.warranty_info,
      shipping_info: input.shipping_info,
    },
  });
}

async function executeTool(name: string, input: any): Promise<string> {
  switch (name) {
    case 'submit_inquiry':
      return executeSubmitInquiry(input);
    case 'search_products':
      return executeSearchProducts(input);
    case 'compare_products':
      return executeCompareProducts(input);
    case 'generate_dealer_quote':
      return executeGenerateDealerQuote(input);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ============================================
// SYSTEM PROMPT BUILDER
// ============================================

function buildSystemPrompt(
  userContext?: { name?: string; phone?: string; email?: string; city?: string },
  dealerContext?: { businessName?: string; city?: string; id?: string }
): string {
  let prompt = HUB4ESTATE_SYSTEM_PROMPT;

  if (userContext?.name || userContext?.phone) {
    prompt += '\n\n## LOGGED-IN USER';
    if (userContext.name) prompt += `\n- Name: ${userContext.name}`;
    if (userContext.phone) prompt += `\n- Phone: ${userContext.phone}`;
    if (userContext.email) prompt += `\n- Email: ${userContext.email}`;
    if (userContext.city) prompt += `\n- City: ${userContext.city}`;
    prompt += `\nUse this info when submitting inquiries. Only ask for missing fields.`;
  }

  if (dealerContext?.businessName) {
    prompt += '\n\n## DEALER CONTEXT (the user IS a dealer)';
    prompt += `\n- Business: ${dealerContext.businessName}`;
    if (dealerContext.city) prompt += `\n- City: ${dealerContext.city}`;
    prompt += `\nThis user is a verified dealer on Hub4Estate. Adjust your responses accordingly:`;
    prompt += `\n- Help them compose professional quotes using generate_dealer_quote`;
    prompt += `\n- Give advice on winning more bids and improving their conversion rate`;
    prompt += `\n- They can speak naturally in Hindi or English and you will structure their offers`;
  }

  return prompt;
}

// ============================================
// STREAMING TYPES
// ============================================

export type StreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_start'; tool: string; label: string }
  | { type: 'tool_done'; tool: string; result: any }
  | { type: 'error'; error: string };

// ============================================
// STREAMING CHAT — Primary function
// ============================================

export async function* streamChatResponse(
  messages: ChatMessage[],
  userContext?: { name?: string; phone?: string; email?: string; city?: string },
  dealerContext?: { businessName?: string; city?: string; id?: string }
): AsyncGenerator<StreamEvent> {
  if (!anthropicClient) {
    yield {
      type: 'text',
      text: "I'm currently unavailable. Please contact shreshth.agarwal@hub4estate.com or call +91 76900 01999.",
    };
    return;
  }

  const systemPrompt = buildSystemPrompt(userContext, dealerContext);

  const formattedMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const TOOL_LABELS: Record<string, string> = {
    submit_inquiry: 'Submitting inquiry...',
    search_products: 'Searching products...',
    compare_products: 'Comparing products...',
    generate_dealer_quote: 'Structuring your quote...',
  };

  let iteration = 0;

  while (iteration < 5) {
    iteration++;

    try {
      const stream = anthropicClient.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        tools: CHAT_TOOLS,
        messages: formattedMessages,
      });

      // Stream text chunks as they arrive
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta' &&
          event.delta.text
        ) {
          yield { type: 'text', text: event.delta.text };
        }
      }

      const finalMsg = await stream.finalMessage();

      if (finalMsg.stop_reason === 'end_turn') {
        return;
      }

      if (finalMsg.stop_reason === 'tool_use') {
        // Add assistant turn to history
        formattedMessages.push({ role: 'assistant', content: finalMsg.content });

        const toolResultContent: Anthropic.ToolResultBlockParam[] = [];

        for (const block of finalMsg.content) {
          if (block.type === 'tool_use') {
            yield {
              type: 'tool_start',
              tool: block.name,
              label: TOOL_LABELS[block.name] || `Running ${block.name}...`,
            };

            const result = await executeTool(block.name, block.input);
            const parsed = JSON.parse(result);

            yield { type: 'tool_done', tool: block.name, result: parsed };

            toolResultContent.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result,
            });
          }
        }

        formattedMessages.push({ role: 'user', content: toolResultContent });
        continue;
      }

      // Unexpected stop
      return;
    } catch (err: any) {
      console.error('[Spark] Stream error:', err);
      yield { type: 'error', error: 'Connection interrupted. Please try again.' };
      return;
    }
  }

  yield { type: 'error', error: 'Request too complex. Please try a simpler question.' };
}

// ============================================
// NON-STREAMING CHAT (kept for compatibility)
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
      response:
        "I'm currently unavailable. Please contact shreshth.agarwal@hub4estate.com or call +91 76900 01999.",
    };
  }

  try {
    const systemPrompt = buildSystemPrompt(userContext);

    const formattedMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const toolResults: ChatToolResult[] = [];
    let iteration = 0;

    while (iteration < 5) {
      iteration++;

      const response = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        tools: CHAT_TOOLS,
        messages: formattedMessages,
      });

      if (response.stop_reason === 'end_turn') {
        const text = response.content
          .filter((b) => b.type === 'text')
          .map((b) => (b as Anthropic.TextBlock).text)
          .join('');
        return { response: text, tokenCount: response.usage?.output_tokens, toolResults };
      }

      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(
          (b) => b.type === 'tool_use'
        ) as Anthropic.ToolUseBlock[];

        formattedMessages.push({ role: 'assistant', content: response.content });

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

        formattedMessages.push({ role: 'user', content: toolResultContent });
        continue;
      }

      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as Anthropic.TextBlock).text)
        .join('');
      return { response: text || 'Something went wrong. Please try again.', toolResults };
    }

    return { response: "I'm having trouble completing that. Please try again.", toolResults };
  } catch (error: any) {
    console.error('[Spark] Chat error:', error);
    return {
      response:
        "I'm experiencing difficulties. Please try again or contact shreshth.agarwal@hub4estate.com.",
    };
  }
}

// ============================================
// RFQ AI SUGGESTIONS
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
      where: { id: { in: data.items.map((i) => i.productId) } },
      include: {
        brand: true,
        productType: { include: { subCategory: { include: { category: true } } } },
      },
    });

    const productContext = products.map((p) => ({
      name: p.name,
      brand: p.brand.name,
      category: p.productType.subCategory.category.name,
      quantity: data.items.find((i) => i.productId === p.id)?.quantity || 0,
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
      messages: [
        {
          role: 'user',
          content: `Explain this electrical product for Indian homeowners in 2-3 paragraphs. Simple language.
Product: ${product.name}, Brand: ${product.brand.name}, Category: ${product.productType.subCategory.category.name}
Specs: ${product.specifications || 'Not specified'}
Cover: what it is, where it's used, why brand matters, what to check before buying.`,
        },
      ],
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

    const avgRank =
      dealer.quotes.filter((q) => q.rankPosition !== null).reduce((s, q) => s + (q.rankPosition || 0), 0) /
      (dealer.quotes.length || 1);

    const msg = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Analyze dealer performance. Quotes: ${dealer.totalQuotesSubmitted}, Conversions: ${dealer.totalConversions}, Rate: ${(dealer.conversionRate * 100).toFixed(1)}%, Avg rank: ${avgRank.toFixed(1)}. Loss reasons: ${JSON.stringify(dealer.quotes.filter((q) => q.status === 'REJECTED').map((q) => q.lossReason))}. Give 3–4 bullet points of actionable improvements.`,
        },
      ],
    });

    return msg.content[0].type === 'text' ? msg.content[0].text : 'Analysis unavailable';
  } catch {
    return 'Analysis temporarily unavailable';
  }
}
