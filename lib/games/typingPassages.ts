export const TYPING_PASSAGES = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
  "Programming is the art of telling a computer what to do. It requires logic, creativity, and patience to solve complex problems.",
  "The internet has revolutionized how we communicate, work, and learn. It connects billions of people around the world instantly.",
  "Nature is full of wonders that inspire us every day. From the smallest flower to the tallest mountain, beauty surrounds us.",
  "Learning a new skill takes time and dedication. Practice makes perfect, and every expert was once a beginner.",
  "Technology continues to evolve at an incredible pace. What seems impossible today might be reality tomorrow.",
  "Books are windows to different worlds and perspectives. Reading expands our minds and enriches our lives.",
  "Music has the power to move us emotionally and bring people together across cultures and languages.",
  "Science helps us understand the world around us. Through observation and experimentation, we discover truth.",
  "Friendship is one of life's greatest treasures. Good friends support us through both good times and bad.",
];

export function getRandomPassage(): string {
  return TYPING_PASSAGES[Math.floor(Math.random() * TYPING_PASSAGES.length)];
}
