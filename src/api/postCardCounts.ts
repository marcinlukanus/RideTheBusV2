import { Card } from '../components/Game/useGameState';
import supabase from '../utils/supabase';

export const postCardCounts = async (cards: Card[]) => {
  const { error } = await supabase.rpc('increment_card_counts_bulk', {
    card_values: cards.map((c) => c.values.rank),
    card_suits: cards.map((c) => c.suit),
  });

  if (error) {
    throw new Error(`Error incrementing card counts: ${error.message}`);
  }

  console.log('Card counts updated successfully');
};
