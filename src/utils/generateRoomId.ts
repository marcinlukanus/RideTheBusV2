// Function to generate a friendly room ID
// Uses a combination of consonants and vowels to create pronounceable IDs
export const generateRoomId = (): string => {
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  let result = '';

  // Generate a 6-character room ID
  for (let i = 0; i < 3; i++) {
    // Add a consonant-vowel pair
    result += consonants.charAt(Math.floor(Math.random() * consonants.length));
    result += vowels.charAt(Math.floor(Math.random() * vowels.length));
  }

  return result;
};
