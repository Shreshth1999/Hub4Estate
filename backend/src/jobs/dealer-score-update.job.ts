import { dealerScoringService } from '../services/dealer-scoring.service';

/**
 * Recalculates composite scores and tiers for all verified dealers.
 * Intended to run weekly (e.g., Sunday midnight).
 */
export async function updateAllDealerScores(): Promise<void> {
  const count = await dealerScoringService.recalculateAll();

  process.stdout.write(JSON.stringify({
    type: 'dealer_scores_updated',
    timestamp: new Date().toISOString(),
    dealersUpdated: count,
  }) + "\n");
}
