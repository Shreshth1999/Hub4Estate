/**
 * Negotiation Agent
 *
 * AI-powered price negotiation assistant that helps buyers get better deals
 * and helps dealers optimize their quotes for winning.
 *
 * For BUYERS: Suggests counter-offers based on market data, identifies
 * overpriced quotes, and recommends negotiation strategies.
 *
 * For DEALERS: Suggests optimal pricing based on competition, recommends
 * volume discounts, and helps craft winning quote responses.
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import prisma from '../../config/database';
import { getCachedResponse, setCachedResponse, selectModel, recordTokenUsage } from '../ai-cache.service';

let client: Anthropic | null = null;
if (env.ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

// ============================================
// BUYER NEGOTIATION ANALYSIS
// ============================================

interface QuoteAnalysis {
  isCompetitive: boolean;
  priceRating: 'excellent' | 'good' | 'fair' | 'high' | 'overpriced';
  suggestedCounterOffer: number | null;
  reasoning: string;
  tips: string[];
}

export async function analyzeQuoteForBuyer(
  quoteAmount: number,
  productName: string,
  quantity: number,
  otherQuoteAmounts: number[]
): Promise<QuoteAnalysis> {
  if (!client) {
    return {
      isCompetitive: true,
      priceRating: 'fair',
      suggestedCounterOffer: null,
      reasoning: 'AI analysis unavailable',
      tips: ['Compare with other quotes received'],
    };
  }

  const cacheParams = { quoteAmount, productName, quantity, otherQuoteAmounts: otherQuoteAmounts.sort() };
  const cached = await getCachedResponse<QuoteAnalysis>('rfqSuggestion', cacheParams);
  if (cached) return cached;

  try {
    const model = await selectModel('claude-haiku-4-5-20251001', 'medium');

    const msg = await client.messages.create({
      model,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Analyze this quote for an Indian electrical product buyer. Return JSON only.

Product: ${productName}
Quantity: ${quantity}
This quote amount: ₹${quoteAmount.toLocaleString('en-IN')}
Other quotes received: ${otherQuoteAmounts.map(a => `₹${a.toLocaleString('en-IN')}`).join(', ') || 'none'}

Return JSON:
{"isCompetitive":bool,"priceRating":"excellent|good|fair|high|overpriced","suggestedCounterOffer":number|null,"reasoning":"1-2 sentences","tips":["tip1","tip2"]}`,
      }],
    });

    if (msg.usage) {
      await recordTokenUsage({ model, inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens });
    }

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      isCompetitive: true, priceRating: 'fair', suggestedCounterOffer: null,
      reasoning: 'Unable to analyze', tips: [],
    };

    await setCachedResponse('rfqSuggestion', cacheParams, result);
    return result;
  } catch {
    return {
      isCompetitive: true, priceRating: 'fair', suggestedCounterOffer: null,
      reasoning: 'Analysis temporarily unavailable', tips: [],
    };
  }
}

// ============================================
// DEALER QUOTE OPTIMIZATION
// ============================================

interface QuoteOptimization {
  suggestedPrice: number;
  winProbability: string;
  pricingStrategy: string;
  volumeDiscountSuggestion: string | null;
  tips: string[];
}

export async function optimizeQuoteForDealer(
  dealerId: string,
  productName: string,
  quantity: number,
  dealerCostEstimate: number
): Promise<QuoteOptimization> {
  if (!client) {
    return {
      suggestedPrice: dealerCostEstimate * 1.15,
      winProbability: 'unknown',
      pricingStrategy: 'AI unavailable — price at 15% margin',
      volumeDiscountSuggestion: null,
      tips: [],
    };
  }

  try {
    // Get dealer's historical win rate
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { conversionRate: true, totalQuotesSubmitted: true, totalConversions: true },
    });

    const model = await selectModel('claude-haiku-4-5-20251001', 'medium');

    const msg = await client.messages.create({
      model,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Help a dealer optimize their quote to win. Return JSON only.

Product: ${productName}
Quantity: ${quantity}
Dealer's estimated cost: ₹${dealerCostEstimate.toLocaleString('en-IN')}
Dealer's win rate: ${dealer ? `${(dealer.conversionRate * 100).toFixed(1)}%` : 'unknown'}
Total quotes submitted: ${dealer?.totalQuotesSubmitted || 'unknown'}

Return JSON:
{"suggestedPrice":number,"winProbability":"high|medium|low","pricingStrategy":"1-2 sentences","volumeDiscountSuggestion":"string or null","tips":["tip1","tip2"]}`,
      }],
    });

    if (msg.usage) {
      await recordTokenUsage({ model, inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens });
    }

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      suggestedPrice: dealerCostEstimate * 1.15,
      winProbability: 'unknown',
      pricingStrategy: 'Unable to analyze',
      volumeDiscountSuggestion: null,
      tips: [],
    };
  } catch {
    return {
      suggestedPrice: dealerCostEstimate * 1.15,
      winProbability: 'unknown',
      pricingStrategy: 'Analysis temporarily unavailable',
      volumeDiscountSuggestion: null,
      tips: [],
    };
  }
}

// ============================================
// PROCUREMENT COPILOT
// ============================================

interface ProcurementAdvice {
  recommendedBrands: string[];
  wireSpecRecommendation: string | null;
  safetyChecklist: string[];
  budgetEstimate: { min: number; max: number } | null;
  procurementTips: string[];
}

export async function getProcurementAdvice(
  projectType: string, // e.g., '2BHK house wiring', 'shop electrical setup'
  city: string,
  budgetRange?: { min: number; max: number }
): Promise<ProcurementAdvice> {
  if (!client) {
    return {
      recommendedBrands: ['Havells', 'Polycab', 'Finolex'],
      wireSpecRecommendation: null,
      safetyChecklist: ['Use ISI-marked products', 'Ensure proper earthing'],
      budgetEstimate: null,
      procurementTips: ['Submit an inquiry on Hub4Estate for the best price'],
    };
  }

  const cacheParams = { projectType, city, budgetRange };
  const cached = await getCachedResponse<ProcurementAdvice>('rfqSuggestion', cacheParams);
  if (cached) return cached;

  try {
    const model = await selectModel('claude-haiku-4-5-20251001', 'medium');

    const msg = await client.messages.create({
      model,
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are an Indian electrical procurement expert. Advise on this project. Return JSON only.

Project: ${projectType}
City: ${city}
Budget: ${budgetRange ? `₹${budgetRange.min.toLocaleString('en-IN')} - ₹${budgetRange.max.toLocaleString('en-IN')}` : 'not specified'}

Return JSON:
{"recommendedBrands":["brand1","brand2"],"wireSpecRecommendation":"string or null","safetyChecklist":["check1","check2"],"budgetEstimate":{"min":number,"max":number}|null,"procurementTips":["tip1","tip2","tip3"]}

Use Indian BIS standards. Brands from: Havells, Polycab, Finolex, Legrand, Schneider, Siemens, ABB, Crompton, Philips, L&T, KEI, Anchor, Goldmedal.`,
      }],
    });

    if (msg.usage) {
      await recordTokenUsage({ model, inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens });
    }

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      recommendedBrands: ['Havells', 'Polycab'],
      wireSpecRecommendation: null,
      safetyChecklist: [],
      budgetEstimate: null,
      procurementTips: [],
    };

    await setCachedResponse('rfqSuggestion', cacheParams, result);
    return result;
  } catch {
    return {
      recommendedBrands: ['Havells', 'Polycab', 'Finolex'],
      wireSpecRecommendation: null,
      safetyChecklist: [],
      budgetEstimate: null,
      procurementTips: [],
    };
  }
}
