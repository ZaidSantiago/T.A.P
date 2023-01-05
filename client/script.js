import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')



let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, texts) {
    let index = 0
    var msg = new SpeechSynthesisUtterance();
    msg.rate = 3;
    msg.text = texts;
    msg.volume = 1;
    console.log(msg)
    window.speechSynthesis.speak(msg);

    
    
    let interval = setInterval(() => {
        if (index < texts.length) {
            element.innerHTML += texts.charAt(index)
            index++
            
        } else {
            clearInterval(interval)
            if (element.innerHTML.toLowerCase().includes("t.a.p")) {
              console.log("test")
            }
        }
    }, 40)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv)
  

  // fetch data from server

  const response = await fetch('https://t-a-p.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new window.SpeechRecognition();
recognition.interimResults = true;

let p = document.querySelector('.promptBox')

var msg = new SpeechSynthesisUtterance();

    

recognition.addEventListener('result', (e) => {
    const text = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript.toLowerCase())
    .join('')
    console.log(text);
    p.innerHTML = text;
    
    
   }
)

recognition.addEventListener('end', (e)=>{
  if (document.querySelector('.promptBox').innerHTML === "" || document.querySelector('.promptBox').innerHTML === " ") {
    alert("Please ask a prompt prior to submitting!")
  }
  else {
  handleSubmit(e)
  document.querySelector('.promptBox').innerHTML = ""
  }
})

recognition.start();

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})

if (chatContainer.innerHTML.includes("Hi")) {
  alert("hi");
}
