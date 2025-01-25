import { Card } from '../components/Game/useGameState';
import supabase from '../utils/supabase';

export const postCardCounts = async (cards: Card[]) => {
  // Increment counts for existing cards in bulk
  for (const card of cards) {
    const { error: incrementError } = await supabase.rpc(
      'increment_card_count',
      {
        card_value_input: card.values.rank,
        card_suit_input: card.suit,
      }
    );

    if (incrementError) {
      throw new Error(
        `Error incrementing count for ${card.values.rank} of ${card.suit}: ${incrementError.message}`
      );
    }
  }

  console.log('Card counts updated successfully');
};
