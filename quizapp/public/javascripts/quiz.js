/**
 * Created by Cathal on 04/01/14.
 */
var index = 0;
var totalScore = 0;
/*var allQuestions = [{question: "Who is the prime minister of Great Britain?",
 choices: ["Brown", "Blair", "Cameron", "Thatcher", "Major"],
 correctAnswer:2,
 selectedAnswer:-1},
 {question: "Who is the American president?",
 choices: ["Obama", "Clinton", "Merkel", "Bush", "Reagan"],
 correctAnswer:0,
 selectedAnswer:-1},
 {question: "Which of these countries is Communist?",
 choices: ["Germany", "Italy", "Sweeden", "Cuba", "China"],
 correctAnswer:4,
 selectedAnswer:-1},
 {question: "What is the capital of Ireland?",
 choices: ["Dublin", "Cork", "Limerick", "Derry", "Belfast"],
 correctAnswer:0,
 selectedAnswer:-1},
 {question: "What is the capital of Austria?",
 choices: ["Linz", "Salzburg", "Vienna", "Klagenfurt", "Berlin"],
 correctAnswer:2,
 selectedAnswer:-1}];*/
var allQuestions = JSON.parse(jsonstr);

var ul = document.getElementById("submittedItems");

function removeWarningMessage() {
    // remove warning message if it exists
    if (ul.childNodes[0]) {
        ul.removeChild(ul.childNodes[0]);
    }
}

function displayQAndAs(){

    var q = document.getElementById("question");

    if (localStorage["index"]) {
        index = parseInt(localStorage["index"]);
        console.log("index is " + index);
        for (var i = 0; i < allQuestions.length; i++) {
            allQuestions[i].selectedAnswer = parseInt(localStorage["selectedAnswerFor" + i]);
        }
        hideLogin();
    }

    // clear selected radio button for next button
    var radioBtns = document.querySelectorAll("input[type=radio]");
    var abort = false;
    for (var i = 0; i < radioBtns.length && !abort; i++) {
        if (radioBtns[i].checked) {
            radioBtns[i].checked = false;
            radioBtns[i].removeAttribute('checked');
            abort = true;
        }
    }

    //var questionChoices = allQuestions[index].choices;

    // having trouble removing/adding li items when the current number
    // of li items is not equal to the number of choices for a particular question
    /*var topList = document.getElementById("list");
     var lastItem = document.getElementById("lastItem");

     if (answerList.length > questionChoices.length) {
     var numLabelsRemove = answerList - questionChoices;
     for (var i = 0; i < numLabelsRemove; i++) {
     topList.removeChild(lastItem);
     }
     }*/

    $("#question").fadeOut( "slow", function() {

        // display question and answers
        // Get the html text node from the displayQuestion template and compile it
        var disQTemplate = document.getElementById("displayQuestion-template").innerHTML;
        var compiled = Handlebars.compile(disQTemplate);

        q.innerHTML = compiled(allQuestions[index]);

        // if answer to current question has been previously selected, display it
        if (allQuestions[index].selectedAnswer !== -1) {
            radioBtns[allQuestions[index].selectedAnswer].checked = true;
        }

        removeWarningMessage();
    });


    $('#question').fadeIn();
}

function rememberSelectedAnswer() {

    var radioBtns = document.querySelectorAll("input[type=radio]");
    var selected = false;
    var checkedAnswer;
    for (var i = 0; i < radioBtns.length && !selected; i++) {
        if (radioBtns[i].checked) {
            checkedAnswer = i;
            allQuestions[index].selectedAnswer = i;
            selected = true;
        }
    }

    return selected;
}

function submitAnswer() {

    var ansSelected = rememberSelectedAnswer();

    if (ansSelected === true) {


        index++;
        saveQuizState();
        if (index === 5) {

            for (var j=0; j < allQuestions.length; j++) {
                totalScore += (allQuestions[j].selectedAnswer == allQuestions[j].correctAnswer) ? 5 : 0;
            }

            // remove warning message if it exists
            removeWarningMessage();

            // send userName, password and user's score as JSON to server DB
            var jsonData = {
                userName: localStorage["name"],
                password: localStorage["pwd"],
                score: totalScore
            };

            var serializedJson = JSON.stringify(jsonData);
            var request = new XMLHttpRequest();
            request.open("post", '/adduserscore', true);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(serializedJson);

            var div = document.getElementById("top");
            var form = document.getElementById("myForm");
            div.removeChild(form);

            var textScore = document.createTextNode("Your score is " + totalScore);
            var li = document.createElement("li");
            li.appendChild(textScore);
            div.appendChild(li);

            // get average score from all user's who finished this quiz

            request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if ((request.status >= 200 && request.status < 300) || request.status == 304)
                    {
                        // Javascript function JSON.parse to parse JSON data
                        var jsonObj = JSON.parse(request.responseText);
                        avgScore = jsonObj.average;

                        var textAvg = document.createTextNode("average score is " + avgScore);
                        li = document.createElement("li");
                        li.appendChild(textAvg);
                        div.appendChild(li);

                    }
                }
            }


            request.open("get", '/getavgscore', true);
            request.setRequestHeader("Content-Type", "application/json");
            request.send();

            //var avgScore = 0;
            /*if ((request.status >= 200 && request.status < 300) || request.status == 304)
            {
                // Javascript function JSON.parse to parse JSON data
                var jsonObj = JSON.parse(request.responseText);
                avgScore = jsonObj.average;

                var textAvg = document.createTextNode("average score is " + avgScore);
                li = document.createElement("li");
                li.appendChild(textAvg);
                div.appendChild(li);

            }*/

            //remove local storage
            localStorage.clear();

            // reset our values
            item = 0;
            for (var i = 0; i < allQuestions.length; i++) {
                allQuestions[i].selectedAnswer = -1;
            }
        }
        else {
            displayQAndAs();
        }
    }
    else if (!ul.hasChildNodes() ) {
        var li = document.createElement("li");

        var textNode = document.createTextNode("Please select an answer!");
        li.appendChild(textNode);
        ul.appendChild(li);
    }
}

function previousQuestion() {
    if (index > 0) {
        rememberSelectedAnswer();
        index--;
        saveQuizState();
        displayQAndAs();
    }
}

function signIn() {
    var name = document.getElementById("user");
    var pwd = document.getElementById("password");

    var nameVal = name.value;
    var pwdVal = pwd.value;

    localStorage["name"] = nameVal;
    localStorage["pwd"] = pwdVal;

    name.value = "";
    pwd.value = "";

    hideLogin();
}

function hideLogin() {

    var login = document.getElementById("login");
    login.classList.add("hidden");

    var qAndAs = document.getElementById("myForm")
    qAndAs.classList.remove("hidden");
}

function saveQuizState() {
    if (!supportsLocalStorage()) { return false; }
    localStorage["index"] = index;
    for (var i = 0; i < allQuestions.length; i++) {
        localStorage["selectedAnswerFor" + i] = allQuestions[i].selectedAnswer;
    }
}

function supportsLocalStorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

displayQAndAs();

var next = document.getElementById("nextBtn");
next.onclick = submitAnswer;

var back = document.getElementById("backBtn");
back.onclick = previousQuestion;

var login = document.getElementById("loginBtn");
login.onclick = signIn;