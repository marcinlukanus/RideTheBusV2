import { Card } from '../components/Game/useGameState';
import supabase from '../utils/supabase';

export const postCardCounts = async (cards: Card[]) => {
  const cardCounts = cards.map((card) => ({
    card_value: card.values.rank, // Use rank as the value
    card_suit: card.suit, // Use suit directly
    count: 1, // Default count increment
  }));

  // Perform upsert operation
  const { error } = await supabase
    .from('card_counts')
    .upsert(cardCounts, { onConflict: ['card_value', 'card_suit'] });

  if (error) {
    throw new Error(`Error updating card counts: ${error.message}`);
  }

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
