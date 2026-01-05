import React, { useState, useEffect, useCallback, useRef } from 'react';

// Trivia statements pool - mix of obscure facts
const TRIVIA_STATEMENTS = [
  "An ostrich's eye is bigger than its brain.",
  "A jiffy is an actual unit of time equal to 1/100th of a second.",
  "The inventor of the Pringles can is buried in one.",
  "Honey never spoils and 3000-year-old honey is still edible.",
  "A group of flamingos is called a flamboyance.",
  "The shortest war in history lasted 38 minutes.",
  "Bananas are berries, but strawberries are not.",
  "Venus is the only planet that spins clockwise.",
  "A cloud can weigh more than a million pounds.",
  "Octopuses have three hearts and blue blood.",
  "The Eiffel Tower can grow six inches in summer heat.",
  "A sneeze travels at about 100 miles per hour.",
  "Cows have best friends and get stressed when separated.",
  "The unicorn is Scotland's national animal.",
  "Cleopatra lived closer in time to the Moon landing than to the pyramids.",
  "There are more possible chess games than atoms in the universe.",
  "A day on Venus is longer than a year on Venus.",
  "Sharks existed before trees evolved.",
  "Hot water freezes faster than cold water under certain conditions.",
  "The inventor of the frisbee was turned into a frisbee after death.",
  "Wombat droppings are cube-shaped.",
  "The longest hiccuping spree lasted 68 years.",
  "A cockroach can live for weeks without its head.",
  "The dot over the letter i is called a tittle.",
  "Dolphins sleep with one eye open.",
  "The Great Wall of China is not visible from space with naked eye.",
  "Crows can recognize human faces and hold grudges.",
  "A bolt of lightning is five times hotter than the sun's surface.",
  "The human nose can detect over one trillion different scents.",
  "Oxford University is older than the Aztec Empire."
];

// Distractor novel statements for recognition test
const NOVEL_STATEMENTS = [
  "Elephants are the only animals that cannot jump.",
  "A goldfish has a memory span of about three months.",
  "The longest English word without a vowel is 'rhythms'.",
  "A hummingbird weighs less than a penny.",
  "The average person walks about 100,000 miles in a lifetime.",
  "Butterflies taste with their feet.",
  "A snail can sleep for three years.",
  "Polar bears have black skin under their white fur.",
  "The moon is slowly drifting away from Earth.",
  "Sloths can hold their breath longer than dolphins."
];

// AI/Tech words for Stroop task
const TECH_WORDS = ['CLAUDE', 'CHATGPT', 'GOOGLE', 'WIKIPEDIA', 'BROWSER', 'SEARCH', 'ALEXA', 'SIRI'];
const NEUTRAL_WORDS = ['PENCIL', 'CHAIR', 'HAMMER', 'BOTTLE', 'CARPET', 'WINDOW', 'BASKET', 'CANDLE'];

// Phases
const PHASES = {
  INTRO: 'intro',
  ENCODING: 'encoding',
  DISTRACTOR: 'distractor',
  RECALL: 'recall',
  RECOGNITION: 'recognition',
  LOCATION: 'location',
  STROOP_INTRO: 'stroop_intro',
  STROOP_HARD: 'stroop_hard',
  STROOP_EASY: 'stroop_easy',
  RESULTS: 'results'
};

// Hard trivia questions for Stroop priming
const HARD_QUESTIONS = [
  "Did Benjamin Franklin give piano lessons?",
  "Is the atomic number of Zinc 30?",
  "Was the Treaty of Westphalia signed in 1648?",
  "Did Mozart compose exactly 41 symphonies?",
  "Is the capital of Myanmar called Naypyidaw?"
];

const EASY_QUESTIONS = [
  "Is the sky blue on a clear day?",
  "Does water freeze at 0 degrees Celsius?",
  "Is Paris the capital of France?",
  "Do cats have four legs?",
  "Is the sun hot?"
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [participantId] = useState(() => `P${Date.now()}`);
  const [startTime] = useState(() => new Date().toISOString());
  
  // Encoding phase state
  const [statements, setStatements] = useState([]);
  const [currentStatementIndex, setCurrentStatementIndex] = useState(0);
  const [encodingData, setEncodingData] = useState([]);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  // Distractor phase state
  const [distractorTimeLeft, setDistractorTimeLeft] = useState(120);
  const [mathProblem, setMathProblem] = useState(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathResults, setMathResults] = useState([]);
  
  // Recall phase state
  const [recalledStatements, setRecalledStatements] = useState('');
  
  // Recognition phase state
  const [recognitionItems, setRecognitionItems] = useState([]);
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);
  const [recognitionResponses, setRecognitionResponses] = useState([]);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  
  // Location memory phase state
  const [locationItems, setLocationItems] = useState([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [locationResponses, setLocationResponses] = useState([]);
  
  // Stroop phase state
  const [stroopTrials, setStroopTrials] = useState([]);
  const [currentStroopIndex, setCurrentStroopIndex] = useState(0);
  const [stroopData, setStroopData] = useState({ hard: [], easy: [] });
  const [stroopStartTime, setStroopStartTime] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showingQuestion, setShowingQuestion] = useState(true);
  
  // Results
  const [results, setResults] = useState(null);
  
  const inputRef = useRef(null);

  // Initialize statements on mount
  useEffect(() => {
    const shuffled = shuffleArray(TRIVIA_STATEMENTS).slice(0, 20);
    const withConditions = shuffled.map((statement, index) => ({
      id: index,
      text: statement,
      condition: index < 10 ? 'saved' : 'deleted',
      folder: index < 10 ? ['FACTS', 'DATA', 'INFO', 'NOTES', 'ITEMS'][index % 5] : null
    }));
    setStatements(shuffleArray(withConditions));
  }, []);

  // Generate math problem
  const generateMathProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 20) + 10;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer;
    switch(op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '×': answer = a * b; break;
      default: answer = a + b;
    }
    return { problem: `${a} ${op} ${b}`, answer };
  }, []);

  // Distractor timer
  useEffect(() => {
    if (phase === PHASES.DISTRACTOR && distractorTimeLeft > 0) {
      const timer = setTimeout(() => setDistractorTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === PHASES.DISTRACTOR && distractorTimeLeft === 0) {
      setPhase(PHASES.RECALL);
    }
  }, [phase, distractorTimeLeft]);

  // Initialize math problem
  useEffect(() => {
    if (phase === PHASES.DISTRACTOR && !mathProblem) {
      setMathProblem(generateMathProblem());
    }
  }, [phase, mathProblem, generateMathProblem]);

  // Focus input when phase changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, currentStatementIndex, currentRecognitionIndex]);

  // Handle reading timer for encoding phase
  useEffect(() => {
    if (phase === PHASES.ENCODING && readingStartTime) {
      const timer = setTimeout(() => {
        setShowContinueButton(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, readingStartTime]);

  // Reset reading state when moving to new statement
  useEffect(() => {
    if (phase === PHASES.ENCODING) {
      setReadingStartTime(Date.now());
      setShowContinueButton(false);
    }
  }, [phase, currentStatementIndex]);

  // Handle statement reading submission (mobile-friendly)
  const handleStatementSubmit = () => {
    const currentStatement = statements[currentStatementIndex];
    const readingTime = Date.now() - readingStartTime;
    setEncodingData(prev => [...prev, {
      statementId: currentStatement.id,
      statement: currentStatement.text,
      condition: currentStatement.condition,
      folder: currentStatement.folder,
      readingTime,
      timestamp: Date.now()
    }]);

    if (currentStatementIndex < statements.length - 1) {
      setCurrentStatementIndex(i => i + 1);
    } else {
      setPhase(PHASES.DISTRACTOR);
      setMathProblem(generateMathProblem());
    }
  };

  // Handle math answer
  const handleMathSubmit = () => {
    const correct = parseInt(mathAnswer) === mathProblem.answer;
    setMathResults(prev => [...prev, { problem: mathProblem.problem, correct }]);
    setMathAnswer('');
    setMathProblem(generateMathProblem());
  };

  // Handle recall submission
  const handleRecallSubmit = () => {
    // Prepare recognition items
    const seenStatements = statements.map(s => ({ text: s.text, seen: true, id: s.id }));
    const novelItems = shuffleArray(NOVEL_STATEMENTS).slice(0, 10).map((text, i) => ({ 
      text, 
      seen: false, 
      id: `novel_${i}` 
    }));
    setRecognitionItems(shuffleArray([...seenStatements, ...novelItems]));
    setPhase(PHASES.RECOGNITION);
  };

  // Handle recognition response
  const handleRecognitionResponse = (response) => {
    const item = recognitionItems[currentRecognitionIndex];
    setRecognitionResponses(prev => [...prev, {
      itemId: item.id,
      text: item.text,
      wasSeen: item.seen,
      respondedSeen: response,
      correct: item.seen === response,
      timestamp: Date.now()
    }]);
    
    if (currentRecognitionIndex < recognitionItems.length - 1) {
      setCurrentRecognitionIndex(i => i + 1);
    } else {
      // Prepare location memory items (only saved items)
      const savedItems = statements.filter(s => s.condition === 'saved');
      setLocationItems(shuffleArray(savedItems));
      setPhase(PHASES.LOCATION);
    }
  };

  // Handle location response
  const handleLocationResponse = (folder) => {
    const item = locationItems[currentLocationIndex];
    setLocationResponses(prev => [...prev, {
      statementId: item.id,
      statement: item.text,
      actualFolder: item.folder,
      respondedFolder: folder,
      correct: item.folder === folder,
      timestamp: Date.now()
    }]);
    
    if (currentLocationIndex < locationItems.length - 1) {
      setCurrentLocationIndex(i => i + 1);
    } else {
      setPhase(PHASES.STROOP_INTRO);
    }
  };

  // Initialize Stroop trials
  const initializeStroopTrials = () => {
    const colors = ['red', 'blue'];
    const allWords = [...TECH_WORDS, ...NEUTRAL_WORDS];
    const trials = allWords.map(word => ({
      word,
      type: TECH_WORDS.includes(word) ? 'tech' : 'neutral',
      color: colors[Math.floor(Math.random() * 2)]
    }));
    return shuffleArray(trials);
  };

  // Start Stroop hard condition
  const startStroopHard = () => {
    setStroopTrials(initializeStroopTrials());
    setCurrentStroopIndex(0);
    setCurrentQuestionIndex(0);
    setShowingQuestion(true);
    setPhase(PHASES.STROOP_HARD);
  };

  // Handle question answer (just moves to Stroop trial)
  const handleQuestionAnswer = () => {
    setShowingQuestion(false);
    setStroopStartTime(Date.now());
  };

  // Handle Stroop response
  const handleStroopResponse = useCallback((respondedColor) => {
    const trial = stroopTrials[currentStroopIndex];
    const rt = Date.now() - stroopStartTime;
    const correct = respondedColor === trial.color;
    
    const dataKey = phase === PHASES.STROOP_HARD ? 'hard' : 'easy';
    setStroopData(prev => ({
      ...prev,
      [dataKey]: [...prev[dataKey], {
        word: trial.word,
        wordType: trial.type,
        color: trial.color,
        respondedColor,
        correct,
        rt,
        questionIndex: currentQuestionIndex
      }]
    }));
    
    if (currentStroopIndex < stroopTrials.length - 1) {
      // Move to next trial or next question
      if ((currentStroopIndex + 1) % 3 === 0 && currentQuestionIndex < 4) {
        setCurrentQuestionIndex(q => q + 1);
        setShowingQuestion(true);
      } else {
        setStroopStartTime(Date.now());
      }
      setCurrentStroopIndex(i => i + 1);
    } else {
      // End of block
      if (phase === PHASES.STROOP_HARD) {
        setStroopTrials(initializeStroopTrials());
        setCurrentStroopIndex(0);
        setCurrentQuestionIndex(0);
        setShowingQuestion(true);
        setPhase(PHASES.STROOP_EASY);
      } else {
        calculateResults();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stroopTrials, currentStroopIndex, stroopStartTime, phase, currentQuestionIndex]);

  // Keyboard handler for Stroop (kept for desktop support)
  useEffect(() => {
    if ((phase === PHASES.STROOP_HARD || phase === PHASES.STROOP_EASY) && !showingQuestion) {
      const handleKeyPress = (e) => {
        if (e.key === 'e' || e.key === 'E') {
          handleStroopResponse('blue');
        } else if (e.key === 'i' || e.key === 'I') {
          handleStroopResponse('red');
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [phase, showingQuestion, handleStroopResponse]);

  // Handle touch/swipe for recognition
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Only recognize horizontal swipes (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right = Yes
        handleRecognitionResponse(true);
      } else {
        // Swipe left = No
        handleRecognitionResponse(false);
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Calculate results
  const calculateResults = () => {
    // Parse recalled statements
    const recalledList = recalledStatements
      .split('\n')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
    
    // Score free recall
    const savedStatements = statements.filter(s => s.condition === 'saved');
    const deletedStatements = statements.filter(s => s.condition === 'deleted');
    
    const scoreRecall = (statementList) => {
      return statementList.filter(s => 
        recalledList.some(recalled => 
          recalled.includes(s.text.toLowerCase().slice(0, 20)) ||
          s.text.toLowerCase().includes(recalled.slice(0, 20))
        )
      ).length;
    };
    
    const savedRecalled = scoreRecall(savedStatements);
    const deletedRecalled = scoreRecall(deletedStatements);
    
    // Score recognition
    const savedRecognition = recognitionResponses.filter(r => 
      statements.find(s => s.id === r.itemId)?.condition === 'saved'
    );
    const deletedRecognition = recognitionResponses.filter(r =>
      statements.find(s => s.id === r.itemId)?.condition === 'deleted'
    );
    const novelRecognition = recognitionResponses.filter(r => 
      r.itemId.toString().startsWith('novel')
    );
    
    // Location memory
    const locationCorrect = locationResponses.filter(r => r.correct).length;
    
    // Stroop analysis
    const analyzeStroop = (trials) => {
      const techTrials = trials.filter(t => t.wordType === 'tech' && t.correct);
      const neutralTrials = trials.filter(t => t.wordType === 'neutral' && t.correct);
      return {
        techMeanRT: techTrials.length > 0 ? techTrials.reduce((a, t) => a + t.rt, 0) / techTrials.length : 0,
        neutralMeanRT: neutralTrials.length > 0 ? neutralTrials.reduce((a, t) => a + t.rt, 0) / neutralTrials.length : 0,
        techN: techTrials.length,
        neutralN: neutralTrials.length
      };
    };
    
    const hardStroop = analyzeStroop(stroopData.hard);
    const easyStroop = analyzeStroop(stroopData.easy);
    
    // Google Effect coefficient
    // Positive = more interference for tech words after hard questions
    const googleEffect = (hardStroop.techMeanRT - hardStroop.neutralMeanRT) - 
                         (easyStroop.techMeanRT - easyStroop.neutralMeanRT);
    
    // Offloading Effect coefficient
    // Positive = remembered deleted items better than saved items
    const offloadingEffect = (deletedRecalled / 10) - (savedRecalled / 10);
    
    const calculatedResults = {
      participantId,
      startTime,
      endTime: new Date().toISOString(),
      
      // Free recall
      freeRecall: {
        savedRecalled,
        deletedRecalled,
        savedTotal: 10,
        deletedTotal: 10,
        offloadingEffect: offloadingEffect.toFixed(3)
      },
      
      // Recognition
      recognition: {
        savedHitRate: (savedRecognition.filter(r => r.correct).length / savedRecognition.length).toFixed(3),
        deletedHitRate: (deletedRecognition.filter(r => r.correct).length / deletedRecognition.length).toFixed(3),
        falseAlarmRate: (novelRecognition.filter(r => r.respondedSeen).length / novelRecognition.length).toFixed(3)
      },
      
      // Location memory
      locationMemory: {
        correct: locationCorrect,
        total: locationResponses.length,
        accuracy: (locationCorrect / locationResponses.length).toFixed(3)
      },
      
      // Stroop
      stroop: {
        hard: hardStroop,
        easy: easyStroop,
        googleEffectMs: googleEffect.toFixed(1)
      },
      
      // Raw data
      rawData: {
        encodingData,
        recalledStatements,
        recognitionResponses,
        locationResponses,
        stroopData,
        mathResults
      }
    };
    
    setResults(calculatedResults);
    setPhase(PHASES.RESULTS);
  };

  // Download results
  const downloadResults = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-effect-${participantId}.json`;
    a.click();
  };

  // Render functions
  const renderIntro = () => (
    <div className="phase-container intro">
      <h1>🧠 The Personal Offloading Test</h1>
      <p className="subtitle">A self-experiment on the Google Effect</p>
      
      <div className="info-box">
        <h3>What You'll Do</h3>
        <ol>
          <li><strong>Learn facts</strong> — Type 20 trivia statements (some "saved", some "deleted")</li>
          <li><strong>Distraction</strong> — 2 minutes of math problems</li>
          <li><strong>Recall</strong> — Write down what you remember</li>
          <li><strong>Recognition</strong> — Identify which statements you saw</li>
          <li><strong>Location</strong> — Remember where items were "saved"</li>
          <li><strong>Stroop test</strong> — Quick color-naming task</li>
        </ol>
        <p><strong>Time required:</strong> ~15 minutes</p>
      </div>
      
      <div className="info-box hypothesis">
        <h3>The Hypothesis</h3>
        <p>The <strong>Google Effect</strong> (Sparrow et al., 2011) suggests we remember information 
        differently when we expect to be able to look it up later. Specifically:</p>
        <ul>
          <li>We remember <em>where</em> to find information better than the information itself</li>
          <li>We remember "deletable" information better than "saveable" information</li>
          <li>After encountering hard questions, tech-related words interfere with our thinking</li>
        </ul>
      </div>
      
      <button className="primary-btn" onClick={() => setPhase(PHASES.ENCODING)}>
        Begin Experiment →
      </button>
    </div>
  );

  const renderEncoding = () => {
    const currentStatement = statements[currentStatementIndex];
    if (!currentStatement) return null;

    return (
      <div className="phase-container encoding">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStatementIndex + 1) / statements.length) * 100}%` }}
          />
        </div>
        <p className="progress-text">Statement {currentStatementIndex + 1} of {statements.length}</p>

        <div className="statement-display">
          <p className="statement-text">{currentStatement.text}</p>
        </div>

        <div className={`condition-badge ${currentStatement.condition}`}>
          {currentStatement.condition === 'saved'
            ? `📁 This will be SAVED to folder: ${currentStatement.folder}`
            : '🗑️ This will be DELETED'}
        </div>

        <div className="input-section">
          <p className="instruction">Read this statement carefully</p>
          <button
            className="primary-btn"
            onClick={handleStatementSubmit}
            disabled={!showContinueButton}
          >
            {showContinueButton ? 'Continue →' : 'Reading...'}
          </button>
          {!showContinueButton && (
            <p className="instruction" style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.7 }}>
              Button will activate in a moment
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderDistractor = () => (
    <div className="phase-container distractor">
      <h2>⏱️ Quick Math Break</h2>
      <p className="timer">Time remaining: {Math.floor(distractorTimeLeft / 60)}:{(distractorTimeLeft % 60).toString().padStart(2, '0')}</p>
      
      <div className="math-problem">
        <p className="problem-text">{mathProblem?.problem} = ?</p>
        <input
          ref={inputRef}
          type="number"
          value={mathAnswer}
          onChange={(e) => setMathAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleMathSubmit()}
          placeholder="Your answer"
        />
        <button className="primary-btn" onClick={handleMathSubmit}>Submit</button>
      </div>
      
      <p className="math-score">
        Correct: {mathResults.filter(r => r.correct).length} / {mathResults.length}
      </p>
    </div>
  );

  const renderRecall = () => (
    <div className="phase-container recall">
      <h2>📝 Free Recall</h2>
      <p className="instruction">
        Write down as many of the trivia statements as you can remember.
        <br />One statement per line. Don't worry about exact wording.
      </p>
      
      <textarea
        ref={inputRef}
        value={recalledStatements}
        onChange={(e) => setRecalledStatements(e.target.value)}
        placeholder="Type each statement you remember on a new line..."
        rows={12}
      />
      
      <button className="primary-btn" onClick={handleRecallSubmit}>
        Continue to Recognition Test →
      </button>
    </div>
  );

  const renderRecognition = () => {
    const item = recognitionItems[currentRecognitionIndex];
    if (!item) return null;

    return (
      <div
        className="phase-container recognition"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentRecognitionIndex + 1) / recognitionItems.length) * 100}%` }}
          />
        </div>
        <p className="progress-text">Item {currentRecognitionIndex + 1} of {recognitionItems.length}</p>

        <h2>Did you see this statement?</h2>

        <div className="statement-display recognition-item">
          <p className="statement-text">"{item.text}"</p>
        </div>

        <p className="swipe-hint">Swipe left for No, right for Yes</p>

        <div className="response-buttons">
          <button
            className="response-btn no"
            onClick={() => handleRecognitionResponse(false)}
          >
            ← No, this is new
          </button>
          <button
            className="response-btn yes"
            onClick={() => handleRecognitionResponse(true)}
          >
            Yes, I saw this →
          </button>
        </div>
      </div>
    );
  };

  const renderLocation = () => {
    const item = locationItems[currentLocationIndex];
    if (!item) return null;
    
    const folders = ['FACTS', 'DATA', 'INFO', 'NOTES', 'ITEMS'];
    
    return (
      <div className="phase-container location">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentLocationIndex + 1) / locationItems.length) * 100}%` }}
          />
        </div>
        <p className="progress-text">Item {currentLocationIndex + 1} of {locationItems.length}</p>
        
        <h2>Where was this saved?</h2>
        
        <div className="statement-display">
          <p className="statement-text">"{item.text}"</p>
        </div>
        
        <div className="folder-buttons">
          {folders.map(folder => (
            <button
              key={folder}
              className="folder-btn"
              onClick={() => handleLocationResponse(folder)}
            >
              📁 {folder}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStroopIntro = () => (
    <div className="phase-container stroop-intro">
      <h2>🎨 Color Naming Task</h2>

      <div className="info-box">
        <h3>Instructions</h3>
        <p>You'll see words appear in <span style={{color: 'red'}}>RED</span> or <span style={{color: 'blue'}}>BLUE</span>.</p>
        <p>Your task: <strong>Tap the COLOR of the word as quickly as possible.</strong></p>
        <p>Ignore what the word says — only respond to its color!</p>

        <div className="key-instructions">
          <p><strong>Tap LEFT side</strong> for <span style={{color: 'blue'}}>BLUE</span></p>
          <p><strong>Tap RIGHT side</strong> for <span style={{color: 'red'}}>RED</span></p>
        </div>

        <p>Before some trials, you'll answer a trivia question. Just answer yes/no based on your best guess.</p>
      </div>

      <button className="primary-btn" onClick={startStroopHard}>
        Start Color Naming →
      </button>
    </div>
  );

  const renderStroop = () => {
    const questions = phase === PHASES.STROOP_HARD ? HARD_QUESTIONS : EASY_QUESTIONS;

    if (showingQuestion) {
      return (
        <div className="phase-container stroop">
          <p className="phase-label">{phase === PHASES.STROOP_HARD ? 'Block 1: Hard Questions' : 'Block 2: Easy Questions'}</p>

          <div className="question-display">
            <p className="question-text">{questions[currentQuestionIndex]}</p>
          </div>

          <div className="response-buttons">
            <button className="response-btn" onClick={handleQuestionAnswer}>Yes</button>
            <button className="response-btn" onClick={handleQuestionAnswer}>No</button>
            <button className="response-btn" onClick={handleQuestionAnswer}>Don't Know</button>
          </div>
        </div>
      );
    }

    const trial = stroopTrials[currentStroopIndex];
    if (!trial) return null;

    return (
      <div className="phase-container stroop-task">
        <p className="phase-label">{phase === PHASES.STROOP_HARD ? 'Block 1' : 'Block 2'}</p>
        <p className="progress-text">Trial {currentStroopIndex + 1} of {stroopTrials.length}</p>

        <div className="stroop-tap-zones">
          <div
            className="tap-zone blue-zone"
            onClick={() => handleStroopResponse('blue')}
          >
            <div className="stroop-word" style={{ color: trial.color }}>
              {trial.word}
            </div>
          </div>
          <div
            className="tap-zone red-zone"
            onClick={() => handleStroopResponse('red')}
          >
            <div className="stroop-word" style={{ color: trial.color }}>
              {trial.word}
            </div>
          </div>
        </div>

        <div className="tap-hint">
          <span>← Tap left for BLUE</span>
          <span>Tap right for RED →</span>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;
    
    const offloadingInterpretation = parseFloat(results.freeRecall.offloadingEffect) > 0 
      ? "You remembered MORE 'deleted' items than 'saved' items — consistent with the Google Effect!"
      : parseFloat(results.freeRecall.offloadingEffect) < 0
      ? "You remembered MORE 'saved' items — opposite of the Google Effect prediction."
      : "No difference between saved and deleted items.";
    
    const googleInterpretation = parseFloat(results.stroop.googleEffectMs) > 20
      ? "Tech words slowed you down more after hard questions — possible Google Effect!"
      : parseFloat(results.stroop.googleEffectMs) < -20
      ? "Tech words slowed you down more after EASY questions — opposite of prediction."
      : "No meaningful difference in tech word interference between conditions.";
    
    return (
      <div className="phase-container results">
        <h1>📊 Your Results</h1>
        
        <div className="results-section">
          <h3>Free Recall: The Offloading Effect</h3>
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">"Saved" Items Recalled</p>
              <p className="result-value">{results.freeRecall.savedRecalled} / 10</p>
            </div>
            <div className="result-card">
              <p className="result-label">"Deleted" Items Recalled</p>
              <p className="result-value">{results.freeRecall.deletedRecalled} / 10</p>
            </div>
            <div className="result-card highlight">
              <p className="result-label">Offloading Effect</p>
              <p className="result-value">{(parseFloat(results.freeRecall.offloadingEffect) * 100).toFixed(0)}%</p>
            </div>
          </div>
          <p className="interpretation">{offloadingInterpretation}</p>
        </div>
        
        <div className="results-section">
          <h3>Recognition Memory</h3>
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">Saved Hit Rate</p>
              <p className="result-value">{(parseFloat(results.recognition.savedHitRate) * 100).toFixed(0)}%</p>
            </div>
            <div className="result-card">
              <p className="result-label">Deleted Hit Rate</p>
              <p className="result-value">{(parseFloat(results.recognition.deletedHitRate) * 100).toFixed(0)}%</p>
            </div>
            <div className="result-card">
              <p className="result-label">False Alarm Rate</p>
              <p className="result-value">{(parseFloat(results.recognition.falseAlarmRate) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
        
        <div className="results-section">
          <h3>Location Memory</h3>
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">Folders Correctly Identified</p>
              <p className="result-value">{results.locationMemory.correct} / {results.locationMemory.total}</p>
              <p className="result-subtext">({(parseFloat(results.locationMemory.accuracy) * 100).toFixed(0)}%)</p>
            </div>
          </div>
          <p className="interpretation">
            Chance level: 20%. Your accuracy: {(parseFloat(results.locationMemory.accuracy) * 100).toFixed(0)}%
            {parseFloat(results.locationMemory.accuracy) > 0.3 
              ? " — You remembered WHERE information was stored, consistent with transactive memory theory!"
              : " — Location memory was near chance."}
          </p>
        </div>
        
        <div className="results-section">
          <h3>Stroop Task: The Google Effect</h3>
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">After Hard Questions</p>
              <p className="result-subtext">Tech words: {results.stroop.hard.techMeanRT.toFixed(0)}ms</p>
              <p className="result-subtext">Neutral words: {results.stroop.hard.neutralMeanRT.toFixed(0)}ms</p>
            </div>
            <div className="result-card">
              <p className="result-label">After Easy Questions</p>
              <p className="result-subtext">Tech words: {results.stroop.easy.techMeanRT.toFixed(0)}ms</p>
              <p className="result-subtext">Neutral words: {results.stroop.easy.neutralMeanRT.toFixed(0)}ms</p>
            </div>
            <div className="result-card highlight">
              <p className="result-label">Google Effect</p>
              <p className="result-value">{results.stroop.googleEffectMs}ms</p>
            </div>
          </div>
          <p className="interpretation">{googleInterpretation}</p>
        </div>
        
        <div className="actions">
          <button className="primary-btn" onClick={downloadResults}>
            📥 Download Full Data (JSON)
          </button>
        </div>
        
        <div className="info-box methodology">
          <h3>About This Test</h3>
          <p>This experiment is based on Sparrow, Liu & Wegner (2011) "Google Effects on Memory" 
          published in <em>Science</em>. Note that the original "Google Stroop" effect failed to 
          replicate in a 2018 study, though the save/delete memory effects have been more robust.</p>
          <p>Your individual results are just one data point — don't over-interpret them!</p>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="app">
      <header className="app-header">
        <a href="https://www.personalscience.com" className="header-logo" target="_blank" rel="noopener noreferrer">
          <img
            src="https://substackcdn.com/image/fetch/w_80,h_80,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F1828eda5-30a7-4da9-bf5a-b69251ab6875_184x184.png"
            alt="Personal Science"
            className="logo-image"
          />
          <span className="logo-text">Personal Science</span>
        </a>
        <div className="header-links">
          <a
            href="https://github.com/personalscience/google-effect-test"
            className="github-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>View Source</span>
          </a>
        </div>
      </header>
      {phase === PHASES.INTRO && renderIntro()}
      {phase === PHASES.ENCODING && renderEncoding()}
      {phase === PHASES.DISTRACTOR && renderDistractor()}
      {phase === PHASES.RECALL && renderRecall()}
      {phase === PHASES.RECOGNITION && renderRecognition()}
      {phase === PHASES.LOCATION && renderLocation()}
      {phase === PHASES.STROOP_INTRO && renderStroopIntro()}
      {(phase === PHASES.STROOP_HARD || phase === PHASES.STROOP_EASY) && renderStroop()}
      {phase === PHASES.RESULTS && renderResults()}
    </div>
  );
}

export default App;
