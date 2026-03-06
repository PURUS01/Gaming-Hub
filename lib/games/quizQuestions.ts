export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2,
    category: "Geography"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
    category: "Science"
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correct: 1,
    category: "Math"
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correct: 1,
    category: "Literature"
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correct: 3,
    category: "Geography"
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2,
    category: "Science"
  },
  {
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correct: 2,
    category: "History"
  },
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correct: 2,
    category: "Math"
  },
  {
    question: "Which animal is known as the King of the Jungle?",
    options: ["Tiger", "Lion", "Elephant", "Leopard"],
    correct: 1,
    category: "Nature"
  },
  {
    question: "What is the speed of light in vacuum?",
    options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
    correct: 0,
    category: "Science"
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correct: 2,
    category: "Geography"
  },
  {
    question: "What is the main ingredient in guacamole?",
    options: ["Tomato", "Avocado", "Onion", "Pepper"],
    correct: 1,
    category: "Food"
  },
  {
    question: "Which programming language is known for web development?",
    options: ["Python", "JavaScript", "C++", "Java"],
    correct: 1,
    category: "Technology"
  },
  {
    question: "What is the longest river in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    correct: 1,
    category: "Geography"
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: 1,
    category: "Math"
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Diamond", "Platinum", "Titanium"],
    correct: 1,
    category: "Science"
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correct: 2,
    category: "Art"
  },
  {
    question: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    correct: 2,
    category: "Math"
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correct: 2,
    category: "Science"
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correct: 1,
    category: "Nature"
  },
  {
    question: "In which country is the Great Wall located?",
    options: ["Japan", "China", "India", "Korea"],
    correct: 1,
    category: "Geography"
  },
  {
    question: "What is the boiling point of water in Celsius?",
    options: ["90°C", "100°C", "110°C", "120°C"],
    correct: 1,
    category: "Science"
  },
  {
    question: "How many players are on a basketball team on the court?",
    options: ["4", "5", "6", "7"],
    correct: 1,
    category: "Sports"
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    correct: 2,
    category: "Geography"
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
    correct: 1,
    category: "Science"
  }
];

export function getRandomQuestions(count: number = 10): QuizQuestion[] {
  const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, QUIZ_QUESTIONS.length));
}
