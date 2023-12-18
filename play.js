function game(quiz, score = 0, currentQuestionIndex = 0, correctIndex = 0) {
    function displayQuestion() {
    const questionContainer = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    
    let rightAsnwer = quiz.quiz[currentQuestionIndex][1][0];
    questionContainer.textContent = quiz.quiz[currentQuestionIndex][0];

    optionsContainer.innerHTML = '';
    const options = shuffleArray(quiz.quiz[currentQuestionIndex][1]);
    correctIndex = quiz.quiz[currentQuestionIndex][1].indexOf(rightAsnwer);
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(button);
    });
    }

    function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
    }

    function checkAnswer(selectedIndex) {
    if (selectedIndex === correctIndex) {
        score++; // Increment score for correct answer
    }
    nextQuestion();
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < quiz.quiz.length) {
        displayQuestion();
        } else {
        sendScoreToServer();
        }
    }

    function sendScoreToServer() {
        // Send a POST request to "/endquiz" with the final score
        fetch('/endquiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ score: score })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.href = '/';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Initial display
    displayQuestion();
};
