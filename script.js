/**
 * NeuroQuiz - Futuristic Quiz Web App
 * Advanced single-page application with cinematic UI/UX
 * Features: Particles, glassmorphism, animations, gamification, responsive design
 */

class NeuroQuiz {
  constructor() {
    this.currentScreen = 'loading';
    this.quizData = [];
    this.currentQuestion = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.comboStreak = 0;
    this.maxCombo = 0;
    this.questionStartTime = 0;
    this.questionTimes = [];
    this.timerInterval = null;
    this.remainingTime = 30;
    this.isAnswering = false;
    
    // Quiz config
    this.questionsPerQuiz = 10;
    this.currentDifficulty = 'medium';
    this.currentCategory = 'tech';
    
    // Elements cache
    this.elements = {};
    
    // Game state
    this.gameState = {
      isSoundOn: true,
      isDarkMode: true,
      highScores: JSON.parse(localStorage.getItem('neuroquiz-scores')) || [],
      playerStats: JSON.parse(localStorage.getItem('neuroquiz-stats')) || {
        totalQuizzes: 0,
        totalScore: 0,
        xp: 0
      }
    };
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadThemes();
    this.startLoadingSequence();
    this.generateParticles();
    this.updateStatsNumbers();
    this.initCustomCursor();
    this.generateQuizData();
  }

  cacheElements() {
    const selectors = {
      loadingScreen: '#loadingScreen',
      appContainer: '#appContainer',
      screens: {
        landing: '#landingScreen',
        quiz: '#quizScreen',
        results: '#resultsScreen'
      },
      startQuizBtn: '#startQuizBtn',
      restartQuizBtn: '#restartQuizBtn',
      shareResultsBtn: '#shareResultsBtn',
      themeToggle: '#themeToggle',
      soundToggle: '#soundToggle',
      menuBtn: '#menuBtn',
      closeMenuBtn: '#closeMenuBtn',
      mobileMenu: '#mobileMenu',
      categorySelect: '#categorySelect',
      difficultySelect: '#difficultySelect',
      questionCountSelect: '#questionCountSelect',
      progressFill: '#progressFill',
      questionCounter: '#questionCounter',
      totalQuestions: '#totalQuestions',
      currentScore: '#currentScore',
      comboStreak: '#comboStreak',
      questionTimer: '#questionTimer',
      questionText: '#questionText',
      answersGrid: '#answersGrid',
      aiTip: '#aiTip',
      scoreCircle: '#scoreCircle',
      finalScore: '#finalScore',
      correctCount: '#correctCount',
      accuracyPercent: '#accuracyPercent',
      xpEarned: '#xpEarned',
      finalRank: '#finalRank',
      leaderboardList: '#leaderboardList',
      particleField: '#particleField'
    };

    Object.entries(selectors).forEach(([key, selector]) => {
      this.elements[key] = typeof selector === 'string' ? document.querySelector(selector) : selector;
    });
  }

  bindEvents() {
    // Navigation
    this.elements.startQuizBtn?.addEventListener('click', () => this.startQuiz());
    this.elements.restartQuizBtn?.addEventListener('click', () => this.restartQuiz());
    this.elements.shareResultsBtn?.addEventListener('click', () => this.shareResults());
    
    // Controls
    this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
    this.elements.soundToggle?.addEventListener('click', () => this.toggleSound());
    this.elements.menuBtn?.addEventListener('click', () => this.toggleMobileMenu());
    this.elements.closeMenuBtn?.addEventListener('click', () => this.toggleMobileMenu());
    
    // Quiz setup
    this.elements.categorySelect?.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.generateQuizData();
    });
    
    this.elements.difficultySelect?.addEventListener('change', (e) => {
      this.currentDifficulty = e.target.value;
      this.generateQuizData();
    });
    
    this.elements.questionCountSelect?.addEventListener('change', (e) => {
      this.questionsPerQuiz = parseInt(e.target.value);
      this.elements.totalQuestions.textContent = this.questionsPerQuiz;
      this.generateQuizData();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  startLoadingSequence() {
    setTimeout(() => {
      this.elements.loadingScreen.classList.add('hidden');
      this.elements.appContainer.classList.remove('hidden');
      setTimeout(() => {
        this.elements.loadingScreen.style.display = 'none';
      }, 500);
    }, 3000);
  }

  generateParticles() {
    const particleField = this.elements.particleField;
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle-bg';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 10 + 's';
      particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
      particleField.appendChild(particle);
    }
  }

  updateStatsNumbers() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    stats.forEach(stat => {
      const target = parseInt(stat.dataset.target);
      const increment = target / 100;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target;
          clearInterval(timer);
        } else {
          stat.textContent = Math.floor(current);
        }
      }, 20);
    });
  }

  initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    // Magnetic hover effect
    document.querySelectorAll('.cta-button, .answer-option').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  generateQuizData() {
    const categories = {
      tech: [
        { q: "What does 'API' stand for?", a: ["Application Programming Interface", "Advanced Processing Integration", "Automated Program Interaction", "Application Process Integration"], c: 0 },
        { q: "Which company developed JavaScript?", a: ["Netscape", "Microsoft", "Google", "Apple"], c: 0 },
        { q: "What is React?", a: ["JavaScript library", "Programming language", "Database", "Server"], c: 0 },
        { q: "CSS stands for?", a: ["Cascading Style Sheets", "Computer Style System", "Creative Style Solution", "Cascading Script System"], c: 0 },
        { q: "What does HTML stand for?", a: ["HyperText Markup Language", "HighTech Modern Language", "Home Tool Markup Language", "HyperTransfer Markup Language"], c: 0 },
        { q: "Which is a NoSQL database?", a: ["MongoDB", "MySQL", "PostgreSQL", "SQLite"], c: 0 },
        { q: "What is Docker?", a: ["Containerization platform", "Programming language", "Web framework", "Cloud service"], c: 0 },
        { q: "REST is an architectural style for?", a: ["Web services", "Database design", "Frontend development", "Mobile apps"], c: 0 },
        { q: "What is Git?", a: ["Version control system", "Text editor", "Package manager", "Build tool"], c: 0 },
        { q: "Which protocol is used for secure web?", a: ["HTTPS", "HTTP", "FTP", "SMTP"], c: 0 },
        { q: "What does AWS stand for?", a: ["Amazon Web Services", "Advanced Web Solutions", "Amazon Web System", "Automated Web Services"], c: 0 },
        { q: "TypeScript is a superset of?", a: ["JavaScript", "Python", "Java", "C#"], c: 0 },
        { q: "What is WebAssembly?", a: ["Binary instruction format", "CSS framework", "JavaScript engine", "HTTP protocol"], c: 0 },
        { q: "Which is a CSS-in-JS solution?", a: ["Styled Components", "Webpack", "Babel", "ESLint"], c: 0 },
        { q: "What is CI/CD?", a: ["Continuous Integration/Deployment", "Custom Interface/Design", "Cloud Infrastructure/Delivery", "Code Inspection/Debugging"], c: 0 },
        { q: "GraphQL was developed by?", a: ["Facebook", "Google", "Microsoft", "Amazon"], c: 0 },
        { q: "What is a Progressive Web App?", a: ["Web app with native-like experience", "Mobile-first website", "Static website", "Backend service"], c: 0 },
        { q: "Which is a state management library?", a: ["Redux", "Express", "Webpack", "Jest"], c: 0 },
        { q: "What does SaaS stand for?", a: ["Software as a Service", "System as Service", "Solution as Service", "Server as Service"], c: 0 },
        { q: "Microservices architecture emphasizes?", a: ["Small, independent services", "Monolithic applications", "Single database", "Centralized control"], c: 0 }
      ],
      science: [
        { q: "What is the chemical symbol for gold?", a: ["Au", "Ag", "Fe", "Pb"], c: 0 },
        { q: "Which planet is known as the Red Planet?", a: ["Mars", "Venus", "Jupiter", "Saturn"], c: 0 },
        { q: "What is H2O?", a: ["Water", "Hydrogen", "Oxygen", "Salt"], c: 0 },
        { q: "Who developed the theory of relativity?", a: ["Albert Einstein", "Isaac Newton", "Stephen Hawking", "Galileo Galilei"], c: 0 },
        { q: "What is the largest organ in the human body?", a: ["Skin", "Liver", "Heart", "Brain"], c: 0 }
      ],
      history: [
        { q: "In what year did World War II end?", a: ["1945", "1939", "1941", "1950"], c: 0 },
        { q: "Who was the first President of the USA?", a: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"], c: 0 },
        { q: "What ancient wonder is in Egypt?", a: ["Pyramids of Giza", "Hanging Gardens", "Colossus of Rhodes", "Lighthouse of Alexandria"], c: 0 }
      ],
      general: [
        { q: "What is the largest ocean on Earth?", a: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], c: 0 },
        { q: "How many continents are there?", a: ["7", "5", "6", "8"], c: 0 },
        { q: "What is the capital of France?", a: ["Paris", "London", "Berlin", "Madrid"], c: 0 }
      ]
    };

    // Filter and randomize questions based on category and difficulty
    let availableQuestions = categories[this.currentCategory] || categories.tech;
    
    if (this.currentDifficulty === 'easy') {
      availableQuestions = availableQuestions.slice(0, 10);
    } else if (this.currentDifficulty === 'hard') {
      availableQuestions = availableQuestions.slice(-10);
    }

    this.quizData = availableQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, this.questionsPerQuiz)
      .map((q, index) => ({
        ...q,
        id: index,
        timeSpent: 0
      }));
  }

  startQuiz() {
    this.currentQuestion = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.comboStreak = 0;
    this.maxCombo = 0;
    this.questionTimes = [];
    this.isAnswering = false;
    
    this.switchScreen('quiz');
    this.renderQuestion();
    this.elements.totalQuestions.textContent = this.questionsPerQuiz;
    this.startQuestionTimer();
  }

  renderQuestion() {
    const question = this.quizData[this.currentQuestion];
    if (!question) return;

    this.elements.questionText.textContent = question.q;
    
    // Shuffle answers but keep correct one in place
    const answers = [...question.a];
    const shuffledAnswers = this.shuffleArray(answers);
    
    this.elements.answersGrid.innerHTML = shuffledAnswers.map((answer, index) => {
      const isCorrect = question.a[question.c] === answer;
      return `
        <div class="answer-option" data-answer="${answer}" data-index="${index}" data-correct="${isCorrect}">
          ${answer}
        </div>
      `;
    }).join('');

    // Bind answer events
    document.querySelectorAll('.answer-option').forEach(option => {
      option.addEventListener('click', (e) => this.selectAnswer(e));
    });

    // Update AI tip
    const tips = [
      "Take a deep breath and think carefully...",
      "The answer is closer than you think!",
      "Trust your neural network instincts!",
      "Eliminate the obviously wrong answers first.",
      "Visualize the concept in your mind..."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    this.elements.aiTip.textContent = randomTip;

    this.updateProgress();
  }

  selectAnswer(e) {
    if (this.isAnswering) return;
    
    this.isAnswering = true;
    const option = e.currentTarget;
    const selectedAnswer = option.dataset.answer;
    const question = this.quizData[this.currentQuestion];
    const correctAnswer = question.a[question.c];
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Visual feedback
    document.querySelectorAll('.answer-option').forEach(opt => {
      opt.style.pointerEvents = 'none';
      if (opt.dataset.answer === correctAnswer) {
        opt.classList.add('correct');
      } else if (opt === option && !isCorrect) {
        opt.classList.add('incorrect');
      }
    });

    // Score calculation
    const timeBonus = Math.max(0, Math.floor((this.remainingTime / 30) * 100));
    const streakBonus = this.comboStreak * 10;
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[this.currentDifficulty];
    
    let points = 0;
    if (isCorrect) {
      points = Math.floor((100 + timeBonus + streakBonus) * difficultyMultiplier);
      this.correctAnswers++;
      this.comboStreak++;
      this.maxCombo = Math.max(this.maxCombo, this.comboStreak);
    } else {
      this.comboStreak = 0;
    }
    
    this.score += points;
    this.questionTimes.push(30 - this.remainingTime);
    
    // Update UI
    this.updateScore();
    this.createRippleEffect(option);

    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }

  nextQuestion() {
    this.currentQuestion++;
    
    if (this.currentQuestion >= this.questionsPerQuiz) {
      this.showResults();
    } else {
      this.renderQuestion();
      this.startQuestionTimer();
      this.isAnswering = false;
    }
  }

  startQuestionTimer() {
    this.remainingTime = 30;
    this.questionStartTime = Date.now();
    this.elements.questionTimer.textContent = this.remainingTime;
    
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.elements.questionTimer.textContent = this.remainingTime;
      
      if (this.remainingTime <= 0) {
        clearInterval(this.timerInterval);
        if (!this.isAnswering) {
          this.comboStreak = 0;
          this.updateScore();
          setTimeout(() => this.nextQuestion(), 1000);
        }
      }
    }, 1000);
  }

  updateProgress() {
    const progress = ((this.currentQuestion) / this.questionsPerQuiz) * 100;
    this.elements.progressFill.style.width = progress + '%';
    this.elements.questionCounter.textContent = this.currentQuestion + 1;
  }

  updateScore() {
    this.elements.currentScore.textContent = this.score;
    this.elements.comboStreak.textContent = this.comboStreak + 'x';
    
    if (this.comboStreak > 0) {
      this.elements.comboStreak.parentElement.classList.add('streak-active');
    } else {
      this.elements.comboStreak.parentElement.classList.remove('streak-active');
    }
  }

  showResults() {
    clearInterval(this.timerInterval);
    
    const accuracy = this.questionsPerQuiz > 0 ? Math.round((this.correctAnswers / this.questionsPerQuiz) * 100) : 0;
    const avgTime = this.questionTimes.length > 0 ? 
      Math.round(this.questionTimes.reduce((a, b) => a + b, 0) / this.questionTimes.length) : 0;
    
    // Calculate XP and rank
    const xp = Math.floor(this.score * 0.1);
    const rank = this.calculateRank(accuracy, this.maxCombo);
    
    // Animate score reveal
    this.animateScoreReveal(this.score);
    
    this.elements.finalScore.textContent = this.score;
    this.elements.correctCount.textContent = `${this.correctAnswers}/${this.questionsPerQuiz}`;
    this.elements.accuracyPercent.textContent = `${accuracy}%`;
    this.elements.xpEarned.textContent = xp;
    this.elements.finalRank.textContent = rank;
    
    // Update player stats
    this.gameState.playerStats.totalQuizzes++;
    this.gameState.playerStats.totalScore += this.score;
    this.gameState.playerStats.xp += xp;
    
    // Save high score
    const scoreEntry = {
      score: this.score,
      date: new Date().toISOString(),
      accuracy,
      questions: this.questionsPerQuiz,
      difficulty: this.currentDifficulty
    };
    this.gameState.highScores.unshift(scoreEntry);
    this.gameState.highScores = this.gameState.highScores.slice(0, 10);
    
    this.saveGameState();
    this.renderLeaderboard();
    this.renderCharts();
    
    if (accuracy >= 90) {
      this.launchConfetti();
    }
    
    this.switchScreen('results');
  }

  animateScoreReveal(targetScore) {
    let currentScore = 0;
    const increment = targetScore / 50;
    const timer = setInterval(() => {
      currentScore += increment;
      if (currentScore >= targetScore) {
        this.elements.finalScore.textContent = Math.floor(targetScore);
        clearInterval(timer);
      } else {
        this.elements.finalScore.textContent = Math.floor(currentScore);
      }
    }, 30);
  }

  calculateRank(accuracy, maxCombo) {
    if (accuracy >= 95 && maxCombo >= 8) return 'Quantum Master';
    if (accuracy >= 90) return 'Neural Elite';
    if (accuracy >= 80) return 'Synaptic Pro';
    if (accuracy >= 70) return 'Circuit Breaker';
    if (accuracy >= 60) return 'Node Navigator';
    return 'Rookie';
  }

  renderLeaderboard() {
    const leaderboardList = this.elements.leaderboardList;
    leaderboardList.innerHTML = this.gameState.highScores.map((score, index) => `
      <div class="leaderboard-item">
        <div class="rank">${index + 1}</div>
        <div class="score">${score.score}</div>
        <div class="details">${score.accuracy}% • ${score.difficulty}</div>
      </div>
    `).join('');
  }

  renderCharts() {
    // Simple canvas charts for performance visualization
    this.renderPerformanceChart();
    this.renderTimeChart();
  }

  renderPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;
    
    // Simple bar chart for correct/incorrect
    const correct = this.correctAnswers;
    const incorrect = this.questionsPerQuiz - correct;
    const maxHeight = 120;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Correct bar
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(50, canvas.height - 40 - (correct / this.questionsPerQuiz * maxHeight), 40, maxHeight);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(50, canvas.height - 40 - (correct / this.questionsPerQuiz * maxHeight), 40, 8);
    
    // Incorrect bar
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(110, canvas.height - 40 - (incorrect / this.questionsPerQuiz * maxHeight), 40, maxHeight);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(110, canvas.height - 40 - (incorrect / this.questionsPerQuiz * maxHeight), 40, 8);
  }

  renderTimeChart() {
    const canvas = document.getElementById('timeChart');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple line chart for time spent per question
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    this.questionTimes.forEach((time, index) => {
      const x = 50 + (index / this.questionsPerQuiz) * 200;
      const y = canvas.height - 40 - (time / 30 * 100);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }

  switchScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`${screen}Screen`).classList.add('active');
    this.currentScreen = screen;
  }

  restartQuiz() {
    this.switchScreen('landing');
    this.elements.categorySelect.value = this.currentCategory;
    this.elements.difficultySelect.value = this.currentDifficulty;
    this.elements.questionCountSelect.value = this.questionsPerQuiz;
  }

  shareResults() {
    if (navigator.share) {
      navigator.share({
        title: 'NeuroQuiz Score',
        text: `I scored ${this.score} points on NeuroQuiz! Can you beat it?`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`I scored ${this.score} points on NeuroQuiz! Beat my score: ${window.location.href}`);
      this.showToast('Score copied to clipboard!');
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    this.gameState.isDarkMode = !isDark;
    this.elements.themeToggle.querySelector('i').className = isDark ? 
      'fas fa-sun' : 'fas fa-moon';
    this.saveGameState();
  }

  toggleSound() {
    this.gameState.isSoundOn = !this.gameState.isSoundOn;
    const icon = this.elements.soundToggle.querySelector('i');
    icon.className = this.gameState.isSoundOn ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    this.saveGameState();
  }

  toggleMobileMenu() {
    this.elements.mobileMenu.classList.toggle('active');
  }

  handleKeyPress(e) {
    if (this.currentScreen !== 'quiz') return;
    
    if (e.key >= '1' && e.key <= '4') {
      const options = document.querySelectorAll('.answer-option');
      const option = options[parseInt(e.key) - 1];
      if (option) option.click();
    }
  }

  createRippleEffect(element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  launchConfetti() {
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        this.createConfetti();
      }, i * 10);
    }
  }

  createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  saveGameState() {
    localStorage.setItem('neuroquiz-scores', JSON.stringify(this.gameState.highScores));
    localStorage.setItem('neuroquiz-stats', JSON.stringify(this.gameState.playerStats));
    localStorage.setItem('neuroquiz-settings', JSON.stringify({
      isDarkMode: this.gameState.isDarkMode,
      isSoundOn: this.gameState.isSoundOn
    }));
  }

  loadThemes() {
    const settings = JSON.parse(localStorage.getItem('neuroquiz-settings')) || {};
    if (!settings.isDarkMode) {
      this.toggleTheme();
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-gradient-primary);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.neuroQuiz = new NeuroQuiz();
});

// Add global resize handler for responsive adjustments
window.addEventListener('resize', () => {
  if (window.neuroQuiz) {
    window.neuroQuiz.updateStatsNumbers();
  }
});

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
