'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from "@/app/components/DashboardLayout";
import { isAuthenticated } from '@/app/utils/auth';
import { useRouter } from 'next/navigation';

// Define types for our activity data
interface ActivityOption {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  questions: ActivityOption[];
}

interface QuestionResult {
  question: string;
  userAnswer: string | undefined;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

interface ActivityResults {
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  scorePercentage: string;
  questionResults: QuestionResult[];
}

// Sample activities data
const activitiesData = [
  {
    "id": 1,
    "title": "Programming Fundamentals",
    "description": "Core programming logic and computer science basics",
    "category": "Programming",
    "difficulty": "Intermediate",
    "duration": "20 mins",
    "questions": [
      {
        "id": 1,
        "question": "Which language is primarily used for web styling?",
        "options": ["HTML", "CSS", "Python", "SQL"],
        "correctAnswer": "CSS",
        "explanation": "CSS handles styling and layout in web pages."
      },
      {
        "id": 2,
        "question": "What does HTML stand for?",
        "options": ["Hyper Trainer Marking Language", "Hyper Text Markup Language", "Hyperlink Text Management Language", "Home Tool Markup Language"],
        "correctAnswer": "Hyper Text Markup Language",
        "explanation": "HTML is the standard language for creating web pages."
      },
      {
        "id": 3,
        "question": "Which data structure works on FIFO?",
        "options": ["Stack", "Queue", "Tree", "Graph"],
        "correctAnswer": "Queue",
        "explanation": "FIFO means First In First Out — Queue follows it."
      },
      {
        "id": 4,
        "question": "Which operator is used for assignment in JavaScript?",
        "options": ["=", "==", "===", "=>"],
        "correctAnswer": "=",
        "explanation": "The = operator assigns values."
      },
      {
        "id": 5,
        "question": "Which is NOT a programming language?",
        "options": ["Java", "Python", "Ruby", "HTML"],
        "correctAnswer": "HTML",
        "explanation": "HTML is a markup language, not a programming language."
      },
      {
        "id": 6,
        "question": "Which symbol is used for comments in Python?",
        "options": ["//", "#", "<!-- -->", "/* */"],
        "correctAnswer": "#",
        "explanation": "Python comments use #."
      },
      {
        "id": 7,
        "question": "Which data type is NOT primitive in JavaScript?",
        "options": ["String", "Boolean", "Object", "Number"],
        "correctAnswer": "Object",
        "explanation": "Objects are non-primitive."
      },
      {
        "id": 8,
        "question": "Which company developed Java?",
        "options": ["Microsoft", "Sun Microsystems", "Google", "Apple"],
        "correctAnswer": "Sun Microsystems",
        "explanation": "Java was created by Sun Microsystems."
      },
      {
        "id": 9,
        "question": "Which keyword is used to declare a constant in JavaScript?",
        "options": ["var", "let", "const", "static"],
        "correctAnswer": "const",
        "explanation": "const creates readonly variables."
      },
      {
        "id": 10,
        "question": "Which protocol is used to load web pages?",
        "options": ["FTP", "SMTP", "HTTP", "SSH"],
        "correctAnswer": "HTTP",
        "explanation": "HTTP is the primary protocol for web communication."
      },
      {
        "id": 11,
        "question": "Which language is best for AI and ML?",
        "options": ["C", "Java", "Python", "PHP"],
        "correctAnswer": "Python",
        "explanation": "Python is widely used in AI/ML."
      },
      {
        "id": 12,
        "question": "Which of these is a loop structure?",
        "options": ["if", "switch", "for", "break"],
        "correctAnswer": "for",
        "explanation": "for is used for looping."
      },
      {
        "id": 13,
        "question": "What does API stand for?",
        "options": ["Application Processing Interface", "Application Programming Interface", "Applied Program Instruction", "Advanced Protocol Integration"],
        "correctAnswer": "Application Programming Interface",
        "explanation": "API allows applications to communicate."
      },
      {
        "id": 14,
        "question": "React is a ______?",
        "options": ["Library", "Framework", "Compiler", "Language"],
        "correctAnswer": "Library",
        "explanation": "React is a UI library by Meta."
      },
      {
        "id": 15,
        "question": "JSON stands for?",
        "options": ["Java Standard Object Notation", "JavaScript Object Notation", "Jumbo Script Object Notation", "Java Structure Output Node"],
        "correctAnswer": "JavaScript Object Notation",
        "explanation": "JSON is a lightweight data format."
      }
    ]
  },
  {
    "id": 2,
    "title": "World History",
    "description": "Important events and historical facts",
    "category": "History",
    "difficulty": "Advanced",
    "duration": "25 mins",
    "questions": [
      {
        "id": 1,
        "question": "Who discovered America?",
        "options": ["Christopher Columbus", "Marco Polo", "Vasco da Gama", "Magellan"],
        "correctAnswer": "Christopher Columbus",
        "explanation": "He reached the Americas in 1492."
      },
      {
        "id": 2,
        "question": "The Great Wall is in which country?",
        "options": ["India", "China", "Japan", "Korea"],
        "correctAnswer": "China",
        "explanation": "One of the Seven Wonders."
      },
      {
        "id": 3,
        "question": "Who was known as the Iron Lady?",
        "options": ["Angela Merkel", "Margaret Thatcher", "Indira Gandhi", "Queen Elizabeth"],
        "correctAnswer": "Margaret Thatcher",
        "explanation": "Former UK Prime Minister."
      },
      {
        "id": 4,
        "question": "Which war ended in 1918?",
        "options": ["World War I", "World War II", "Cold War", "Vietnam War"],
        "correctAnswer": "World War I",
        "explanation": "It ended on 11 November 1918."
      },
      {
        "id": 5,
        "question": "Where were the Olympic Games born?",
        "options": ["Rome", "Athens", "Olympia", "Paris"],
        "correctAnswer": "Olympia",
        "explanation": "Ancient Greece began the Olympics."
      },
      {
        "id": 6,
        "question": "Who wrote the Declaration of Independence?",
        "options": ["Lincoln", "Jefferson", "Washington", "Franklin"],
        "correctAnswer": "Jefferson",
        "explanation": "Thomas Jefferson was the main author."
      },
      {
        "id": 7,
        "question": "Which empire was ruled by Julius Caesar?",
        "options": ["Greek Empire", "Roman Empire", "Persian Empire", "Ottoman Empire"],
        "correctAnswer": "Roman Empire",
        "explanation": "Caesar led the Romans."
      },
      {
        "id": 8,
        "question": "Mona Lisa was painted by?",
        "options": ["Picasso", "Van Gogh", "Leonardo da Vinci", "Michelangelo"],
        "correctAnswer": "Leonardo da Vinci",
        "explanation": "One of the world's most famous paintings."
      },
      {
        "id": 9,
        "question": "The pyramids were built in?",
        "options": ["China", "India", "Egypt", "Peru"],
        "correctAnswer": "Egypt",
        "explanation": "Built by ancient Egyptians."
      },
      {
        "id": 10,
        "question": "Who discovered gravity?",
        "options": ["Newton", "Einstein", "Galileo", "Curie"],
        "correctAnswer": "Newton",
        "explanation": "Newton formulated the law of gravity."
      },
      {
        "id": 11,
        "question": "Which civilization used cuneiform writing?",
        "options": ["Egyptians", "Sumerians", "Romans", "Greeks"],
        "correctAnswer": "Sumerians",
        "explanation": "One of the earliest writing systems."
      },
      {
        "id": 12,
        "question": "Who was the first man on the Moon?",
        "options": ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "Michael Collins"],
        "correctAnswer": "Neil Armstrong",
        "explanation": "He landed on the Moon in 1969."
      },
      {
        "id": 13,
        "question": "Which country colonized India?",
        "options": ["USA", "France", "Britain", "Portugal"],
        "correctAnswer": "Britain",
        "explanation": "British ruled India for nearly 200 years."
      },
      {
        "id": 14,
        "question": "Who founded the Mongol Empire?",
        "options": ["Kublai Khan", "Genghis Khan", "Tamerlane", "Attila"],
        "correctAnswer": "Genghis Khan",
        "explanation": "He created the largest land empire."
      },
      {
        "id": 15,
        "question": "Which ship sank in 1912?",
        "options": ["Britannic", "Titanic", "Olympic", "Queen Mary"],
        "correctAnswer": "Titanic",
        "explanation": "Titanic sank on April 15, 1912."
      }
    ]
  },
  {
    "id": 3,
    "title": "General Science",
    "description": "Physics, Chemistry, Biology basics",
    "category": "Science",
    "difficulty": "Intermediate",
    "duration": "18 mins",
    "questions": [
      {
        "id": 1,
        "question": "What is the chemical symbol for gold?",
        "options": ["G", "Ag", "Au", "Go"],
        "correctAnswer": "Au",
        "explanation": "Au comes from Latin 'Aurum'."
      },
      {
        "id": 2,
        "question": "Which planet is closest to the Sun?",
        "options": ["Venus", "Earth", "Mercury", "Mars"],
        "correctAnswer": "Mercury",
        "explanation": "Mercury is the nearest planet."
      },
      {
        "id": 3,
        "question": "What do plants release during photosynthesis?",
        "options": ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
        "correctAnswer": "Oxygen",
        "explanation": "Plants produce oxygen."
      },
      {
        "id": 4,
        "question": "Which part of the cell contains DNA?",
        "options": ["Cytoplasm", "Nucleus", "Ribosome", "Membrane"],
        "correctAnswer": "Nucleus",
        "explanation": "DNA is stored in the nucleus."
      },
      {
        "id": 5,
        "question": "Water boils at what temperature (°C)?",
        "options": ["80", "90", "100", "110"],
        "correctAnswer": "100",
        "explanation": "Standard boiling point is 100°C."
      },
      {
        "id": 6,
        "question": "Which gas makes balloons float?",
        "options": ["Oxygen", "Helium", "Nitrogen", "Hydrogen"],
        "correctAnswer": "Helium",
        "explanation": "Helium is lighter than air."
      },
      {
        "id": 7,
        "question": "What force pulls objects to Earth?",
        "options": ["Magnetism", "Friction", "Gravity", "Pressure"],
        "correctAnswer": "Gravity",
        "explanation": "Gravity is the force of attraction."
      },
      {
        "id": 8,
        "question": "Which vitamin is produced in the skin by sunlight?",
        "options": ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        "correctAnswer": "Vitamin D",
        "explanation": "Sunlight triggers Vitamin D production."
      },
      {
        "id": 9,
        "question": "The hardest natural substance is?",
        "options": ["Gold", "Diamond", "Iron", "Platinum"],
        "correctAnswer": "Diamond",
        "explanation": "Diamond is the hardest known substance."
      },
      {
        "id": 10,
        "question": "Which part of the body controls balance?",
        "options": ["Brain", "Heart", "Ear", "Skin"],
        "correctAnswer": "Ear",
        "explanation": "Inner ear helps maintain balance."
      },
      {
        "id": 11,
        "question": "Which blood cells fight infection?",
        "options": ["Red cells", "White cells", "Platelets", "Plasma"],
        "correctAnswer": "White cells",
        "explanation": "WBCs defend the body."
      },
      {
        "id": 12,
        "question": "How many planets are in the Solar System?",
        "options": ["7", "8", "9", "10"],
        "correctAnswer": "8",
        "explanation": "Pluto is no longer a planet."
      },
      {
        "id": 13,
        "question": "What is the center of an atom called?",
        "options": ["Electron", "Proton", "Nucleus", "Molecule"],
        "correctAnswer": "Nucleus",
        "explanation": "The nucleus contains protons and neutrons."
      },
      {
        "id": 14,
        "question": "Which organ pumps blood?",
        "options": ["Lungs", "Heart", "Brain", "Kidney"],
        "correctAnswer": "Heart",
        "explanation": "The heart circulates blood."
      },
      {
        "id": 15,
        "question": "Which is the smallest unit of life?",
        "options": ["Organ", "Tissue", "Cell", "Molecule"],
        "correctAnswer": "Cell",
        "explanation": "Cells are the basic unit of life."
      }
    ]
  },
  {
    "id": 4,
    "title": "Geography Quiz",
    "description": "Countries, continents, and world geography",
    "category": "Geography",
    "difficulty": "Beginner",
    "duration": "15 mins",
    "questions": [
      {
        "id": 1,
        "question": "Which is the largest ocean?",
        "options": ["Atlantic", "Pacific", "Indian", "Arctic"],
        "correctAnswer": "Pacific",
        "explanation": "Pacific Ocean is the largest."
      },
      {
        "id": 2,
        "question": "Mount Everest is located in?",
        "options": ["India", "Nepal", "China", "Bhutan"],
        "correctAnswer": "Nepal",
        "explanation": "Everest lies between Nepal and China."
      },
      {
        "id": 3,
        "question": "Which is the capital of Japan?",
        "options": ["Tokyo", "Beijing", "Seoul", "Bangkok"],
        "correctAnswer": "Tokyo",
        "explanation": "Tokyo is the capital of Japan."
      },
      {
        "id": 4,
        "question": "Which is the longest river?",
        "options": ["Amazon", "Nile", "Ganga", "Yangtze"],
        "correctAnswer": "Nile",
        "explanation": "Nile is considered the longest river."
      },
      {
        "id": 5,
        "question": "The Sahara Desert is in?",
        "options": ["Asia", "Africa", "Australia", "America"],
        "correctAnswer": "Africa",
        "explanation": "Located in North Africa."
      },
      {
        "id": 6,
        "question": "Which continent is the largest?",
        "options": ["Africa", "Asia", "Europe", "America"],
        "correctAnswer": "Asia",
        "explanation": "Asia is the largest continent."
      },
      {
        "id": 7,
        "question": "Which country has the largest population?",
        "options": ["USA", "India", "China", "Russia"],
        "correctAnswer": "India",
        "explanation": "India is currently the most populated country."
      },
      {
        "id": 8,
        "question": "What is the capital of Australia?",
        "options": ["Sydney", "Melbourne", "Canberra", "Perth"],
        "correctAnswer": "Canberra",
        "explanation": "Canberra is the capital."
      },
      {
        "id": 9,
        "question": "Which is the smallest continent?",
        "options": ["Europe", "Australia", "Antarctica", "South America"],
        "correctAnswer": "Australia",
        "explanation": "Australia is the smallest continent by land area."
      },
      {
        "id": 10,
        "question": "Which country is known as the Land of the Rising Sun?",
        "options": ["China", "Japan", "Korea", "Thailand"],
        "correctAnswer": "Japan",
        "explanation": "Japan is called the Land of the Rising Sun."
      },
      {
        "id": 11,
        "question": "Which sea is the saltiest?",
        "options": ["Dead Sea", "Red Sea", "Black Sea", "Caspian Sea"],
        "correctAnswer": "Dead Sea",
        "explanation": "Dead Sea is extremely salty."
      },
      {
        "id": 12,
        "question": "Which island is the largest?",
        "options": ["Greenland", "Madagascar", "New Guinea", "Iceland"],
        "correctAnswer": "Greenland",
        "explanation": "Greenland is the world's largest island."
      },
      {
        "id": 13,
        "question": "Which country has the Eiffel Tower?",
        "options": ["Italy", "France", "Germany", "Greece"],
        "correctAnswer": "France",
        "explanation": "Eiffel Tower is in Paris, France."
      },
      {
        "id": 14,
        "question": "Which ocean is the smallest?",
        "options": ["Pacific", "Atlantic", "Indian", "Arctic"],
        "correctAnswer": "Arctic",
        "explanation": "Arctic Ocean is the smallest."
      },
      {
        "id": 15,
        "question": "Which country is famous for pyramids?",
        "options": ["Mexico", "China", "Egypt", "India"],
        "correctAnswer": "Egypt",
        "explanation": "Egypt is known for its ancient pyramids."
      }
    ]
  },
  {
    "id": 5,
    "title": "Sports General Knowledge",
    "description": "Important sports facts and records",
    "category": "Sports",
    "difficulty": "Beginner",
    "duration": "10 mins",
    "questions": [
      {
        "id": 1,
        "question": "Which country invented cricket?",
        "options": ["Australia", "India", "England", "South Africa"],
        "correctAnswer": "England",
        "explanation": "Cricket originated in England."
      },
      {
        "id": 2,
        "question": "How many players are in a football team?",
        "options": ["9", "10", "11", "12"],
        "correctAnswer": "11",
        "explanation": "11 players per team on the field."
      },
      {
        "id": 3,
        "question": "Who is known as the God of Cricket?",
        "options": ["Virat Kohli", "Sachin Tendulkar", "Ricky Ponting", "MS Dhoni"],
        "correctAnswer": "Sachin Tendulkar",
        "explanation": "Sachin is widely known as the God of Cricket."
      },
      {
        "id": 4,
        "question": "Which sport uses a shuttlecock?",
        "options": ["Tennis", "Badminton", "Squash", "Table Tennis"],
        "correctAnswer": "Badminton",
        "explanation": "Badminton uses a shuttlecock."
      },
      {
        "id": 5,
        "question": "How many rings are there in the Olympic symbol?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "5",
        "explanation": "Five rings represent the five continents."
      },
      {
        "id": 6,
        "question": "Which country won the 2011 Cricket World Cup?",
        "options": ["Australia", "India", "Sri Lanka", "England"],
        "correctAnswer": "India",
        "explanation": "India won the 2011 World Cup."
      },
      {
        "id": 7,
        "question": "Which sport is associated with Wimbledon?",
        "options": ["Tennis", "Football", "Hockey", "Golf"],
        "correctAnswer": "Tennis",
        "explanation": "Wimbledon is a tennis tournament."
      },
      {
        "id": 8,
        "question": "What is the national sport of Japan?",
        "options": ["Karate", "Judo", "Sumo Wrestling", "Baseball"],
        "correctAnswer": "Sumo Wrestling",
        "explanation": "Sumo is the national sport."
      },
      {
        "id": 9,
        "question": "A basketball match is played with how many players on court per team?",
        "options": ["4", "5", "6", "7"],
        "correctAnswer": "5",
        "explanation": "5 players per team."
      },
      {
        "id": 10,
        "question": "Who has won the most Olympic gold medals?",
        "options": ["Usain Bolt", "Michael Phelps", "Carl Lewis", "Mark Spitz"],
        "correctAnswer": "Michael Phelps",
        "explanation": "Phelps has 23 gold medals."
      },
      {
        "id": 11,
        "question": "Which sport is known as the gentlemen's game?",
        "options": ["Football", "Cricket", "Tennis", "Hockey"],
        "correctAnswer": "Cricket",
        "explanation": "Cricket is often called the gentlemen's game."
      },
      {
        "id": 12,
        "question": "Which game is associated with FIFA?",
        "options": ["Hockey", "Football", "Tennis", "Basketball"],
        "correctAnswer": "Football",
        "explanation": "FIFA governs world football."
      },
      {
        "id": 13,
        "question": "Which country hosts the Tour de France?",
        "options": ["Spain", "Italy", "USA", "France"],
        "correctAnswer": "France",
        "explanation": "The cycling competition is held in France."
      },
      {
        "id": 14,
        "question": "Who won the 2022 FIFA World Cup?",
        "options": ["Brazil", "France", "Argentina", "Germany"],
        "correctAnswer": "Argentina",
        "explanation": "Argentina won under Messi."
      },
      {
        "id": 15,
        "question": "What is the maximum score for a single shot in archery?",
        "options": ["8", "9", "10", "12"],
        "correctAnswer": "10",
        "explanation": "Hitting the bullseye gives 10."
      }
    ]
  }
];

export default function Home() {
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?callbackUrl=/students/students_cariculum_activities');
      return;
    }
  }, [router]);

  // State management
  const [currentView, setCurrentView] = useState('list'); // 'list', 'activity', 'results'
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [results, setResults] = useState<ActivityResults | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Handle starting an activity
  const handleStartActivity = (activity: Activity) => {
    setCurrentActivity(activity);    setUserAnswers({});
    setResults(null);
    setCurrentQuestionIndex(0);
    setCurrentView('activity');
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  // Handle activity submission
  const handleSubmitActivity = () => {
    if (!currentActivity) return;

    // Calculate results
    let correctCount = 0;
    let wrongCount = 0;
    const questionResults: QuestionResult[] = [];
    currentActivity.questions.forEach((question: ActivityOption) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      questionResults.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        isCorrect
      });
    });

    const totalQuestions = currentActivity.questions.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;

    setResults({
      correctCount,
      wrongCount,
      totalQuestions,
      scorePercentage: scorePercentage.toFixed(2),
      questionResults
    });

    setCurrentView('results');
  };

  // Handle going back to list
  const handleBackToList = () => {
    setCurrentView('list');
    setCurrentActivity(null);
    setUserAnswers({});
    setResults(null);
  };

  // Handle retry activity
  const handleRetry = () => {
    setUserAnswers({});
    setResults(null);
    setCurrentQuestionIndex(0);
    setCurrentView('activity');
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentActivity && currentQuestionIndex < currentActivity.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Render the activity list
  const renderActivityList = () => ( 
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            📚 Curriculum Activities
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive learning activities with automatic grading system
          </p>
        </header>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{activitiesData.length}</div>
              <div className="text-blue-800 font-medium">Activities</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{activitiesData.reduce((acc, act) => acc + act.questions.length, 0)}</div>
              <div className="text-green-800 font-medium">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">4</div>
              <div className="text-purple-800 font-medium">Subjects</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600">100%</div>
              <div className="text-yellow-800 font-medium">Auto-graded</div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {activitiesData.map((activity) => (
            <div 
              key={activity.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                      activity.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      activity.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.difficulty}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mt-2">{activity.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{activity.duration}</div>
                    <div className="text-xs text-gray-400">{activity.questions.length} Qs</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{activity.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {activity.category}
                  </span>
                  <div className="text-sm text-gray-500">
                    ⭐⭐⭐⭐
                  </div>
                </div>

                <button
                  onClick={() => handleStartActivity(activity)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
                >
                  Start Activity
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">🚀 How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-bold">Select Activity</h4>
                <p className="text-blue-100 text-sm">Choose from various subjects</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-bold">Answer Questions</h4>
                <p className="text-blue-100 text-sm">Complete all questions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-bold">Get Results</h4>
                <p className="text-blue-100 text-sm">Instant auto-grading</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the activity view
  const renderActivityView = () => {
    if (!currentActivity) return null;

    const currentQuestion = currentActivity.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentActivity.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBackToList}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                <span>←</span>
                <span>Back to Activities</span>
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">{currentActivity.title}</h1>
                <p className="text-gray-600 text-sm">{currentActivity.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Question</div>
                <div className="font-bold text-blue-600">{currentQuestionIndex + 1}/{currentActivity.questions.length}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 text-blue-800 rounded-lg w-10 h-10 flex items-center justify-center font-bold">
                Q{currentQuestionIndex + 1}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{currentQuestion.question}</h2>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = userAnswers[currentQuestion.id] === option;
                return (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : 'border-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={`text-lg ${isSelected ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Question Navigation */}
              <div className="flex space-x-2">
                {currentActivity.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : userAnswers[currentActivity.questions[index].id]
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-3 rounded-xl font-medium ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Previous
                </button>

                {currentQuestionIndex < currentActivity.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitActivity}
                    disabled={Object.keys(userAnswers).length < currentActivity.questions.length}
                    className={`px-6 py-3 font-medium rounded-xl ${
                      Object.keys(userAnswers).length < currentActivity.questions.length
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    }`}
                  >
                    Submit All Answers
                  </button>
                )}
              </div>
            </div>

            {/* Answer Status */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(userAnswers).length}
                  </div>
                  <div className="text-sm text-gray-600">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {currentActivity.questions.length - Object.keys(userAnswers).length}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentActivity.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the results view
  const renderResultsView = () => {
    if (!results || !currentActivity) return null;

    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreMessage = (score: number) => {
      if (score >= 90) return '🎉 Outstanding! Perfect score!';
      if (score >= 80) return '🌟 Excellent work!';
      if (score >= 70) return '👍 Great job!';
      if (score >= 60) return '😊 Good effort!';
      if (score >= 50) return '📚 Keep practicing!';
      return '💪 Try again, you can do better!';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBackToList}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                <span>←</span>
                <span>Back to Activities</span>
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">Activity Results</h1>
                <p className="text-gray-600">{currentActivity.title}</p>
              </div>
              <button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl"
              >
                Retry Activity
              </button>
            </div>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Correct Answers */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg p-6 text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{results.correctCount}</div>
              <div className="text-green-800 font-bold text-lg mb-1">Correct</div>
              <div className="text-green-700 text-sm">
                {Math.round((results.correctCount / results.totalQuestions) * 100)}% of total
              </div>
              <div className="mt-4">
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${(results.correctCount / results.totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Wrong Answers */}
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-lg p-6 text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">{results.wrongCount}</div>
              <div className="text-red-800 font-bold text-lg mb-1">Wrong</div>
              <div className="text-red-700 text-sm">
                {Math.round((results.wrongCount / results.totalQuestions) * 100)}% of total
              </div>
              <div className="mt-4">
                <div className="w-full bg-red-200 rounded-full h-3">
                  <div 
                    className="bg-red-600 h-3 rounded-full"
                    style={{ width: `${(results.wrongCount / results.totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-6 text-center">
              <div className={`text-5xl font-bold ${getScoreColor(parseFloat(results.scorePercentage))} mb-2`}>
                {results.scorePercentage}%
              </div>
              <div className="text-blue-800 font-bold text-lg mb-1">Overall Score</div>
              <div className="text-blue-700 text-sm">
                {getScoreMessage(parseFloat(results.scorePercentage))}
              </div>
              <div className="mt-4">
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      parseFloat(results.scorePercentage) >= 80 ? 'bg-green-600' :
                      parseFloat(results.scorePercentage) >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                    }`}
                    style={{ width: `${results.scorePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Detailed Question Review</h2>
            
            <div className="space-y-6">
              {results.questionResults.map((result, index) => (
                <div 
                  key={index}
                  className={`border-2 rounded-xl p-5 ${
                    result.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      result.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {result.isCorrect ? (
                        <span className="text-white font-bold text-lg">✓</span>
                      ) : (
                        <span className="text-white font-bold text-lg">✗</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-3">
                        Q{index + 1}: {result.question}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Your Answer:</div>
                          <div className={`font-medium p-3 rounded-lg ${
                            result.isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.userAnswer || 'Not answered'}
                          </div>
                        </div>
                        
                        {!result.isCorrect && (
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Correct Answer:</div>
                            <div className="font-medium bg-green-100 text-green-800 p-3 rounded-lg">
                              {result.correctAnswer}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm text-gray-500 mb-1">Explanation:</div>
                        <div className="bg-gray-50 text-gray-700 p-3 rounded-lg">
                          {result.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-600">
                  <span className="font-medium">Performance: </span>
                  {parseFloat(results.scorePercentage) >= 80 ? 'Excellent' : 
                   parseFloat(results.scorePercentage) >= 60 ? 'Good' : 
                   parseFloat(results.scorePercentage) >= 40 ? 'Average' : 'Needs Improvement'}
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleBackToList}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-xl"
                  >
                    Back to Activities
                  </button>
                  <button
                    onClick={handleRetry}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render switch
  return (
    <DashboardLayout role="students">
      <>
        {currentView === 'list' && renderActivityList()}
        {currentView === 'activity' && renderActivityView()}
        {currentView === 'results' && renderResultsView()}
      </>
    </DashboardLayout>
  );
}