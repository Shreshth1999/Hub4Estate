import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import prisma from '../config/database';
import { PipelineStatus, QuoteResponseStatus } from '@prisma/client';

let anthropicClient: Anthropic | null = null;

if (env.ANTHROPIC_API_KEY) {
  anthropicClient = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });
}

interface AIAnalysisResult {
  identifiedBrand: string | null;
  brandConfidence: number;
  identifiedProduct: string | null;
  identifiedCategory: string | null;
  suggestedWhatsAppTemplate: string;
  insights: string[];
}

/**
 * Use AI to analyze an inquiry and identify brand, product, category,
 * and generate a WhatsApp message template for dealer outreach.
 */
export async function analyzeInquiryWithAI(inquiry: {
  id: string;
  name: string;
  phone: string;
  modelNumber: string | null;
  notes: string | null;
  deliveryCity: string;
  productPhoto: string | null;
  quantity: number;
}): Promise<AIAnalysisResult> {
  const fallback: AIAnalysisResult = {
    identifiedBrand: null,
    brandConfidence: 0,
    identifiedProduct: null,
    identifiedCategory: null,
    suggestedWhatsAppTemplate: `Hi, I'm reaching out from Hub4Estate. We have a customer inquiry for ${inquiry.modelNumber || 'an electrical product'} (Qty: ${inquiry.quantity}) in ${inquiry.deliveryCity}. Could you share your best price and availability? Thank you.`,
    insights: ['AI analysis unavailable - using default template'],
  };

  if (!anthropicClient) return fallback;

  try {
    // Fetch all brands for context
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    });

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
    });

    const prompt = `You are an expert in Indian electrical products and brands. Analyze this product inquiry and identify the brand, product type, and category.

INQUIRY DETAILS:
- Model Number / Product: ${inquiry.modelNumber || 'Not provided'}
- Notes: ${inquiry.notes || 'None'}
- Quantity: ${inquiry.quantity}
- Delivery City: ${inquiry.deliveryCity}
${inquiry.productPhoto ? '- Customer uploaded a product photo' : ''}

KNOWN BRANDS IN OUR DATABASE:
${brands.map(b => `- ${b.name} (${b.slug})`).join('\n')}

KNOWN CATEGORIES:
${categories.map(c => `- ${c.name} (${c.slug})`).join('\n')}

Respond in JSON only:
{
  "identifiedBrand": "brand name or null",
  "brandConfidence": 0.0-1.0,
  "identifiedProduct": "specific product type description",
  "identifiedCategory": "category slug from list above or null",
  "suggestedWhatsAppTemplate": "Professional WhatsApp message template for contacting dealers. Include: greeting, Hub4Estate intro, product details, quantity, city, request for best price and delivery timeline. Keep it concise and professional in Hindi-English mix.",
  "insights": ["insight 1", "insight 2"]
}`;

    const message = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    // Extract JSON from possible markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const result = JSON.parse(jsonMatch[0]) as AIAnalysisResult;
    return result;
  } catch (error) {
    console.error('AI inquiry analysis error:', error);
    return fallback;
  }
}

/**
 * Find matching dealers for a brand - both platform dealers and external BrandDealers.
 */
export async function findMatchingDealers(brandName: string | null, city?: string) {
  const results: {
    platformDealers: any[];
    brandDealers: any[];
  } = { platformDealers: [], brandDealers: [] };

  if (!brandName) return results;

  // Find the brand in DB
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { contains: brandName, mode: 'insensitive' } },
        { slug: { contains: brandName.toLowerCase().replace(/\s+/g, '-') } },
      ],
    },
  });

  if (!brand) return results;

  // Find platform dealers with this brand mapping
  const platformMappings = await prisma.dealerBrandMapping.findMany({
    where: { brandId: brand.id },
    include: {
      dealer: {
        select: {
          id: true,
          businessName: true,
          ownerName: true,
          phone: true,
          city: true,
          state: true,
          status: true,
        },
      },
    },
  });

  results.platformDealers = platformMappings
    .filter(m => m.dealer.status === 'VERIFIED')
    .map(m => ({
      dealerId: m.dealer.id,
      name: m.dealer.ownerName,
      shopName: m.dealer.businessName,
      phone: m.dealer.phone,
      city: m.dealer.city,
      state: m.dealer.state,
      source: 'PLATFORM_DEALER' as const,
      isVerified: m.isVerified,
    }));

  // Find external brand dealers
  const brandDealerWhere: any = {
    brandId: brand.id,
    isActive: true,
  };
  if (city) {
    brandDealerWhere.city = { contains: city, mode: 'insensitive' };
  }

  results.brandDealers = await prisma.brandDealer.findMany({
    where: brandDealerWhere,
    select: {
      id: true,
      name: true,
      shopName: true,
      phone: true,
      whatsappNumber: true,
      city: true,
      state: true,
      source: true,
      isVerified: true,
    },
  });

  return results;
}

/**
 * Create a pipeline for an inquiry - runs AI analysis and sets up the workflow.
 */
export async function createPipeline(inquiryId: string, adminId: string) {
  // Check if pipeline already exists
  const existing = await prisma.inquiryPipeline.findUnique({
    where: { inquiryId },
  });
  if (existing) {
    return existing;
  }

  // Get the inquiry
  const inquiry = await prisma.productInquiry.findUnique({
    where: { id: inquiryId },
  });
  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  // Run AI analysis
  const analysis = await analyzeInquiryWithAI(inquiry);

  // Try to find the brand in DB
  let identifiedBrandId: string | null = null;
  if (analysis.identifiedBrand) {
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: { contains: analysis.identifiedBrand, mode: 'insensitive' } },
          { slug: { contains: analysis.identifiedBrand.toLowerCase().replace(/\s+/g, '-') } },
        ],
      },
    });
    if (brand) identifiedBrandId = brand.id;
  }

  const pipeline = await prisma.inquiryPipeline.create({
    data: {
      inquiryId,
      identifiedBrandId,
      identifiedBrand: analysis.identifiedBrand,
      identifiedProduct: analysis.identifiedProduct,
      identifiedCategory: analysis.identifiedCategory,
      status: 'BRAND_IDENTIFIED',
      aiAnalysis: JSON.stringify(analysis),
      createdBy: adminId,
    },
    include: {
      inquiry: true,
      dealerQuotes: true,
    },
  });

  // Update inquiry status to contacted
  await prisma.productInquiry.update({
    where: { id: inquiryId },
    data: { status: 'contacted', assignedTo: adminId },
  });

  return pipeline;
}

/**
 * Add a dealer to the pipeline for quoting.
 */
export async function addDealerToPipeline(
  pipelineId: string,
  data: {
    brandDealerId?: string;
    dealerId?: string;
    dealerName: string;
    dealerPhone: string;
    dealerShopName?: string;
    dealerCity?: string;
    contactMethod?: 'WHATSAPP' | 'CALL' | 'EMAIL' | 'SMS';
    whatsappMessage?: string;
    saveToDirectory?: boolean;
    brandId?: string;
  }
) {
  const pipeline = await prisma.inquiryPipeline.findUnique({
    where: { id: pipelineId },
  });
  if (!pipeline) throw new Error('Pipeline not found');

  // Create the quote entry
  const quote = await prisma.inquiryDealerQuote.create({
    data: {
      pipelineId,
      brandDealerId: data.brandDealerId || null,
      dealerId: data.dealerId || null,
      dealerName: data.dealerName,
      dealerPhone: data.dealerPhone,
      dealerShopName: data.dealerShopName || null,
      dealerCity: data.dealerCity || null,
      contactMethod: data.contactMethod || 'WHATSAPP',
      whatsappMessage: data.whatsappMessage || null,
    },
  });

  // Optionally save this dealer to the BrandDealer directory
  if (data.saveToDirectory && data.brandId && !data.brandDealerId) {
    try {
      await prisma.brandDealer.upsert({
        where: {
          brandId_phone: {
            brandId: data.brandId,
            phone: data.dealerPhone,
          },
        },
        update: {
          name: data.dealerName,
          shopName: data.dealerShopName,
          city: data.dealerCity || '',
        },
        create: {
          brandId: data.brandId,
          name: data.dealerName,
          phone: data.dealerPhone,
          shopName: data.dealerShopName,
          city: data.dealerCity || 'Unknown',
          source: 'MANUAL',
        },
      });
    } catch (err) {
      console.error('Failed to save dealer to directory:', err);
    }
  }

  // Update pipeline status
  if (pipeline.status === 'BRAND_IDENTIFIED') {
    await prisma.inquiryPipeline.update({
      where: { id: pipelineId },
      data: { status: 'DEALERS_FOUND' },
    });
  }

  return quote;
}

/**
 * Update a dealer quote with price/status.
 */
export async function updateDealerQuote(
  quoteId: string,
  data: {
    quotedPrice?: number;
    shippingCost?: number;
    deliveryDays?: number;
    warrantyInfo?: string;
    quoteNotes?: string;
    responseStatus?: QuoteResponseStatus;
    contactedAt?: Date;
  }
) {
  const updateData: any = { ...data };

  // Auto-calculate total
  if (data.quotedPrice !== undefined) {
    updateData.totalQuotedPrice = (data.quotedPrice || 0) + (data.shippingCost || 0);
    if (!data.responseStatus) {
      updateData.responseStatus = 'QUOTED';
    }
  }

  if (data.responseStatus === 'CONTACTED' && !data.contactedAt) {
    updateData.contactedAt = new Date();
  }

  const quote = await prisma.inquiryDealerQuote.update({
    where: { id: quoteId },
    data: updateData,
  });

  // Check if we should advance the pipeline status
  const pipeline = await prisma.inquiryPipeline.findUnique({
    where: { id: quote.pipelineId },
    include: { dealerQuotes: true },
  });

  if (pipeline) {
    const hasQuoted = pipeline.dealerQuotes.some(q => q.responseStatus === 'QUOTED');
    const allContacted = pipeline.dealerQuotes.every(
      q => q.responseStatus !== 'PENDING'
    );

    if (hasQuoted && pipeline.status !== 'QUOTES_RECEIVED' && pipeline.status !== 'SENT_TO_CUSTOMER') {
      await prisma.inquiryPipeline.update({
        where: { id: pipeline.id },
        data: { status: 'QUOTES_RECEIVED' },
      });
    } else if (allContacted && pipeline.status === 'DEALERS_FOUND') {
      await prisma.inquiryPipeline.update({
        where: { id: pipeline.id },
        data: { status: 'QUOTES_REQUESTED' },
      });
    }
  }

  return quote;
}

/**
 * Compile best quotes and prepare customer message.
 */
export async function compileBestQuotes(pipelineId: string) {
  const pipeline = await prisma.inquiryPipeline.findUnique({
    where: { id: pipelineId },
    include: {
      inquiry: true,
      dealerQuotes: {
        where: { responseStatus: 'QUOTED' },
        orderBy: { totalQuotedPrice: 'asc' },
      },
    },
  });

  if (!pipeline) throw new Error('Pipeline not found');

  const topQuotes = pipeline.dealerQuotes.slice(0, 3);

  if (topQuotes.length === 0) {
    throw new Error('No quotes received yet');
  }

  const bestQuote = topQuotes[0];

  // Build customer message
  const quoteSummary = topQuotes
    .map((q, i) => {
      let line = `${i + 1}. ${q.dealerShopName || q.dealerName} (${q.dealerCity || 'N/A'})`;
      line += `\n   Price: ₹${q.quotedPrice?.toLocaleString('en-IN')}`;
      if (q.shippingCost) line += ` + ₹${q.shippingCost.toLocaleString('en-IN')} shipping`;
      if (q.deliveryDays) line += ` | Delivery: ${q.deliveryDays} days`;
      if (q.warrantyInfo) line += ` | ${q.warrantyInfo}`;
      return line;
    })
    .join('\n\n');

  const customerMessage = `Dear ${pipeline.inquiry.name},

Thank you for your inquiry (${pipeline.inquiry.inquiryNumber}) for ${pipeline.identifiedProduct || pipeline.inquiry.modelNumber || 'your product'} (Qty: ${pipeline.inquiry.quantity}).

We've sourced the best quotes from verified dealers:

${quoteSummary}

Best price: ₹${bestQuote.totalQuotedPrice?.toLocaleString('en-IN') || bestQuote.quotedPrice?.toLocaleString('en-IN')} from ${bestQuote.dealerShopName || bestQuote.dealerName}.

Would you like to proceed with any of these options? Reply to this message or call us at +91 76900 01999.

Best regards,
Hub4Estate Team`;

  return {
    pipeline,
    topQuotes,
    bestQuote,
    customerMessage,
  };
}

/**
 * Mark pipeline as sent to customer and update inquiry status.
 */
export async function sendToCustomer(
  pipelineId: string,
  adminId: string,
  sentVia: string,
  customerMessage: string,
  bestPrice?: number,
  shippingCost?: number,
  estimatedDelivery?: string
) {
  const pipeline = await prisma.inquiryPipeline.update({
    where: { id: pipelineId },
    data: {
      status: 'SENT_TO_CUSTOMER',
      sentToCustomerAt: new Date(),
      sentVia,
      customerMessage,
    },
    include: { inquiry: true },
  });

  // Update the inquiry with the best quote info
  const updateData: any = {
    status: 'quoted',
    respondedAt: new Date(),
    respondedBy: adminId,
    responseNotes: customerMessage,
  };

  if (bestPrice !== undefined) updateData.quotedPrice = bestPrice;
  if (shippingCost !== undefined) updateData.shippingCost = shippingCost;
  if (bestPrice !== undefined) {
    updateData.totalPrice = (bestPrice * pipeline.inquiry.quantity) + (shippingCost || 0);
  }
  if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;

  await prisma.productInquiry.update({
    where: { id: pipeline.inquiryId },
    data: updateData,
  });

  return pipeline;
}
