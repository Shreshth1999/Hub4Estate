import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import prisma from '../config/database';

let anthropicClient: Anthropic | null = null;

if (env.ANTHROPIC_API_KEY) {
  anthropicClient = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });
}

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
  if (!anthropicClient) {
    return {
      insights: ['AI suggestions unavailable - API key not configured'],
    };
  }

  try {
    // Fetch product details
    const products = await prisma.product.findMany({
      where: {
        id: { in: data.items.map((item) => item.productId) },
      },
      include: {
        brand: true,
        productType: {
          include: {
            subCategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const productContext = products.map((p) => ({
      name: p.name,
      brand: p.brand.name,
      category: p.productType.subCategory.category.name,
      subCategory: p.productType.subCategory.name,
      type: p.productType.name,
      quantity: data.items.find((item) => item.productId === p.id)?.quantity || 0,
    }));

    const prompt = `You are an expert in Indian home construction electronics and electrical procurement.

Analyze this RFQ:
City: ${data.city}
Urgency: ${data.urgency || 'normal'}

Products being purchased:
${JSON.stringify(productContext, null, 2)}

Provide insights in JSON format:
{
  "missingItems": ["list of commonly forgotten items for this setup"],
  "quantityWarnings": [{"productId": "id", "message": "why quantity might be wrong"}],
  "complementaryProducts": ["products that work well with these"],
  "insights": ["helpful tips and warnings"]
}

Focus on:
1. Safety and compliance
2. Common installation mistakes
3. Product compatibility
4. Quantity validation
5. Budget optimization`;

    const message = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const suggestions = JSON.parse(responseText);

    return suggestions;
  } catch (error) {
    console.error('AI suggestions error:', error);
    return {
      insights: ['AI analysis temporarily unavailable'],
    };
  }
}

export async function generateProductExplanation(productId: string): Promise<string> {
  if (!anthropicClient) {
    return 'Product explanation unavailable - AI not configured';
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        productType: {
          include: {
            subCategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return 'Product not found';
    }

    const prompt = `Explain this electrical product for Indian home construction:

Product: ${product.name}
Brand: ${product.brand.name}
Category: ${product.productType.subCategory.category.name}
Specifications: ${product.specifications || 'Not specified'}

Provide a clear, practical explanation covering:
1. What it is and what it does
2. Where it's used in a house
3. Why brand quality matters
4. Common mistakes people make
5. What to check before buying

Write in simple, non-technical language for homeowners. 2-3 paragraphs max.`;

    const message = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return message.content[0].type === 'text' ? message.content[0].text : 'Explanation unavailable';
  } catch (error) {
    console.error('Product explanation error:', error);
    return 'Explanation temporarily unavailable';
  }
}

export async function analyzeDealerPerformance(dealerId: string): Promise<string> {
  if (!anthropicClient) {
    return 'Analysis unavailable';
  }

  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: {
        quotes: {
          select: {
            status: true,
            lossReason: true,
            rankPosition: true,
            totalAmount: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!dealer) {
      return 'Dealer not found';
    }

    const lossReasons = dealer.quotes
      .filter((q) => q.status === 'REJECTED')
      .map((q) => q.lossReason);

    const avgRank = dealer.quotes
      .filter((q) => q.rankPosition !== null)
      .reduce((sum, q) => sum + (q.rankPosition || 0), 0) / dealer.quotes.length;

    const prompt = `Analyze this dealer's performance and provide actionable insights:

Metrics:
- Total Quotes: ${dealer.totalQuotesSubmitted}
- Conversions: ${dealer.totalConversions}
- Conversion Rate: ${(dealer.conversionRate * 100).toFixed(1)}%
- Average Rank: ${avgRank.toFixed(1)}

Loss Reasons: ${JSON.stringify(lossReasons)}

Provide:
1. Top 3 improvement areas
2. Specific actionable recommendations
3. Market positioning advice

Keep it concise and actionable. 3-4 bullet points max.`;

    const message = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return message.content[0].type === 'text' ? message.content[0].text : 'Analysis unavailable';
  } catch (error) {
    console.error('Dealer analysis error:', error);
    return 'Analysis temporarily unavailable';
  }
}

// ============================================
// AI CHAT ASSISTANT
// ============================================

const HUB4ESTATE_SYSTEM_PROMPT = `You are the official AI Assistant for Hub4Estate, India's leading B2B marketplace for electrical products.

## ABOUT HUB4ESTATE
Hub4Estate connects buyers (homeowners, contractors, builders) directly with 500+ verified electrical dealers across 50+ cities in India. We help buyers save 15-25% on electrical procurement through our RFQ (Request for Quote) system.

## FOUNDER INFORMATION
Shreshth Agarwal is the Founder & CEO of Hub4Estate. He identified the inefficiencies in electrical procurement and built Hub4Estate to bring transparency and trust to the industry.
- Email: shresth.agarwal@hub4estate.com
- Phone: +91 76900 01999

## CONTACT INFORMATION
- General inquiries: hello@hub4estate.com
- Dealer partnerships: dealers@hub4estate.com
- Founder direct: shresth.agarwal@hub4estate.com
- Phone: +91 76900 01999

## PRODUCT CATEGORIES (13+ categories)
1. **Wires & Cables** - House wiring, power cables, flexible wires (Havells, Polycab, Finolex, KEI)
2. **Switches & Sockets** - Modular switches, dimmers, USB outlets (Legrand, Schneider, Anchor, GM)
3. **MCBs & Distribution** - Circuit breakers, distribution boards, RCCBs (Siemens, ABB, L&T, Havells)
4. **Fans & Ventilation** - Ceiling fans, exhaust fans, BLDC fans (Crompton, Havells, Orient, Atomberg)
5. **Lighting** - LED panels, downlights, decorative lights (Philips, Wipro, Syska, Havells)
6. **Conduits & Accessories** - PVC conduits, junction boxes, gang boxes
7. **Earthing & Protection** - Earthing electrodes, surge protectors, lightning arresters
8. **Water Heaters** - Geysers, instant heaters, storage heaters (Bajaj, Havells, AO Smith)
9. **Smart Home** - Smart switches, automation systems, voice-controlled devices
10. **Solar Products** - Solar panels, inverters, charge controllers
11. **UPS & Inverters** - Home UPS, batteries, stabilizers (Luminous, Microtek, Exide)
12. **Industrial Electrical** - Heavy-duty equipment, motors, panels
13. **Tools & Testing** - Multimeters, testers, installation tools

## HOW OUR RFQ PROCESS WORKS
1. **Sign Up** - Quick Google sign-in
2. **Browse Products** - Select from our comprehensive catalog
3. **Create RFQ** - Add products with quantities and requirements
4. **Receive Quotes** - Get quotes from multiple verified dealers within 24-48 hours
5. **Compare & Select** - Choose the best quote based on price, delivery, and dealer rating
6. **Complete Transaction** - Direct dealing with the selected dealer

## PRICING INFORMATION
- We help buyers save 15-25% compared to retail MRP
- No hidden charges - transparent pricing
- Bulk discounts available for larger orders
- Payment directly to dealers after selection

## FOR DEALERS
Dealers can join Hub4Estate to:
- Access qualified buyer leads
- Submit competitive quotes
- Build digital presence
- Track performance analytics
Registration: hub4estate.com/dealer/onboarding

## TECHNICAL GUIDANCE - WIRING STANDARDS (Indian Standards)
- **Lighting circuits**: 1.0 sq mm copper wire
- **Power sockets (5A)**: 1.5 sq mm copper wire
- **Power sockets (15A)**: 2.5 sq mm copper wire
- **Air Conditioners**: 4.0 sq mm copper wire (dedicated circuit)
- **Geysers**: 4.0 sq mm copper wire (dedicated circuit)
- **Main supply**: 6.0-10.0 sq mm based on load
- Always use ISI-marked BIS-certified products
- MCB ratings: 6A (lighting), 16A (power), 20-32A (AC/geyser)

## SAFETY RECOMMENDATIONS
- Install RCCB (Residual Current Circuit Breaker) for shock protection
- Proper earthing is mandatory for safety
- Use copper wires, not aluminum for house wiring
- Hire licensed electricians for installation
- Regular inspection of electrical systems

## YOUR BEHAVIOR
1. Be helpful, friendly, and professional
2. Provide accurate information about electrical products
3. Recommend appropriate products based on user requirements
4. Guide users through the RFQ process
5. Offer safety advice when relevant
6. Suggest contacting Shreshth directly for complex queries
7. If unsure about specific pricing, recommend creating an RFQ
8. Never make up information - say "I'm not sure" when appropriate

## RESPONSE GUIDELINES
- Keep responses concise but informative
- Use bullet points for lists
- Provide specific product recommendations when asked
- Always prioritize user safety in electrical advice
- Encourage users to create RFQs for accurate pricing
- Direct dealer inquiries to dealers@hub4estate.com
`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  _sessionId?: string
): Promise<{ response: string; tokenCount?: number }> {
  if (!anthropicClient) {
    return {
      response:
        "I'm currently unavailable. Please contact us directly at hello@hub4estate.com or call +91 76900 01999.",
    };
  }

  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: HUB4ESTATE_SYSTEM_PROMPT,
      messages: formattedMessages,
    });

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';
    const tokenCount = response.usage?.output_tokens;

    return {
      response: responseText,
      tokenCount,
    };
  } catch (error) {
    console.error('Chat response error:', error);
    return {
      response:
        "I apologize, but I'm experiencing technical difficulties. Please try again or contact us at hello@hub4estate.com.",
    };
  }
}
