// script.js

const screens = {
  home: document.getElementById("homeScreen"),
  builder: document.getElementById("builderScreen"),
  generated: document.getElementById("generatedScreen"),
  quiz: document.getElementById("quizScreen"),
  result: document.getElementById("resultScreen")
};

const customQuestions = [];

let activeQuestions = [];
let currentQuestion = 0;
let score = 0;

// SCREEN SWITCHING

function showScreen(screenName){
  Object.values(screens).forEach(screen=>{
    screen.classList.remove("active");
  });

  screens[screenName].classList.add("active");
}

function goHome(){
  showScreen("home");
}

document.getElementById("customQuizBtn").onclick = () => {
  showScreen("builder");
};

document.getElementById("generatedQuizBtn").onclick = () => {
  showScreen("generated");
};

// ADD CUSTOM QUESTIONS

function addQuestion(){

  const question = document.getElementById("questionInput").value.trim();
  const option1 = document.getElementById("option1").value.trim();
  const option2 = document.getElementById("option2").value.trim();
  const option3 = document.getElementById("option3").value.trim();
  const option4 = document.getElementById("option4").value.trim();

  const correctOption = Number(
    document.getElementById("correctOption").value
  );

  if(
    !question ||
    !option1 ||
    !option2 ||
    !option3 ||
    !option4
  ){
    alert("Fill all fields");
    return;
  }

  if(correctOption < 1 || correctOption > 4){
    alert("Correct option must be 1-4");
    return;
  }

  customQuestions.push({
    question,
    options:[option1, option2, option3, option4],
    answer: correctOption - 1
  });

  renderQuestionList();
  clearInputs();
}

function renderQuestionList(){

  const list = document.getElementById("questionList");

  list.innerHTML = "";

  customQuestions.forEach((q,index)=>{

    const div = document.createElement("div");

    div.classList.add("question-item");

    div.innerHTML = `
      <strong>Q${index+1}:</strong> ${q.question}
      <br><br>
      <button onclick="deleteQuestion(${index})">
        Delete
      </button>
    `;

    list.appendChild(div);
  });

}

function deleteQuestion(index){
  customQuestions.splice(index,1);
  renderQuestionList();
}

function clearInputs(){

  document.getElementById("questionInput").value = "";
  document.getElementById("option1").value = "";
  document.getElementById("option2").value = "";
  document.getElementById("option3").value = "";
  document.getElementById("option4").value = "";
  document.getElementById("correctOption").value = "";

}

// START CUSTOM QUIZ

function startCustomQuiz(){

  if(customQuestions.length < 1){
    alert("Add at least one question");
    return;
  }

  activeQuestions = [...customQuestions];

  beginQuiz();
}

// GENERATED QUIZZES

const generatedQuizzes = {

  science: [
    {
      question:"What is the SI unit of force?",
      options:["Newton","Pascal","Joule","Volt"],
      answer:0
    },
    {
      question:"Which gas is used in photosynthesis?",
      options:["Oxygen","Nitrogen","Carbon Dioxide","Helium"],
      answer:2
    },
    {
      question:"Water freezes at?",
      options:["0°C","100°C","50°C","10°C"],
      answer:0
    },
    {
      question:"Planet known as Red Planet?",
      options:["Earth","Mars","Jupiter","Venus"],
      answer:1
    },
    {
      question:"Human heart has how many chambers?",
      options:["2","3","4","5"],
      answer:2
    }
  ],

  math: [
    {
      question:"What is 12 × 8?",
      options:["96","88","108","86"],
      answer:0
    },
    {
      question:"Square root of 144?",
      options:["10","11","12","13"],
      answer:2
    },
    {
      question:"Value of π approximately?",
      options:["2.14","3.14","4.13","3.41"],
      answer:1
    },
    {
      question:"7² equals?",
      options:["14","21","49","77"],
      answer:2
    },
    {
      question:"What is 15% of 200?",
      options:["20","25","30","40"],
      answer:2
    }
  ],

  history: [
    {
      question:"Who built the Taj Mahal?",
      options:["Akbar","Shah Jahan","Aurangzeb","Babur"],
      answer:1
    },
    {
      question:"India became independent in?",
      options:["1945","1946","1947","1950"],
      answer:2
    },
    {
      question:"Who was first President of India?",
      options:["Nehru","Rajendra Prasad","Gandhi","Patel"],
      answer:1
    },
    {
      question:"Which movement was led by Gandhi?",
      options:["Quit India","French Revolution","Renaissance","None"],
      answer:0
    },
    {
      question:"Who discovered America?",
      options:["Columbus","Newton","Einstein","Akbar"],
      answer:0
    }
  ],

  english: [
    {
      question:"Synonym of Happy?",
      options:["Sad","Joyful","Angry","Tired"],
      answer:1
    },
    {
      question:"Choose correct spelling",
      options:["Definately","Definitely","Definetly","Defnatly"],
      answer:1
    },
    {
      question:"Noun in sentence 'Rahul runs fast'",
      options:["runs","fast","Rahul","none"],
      answer:2
    },
    {
      question:"Opposite of Dark?",
      options:["Night","Light","Black","Shadow"],
      answer:1
    },
    {
      question:"Plural of Child?",
      options:["Childs","Childes","Children","Childrens"],
      answer:2
    }
  ]
};

function loadGeneratedQuiz(){

  const subject = document.getElementById("subjectSelect").value;

  activeQuestions = generatedQuizzes[subject];

  beginQuiz();
}

// QUIZ ENGINE

function beginQuiz(){

  currentQuestion = 0;
  score = 0;

  showScreen("quiz");

  loadQuestion();
}

function loadQuestion(){

  const q = activeQuestions[currentQuestion];

  document.getElementById("questionText").innerText = q.question;

  document.getElementById("progressText").innerText =
    `Question ${currentQuestion + 1}/${activeQuestions.length}`;

  document.getElementById("scoreText").innerText =
    `Score: ${score}`;

  const optionsContainer =
    document.getElementById("optionsContainer");

  optionsContainer.innerHTML = "";

  q.options.forEach((option,index)=>{

    const btn = document.createElement("button");

    btn.classList.add("option-btn");

    btn.innerText = option;

    btn.onclick = () => selectAnswer(index);

    optionsContainer.appendChild(btn);

  });

}

function selectAnswer(selected){

  const correct =
    activeQuestions[currentQuestion].answer;

  if(selected === correct){
    score++;
  }

  currentQuestion++;

  if(currentQuestion < activeQuestions.length){
    loadQuestion();
  }else{
    endQuiz();
  }

}

function endQuiz(){

  showScreen("result");

  document.getElementById("finalScore").innerText =
    `You scored ${score} out of ${activeQuestions.length}`;

}

function restartQuiz(){

  goHome();

}
