function addAnswerField(questionNumber) {
    const answersContainer = document.getElementById(`answersContainer${questionNumber}`);
    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.name = `answer${questionNumber}[]`;
    answerInput.placeholder = 'Enter answer';
    answersContainer.appendChild(answerInput);
}

function addQuestionField() {
    questionCounter++;
    console.log(questionCounter);
    const form = document.getElementById('quizForm');

    const questionContainer = document.createElement('div');
    questionContainer.classList.add('question-container');

    const label = document.createElement('label');
    label.htmlFor = `question${questionCounter}`;
    label.textContent = `Question ${questionCounter}:`;

    const input = document.createElement('input');
    input.type = 'text';
    input.name = `question${questionCounter}`;
    input.required = true;

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.textContent = 'Add Answer';
    addButton.onclick = () => addAnswerField(questionCounter);

    const answersContainer = document.createElement('div');
    answersContainer.id = `answersContainer${questionCounter}`;

    questionContainer.appendChild(label);
    questionContainer.appendChild(input);
    questionContainer.appendChild(addButton);
    questionContainer.appendChild(answersContainer);

    form.insertBefore(questionContainer, form.lastElementChild);
}

async function submitQuizz(event, user) {
    event.preventDefault();

    // get today's date (DD-MM-YY)
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()%100}`;
    const formData = {
        quiz: [],
        from: user,
        like: 0,
        name: document.getElementsByName('name')[0].value,
        date: formattedDate,
        category: document.getElementsByName('category')[0].value,
    };

    for (let i = 1; i <= questionCounter; i++) {
        const question = document.getElementsByName(`question${i}`)[0].value;
        const answers = Array.from(document.getElementsByName(`answer${i}[]`)).map(answerInput => answerInput.value);
        formData.quiz.push([question, answers]);
    }

    fetch('/creation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: formData })
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
