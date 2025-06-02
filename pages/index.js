import { useState, useEffect } from 'react';
import Head from 'next/head';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
// CES-D questions and scoring options

const CESD_QUESTIONS = [
  "I was bothered by things that usually don't bother me",
  "I did not feel like eating; my appetite was poor",
  "I felt that I could not shake off the blues even with help from my family or friends",
  "I felt I was just as good as other people",
  "I had trouble keeping my mind on what I was doing",
  "I felt depressed",
  "I felt that everything I did was an effort",
  "I felt hopeful about the future",
  "I thought my life had been a failure",
  "I felt fearful",
  "My sleep was restless",
  "I was happy",
  "I talked less than usual",
  "I felt lonely",
  "People were unfriendly",
  "I enjoyed life",
  "I had crying spells",
  "I felt sad",
  "I felt that people dislike me",
  "I could not get 'going'"
];

// Reverse scored items (questions 4, 8, 12, 16 - 0-indexed: 3, 7, 11, 15)
const REVERSE_SCORED = [3, 7, 11, 15];

const SCORE_OPTIONS = [
  { value: 0, label: "Rarely or none of the time", sublabel: "(less than 1 day)" },
  { value: 1, label: "Some or a little of the time", sublabel: "(1–2 days)" },
  { value: 2, label: "Occasionally or moderate amount", sublabel: "(3–4 days)" },
  { value: 3, label: "Most or all of the time", sublabel: "(5–7 days)" }
];

export default function Home() {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    // PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: parseInt(value)
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    
    for (let i = 0; i < CESD_QUESTIONS.length; i++) {
      let score = answers[i] || 0;
      
      // Reverse score for positive items
      if (REVERSE_SCORED.includes(i)) {
        score = 3 - score;
      }
      
      totalScore += score;
    }
    
    return totalScore;
  };

  const getInterpretation = (score) => {
    if (score <= 15) {
      return {
        level: "Minimal symptoms",
        description: "Your responses suggest minimal depressive symptoms. This is within the normal range.",
        color: "text-green-600 dark:text-green-400",
        icon: "fas fa-check-circle"
      };
    } else if (score <= 26) {
      return {
        level: "Mild to moderate symptoms",
        description: "Your responses suggest mild to moderate depressive symptoms. Consider speaking with a healthcare professional if these feelings persist.",
        color: "text-yellow-600 dark:text-yellow-400",
        icon: "fas fa-exclamation-triangle"
      };
    } else {
      return {
        level: "Possible major depression",
        description: "Your responses suggest significant depressive symptoms. We strongly recommend consulting with a mental health professional for proper evaluation and support.",
        color: "text-red-600 dark:text-red-400",
        icon: "fas fa-exclamation-circle"
      };
    }
  };

  const handleSubmit = () => {
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < CESD_QUESTIONS.length) {
      alert(`Please answer all questions. You have ${CESD_QUESTIONS.length - answeredQuestions} questions remaining.`);
      return;
    }
    setShowResults(true);
  };

  const resetAssessment = () => {
    setAnswers({});
    setShowResults(false);
  };

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const score = showResults ? calculateScore() : 0;
  const interpretation = showResults ? getInterpretation(score) : null;

  return (
    <>
      <Head>
        <title>CES-D Depression Self-Assessment</title>
        <meta name="description" content="Anonymous depression self-assessment using the CES-D scale" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex-1">
                <i className="fas fa-heart text-blue-500 mr-2"></i>
                CES-D Assessment
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Toggle dark mode"
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
            </div>
            
            {!showResults && (
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                Center for Epidemiologic Studies Depression Scale
              </p>
            )}

            {/* Install App Prompt */}
            {showInstallPrompt && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-download text-blue-500 mr-2"></i>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Install this app for easy access
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={installApp}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Install
                    </button>
                    <button
                      onClick={() => setShowInstallPrompt(false)}
                      className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Privacy Notice */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-shield-alt text-blue-500 mr-3 mt-1"></i>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Privacy Notice</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This test is completely anonymous and your responses are not stored anywhere. 
                  All processing happens locally on your device.
                </p>
              </div>
            </div>
          </div>

          {!showResults ? (
            /* Assessment Form */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Please indicate how often you have felt this way during the <strong>past week</strong>:
                </p>
              </div>

              {CESD_QUESTIONS.map((question, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-800 dark:text-white font-medium mb-4">
                    {index + 1}. {question}
                  </h3>
                  
                  <div className="space-y-2">
                    {SCORE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-start cursor-pointer group">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option.value}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="mt-1 mr-3 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <div className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                            {option.label}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {option.sublabel}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Progress Indicator */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {Object.keys(answers).length} / {CESD_QUESTIONS.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / CESD_QUESTIONS.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <i className="fas fa-calculator mr-2"></i>
                Calculate My Score
              </button>
            </div>
          ) : (
            /* Results */
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="mb-4">
                  <i className={`${interpretation.icon} text-4xl ${interpretation.color} mb-2`}></i>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Your CES-D Score: {score}
                  </h2>
                  <h3 className={`text-xl font-semibold ${interpretation.color} mb-4`}>
                    {interpretation.level}
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {interpretation.description}
                </p>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    <i className="fas fa-info-circle mr-2"></i>
                    Important Note
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    This assessment is a screening tool and not a diagnostic instrument. 
                    For proper evaluation and treatment, please consult with a qualified mental health professional.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={resetAssessment}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Take Again
                  </button>
                  
                  {score > 15 && (
                    <a
                      href="https://www.samhsa.gov/find-help/national-helpline"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <i className="fas fa-phone mr-2"></i>
                      Get Help
                    </a>
                  )}
                </div>
              </div>

              {/* Score Interpretation Guide */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                  <i className="fas fa-chart-bar mr-2"></i>
                  Score Interpretation Guide
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">0-15:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Minimal symptoms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">16-26:</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Mild to moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">27+:</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">Possible major depression</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Based on the Center for Epidemiologic Studies Depression Scale (CES-D)</p>
            <p className="mt-2">
              <i className="fas fa-heart text-red-400 mr-1"></i>
              Take care of your mental health
              </p>
            </footer>
          </div>
        </div>
      </>
  );
}