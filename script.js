function create_table(data) {
    let input = document.getElementById('research');
    renderQuizzes(data);

    input.addEventListener("input", (event) => {
        let inputValue = event.target.value.toLowerCase();
        sortDataByMaxTFIDFByField(inputValue, data);
    });
}

function renderQuizzes(data) {
    // Get the quiz container element
    let quizContainer = document.getElementById('quiz-container');

    // Clear existing content in the container
    quizContainer.innerHTML = '';

    // Loop through the quiz data and create a div for each quiz
    data.forEach(quiz => {
        // Create the quiz div
        let quizDiv = document.createElement('div');
        quizDiv.classList.add('quiz');
        
        let nameCreator;
        if (imgPath == "coeur.png") {
            // Create h3 element for Name Creator
            nameCreator = document.createElement('h4');
            nameCreator.textContent = quiz.from;
            nameCreator.style.marginTop = '10px';
            nameCreator.style.textAlign = 'left';
            nameCreator.style.paddingLeft = '23px';
        };

        // Create a button with a link for Name Quiz
        let nameQuizButton = document.createElement('button');
        nameQuizButton.classList.add('button');
        nameQuizButton.setAttribute('name', 'quiz');
        nameQuizButton.textContent = quiz.name;
        nameQuizButton.style.marginTop = '15px';

        let quizLink = document.createElement('a');
        quizLink.href = '/';
        quizLink.appendChild(nameQuizButton);

        (function (currentQuiz) {
            quizLink.addEventListener('click', async function (event) {
                event.preventDefault(); // Prevent the default behavior of the link
    
                // Perform a POST request when the link is clicked
                fetch('/play', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quizId: currentQuiz._id }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // Handle success
                    window.location.href = '/play';
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            });
        })(quiz);

        // Create container div for Like Count and Like Button
        let likeContainer = document.createElement('div');
        likeContainer.style.display = 'flex';
        likeContainer.style.justifyContent = 'right';
        likeContainer.style.paddingRight = '18px';
        
        let likeCount;
        if (imgPath == "coeur.png") {
            // Create h4 element for Like Count
            likeCount = document.createElement('h4');
            likeCount.classList.add('compteur-like');
            likeCount.textContent = `${quiz.like}`;
            likeCount.style.marginTop = '9px';
        };

        // Create button for Like
        let likeButton = document.createElement('button');
        likeButton.classList.add('coeur');

        (function (currentQuiz) {
            likeButton.addEventListener('click', async function (event) {
                // Perform a POST request when the button is clicked
                fetch(appPath, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quizId: currentQuiz._id }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // Handle success
                    window.location.href = goTo;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            });
        })(quiz);

        let heartImage = document.createElement('img');
        heartImage.src = imgPath;
        heartImage.style.width = '30px';
        heartImage.style.height = '30px';
        likeButton.appendChild(heartImage);

        // Append Like Count and Like Button to the container
        if (imgPath == "coeur.png") { 
            likeContainer.appendChild(likeCount);
        };
        likeContainer.appendChild(likeButton);

        // Append all elements to the quiz div
        if (imgPath == "coeur.png") {
            quizDiv.appendChild(nameCreator);
        };
        quizDiv.appendChild(quizLink);
        quizDiv.appendChild(likeContainer);

        // Append the quiz div to the container
        quizContainer.appendChild(quizDiv);
    });
}
  
function sortDataByMaxTFIDFByField(inputValue, data) {

    function cleanDocument(doc) {
        const accents = /[àáâãäåèéêëìíîïòóôõöùúûüýÿ]/g;
        const equivalents = ['a', 'a', 'a', 'a', 'a', 'a', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'y'];
        const cleanedDocument = doc.replace(accents, (match) => equivalents[accents.source.indexOf(match)]);
        return cleanedDocument.replace(/[^a-zA-Z0-9]/g, ' ');
    }

    // Function to calculate TFIDF for a term in a document
    function calculateTFIDF(term, document, documents) {
        // Remove (non-alphabetic and non-numeric) characters from the document
        let cleanedDocument = cleanDocument(document);
        term = cleanDocument(term);
    
        const termFrequency = cleanedDocument.split(' ').filter(word => word.toLowerCase().includes(term.toLowerCase())).length;
        const tf = Math.log(1 + termFrequency / cleanedDocument.length);
        
        const documentFrequency = documents.filter(doc => cleanDocument(doc).split(' ').includes(term)).length;
        const idf = Math.log(documents.length / (1 + documentFrequency));
    
        return tf * idf;
    }
    

    // Function to calculate the maximum TFIDF for a given field in the data
    function calculateMaxTFIDFForField(field, item, documents) {
        const document = item[field];
        const terms = inputValue.split(' ');

        let sum = 0;
        terms.forEach(word => {
            if (word != ' ') {
                sum += calculateTFIDF(word, document, documents);
            };
        });

        return sum;
    }

    // Function to calculate the overall max TFIDF for each field and sort the data
    function calculateOverallMaxTFIDFAndSort() {
        category = data.map(item => item.category);
        quizName = data.map(item => item.name);
        from = data.map(item => item.from);
        const sortedData = data.sort((a, b) => {
            const maxTFIDFA = Math.max(
                calculateMaxTFIDFForField('category', a, category),
                calculateMaxTFIDFForField('name', a, quizName),
                calculateMaxTFIDFForField('from', a, from)
            );

            const maxTFIDFB = Math.max(
                calculateMaxTFIDFForField('category', b, category),
                calculateMaxTFIDFForField('name', b, quizName),
                calculateMaxTFIDFForField('from', b, from)
            );

            return maxTFIDFB - maxTFIDFA;
        });

        renderQuizzes(sortedData);
    }

    return calculateOverallMaxTFIDFAndSort();
}
