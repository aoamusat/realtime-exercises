const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
    e.preventDefault();
    postNewMsg(chat.elements.user.value, chat.elements.text.value);
    chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
    // post to /poll a new message
    const data = {
        user,
        text,
    };

    const options = {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
    };
    const response = await fetch("/poll", options);
    const responseData = await response.json();
    console.log(responseData);
}

async function getNewMsgs() {
    // poll the server
    let body;

    try {
        const response = await fetch("/poll");
        body = await response.json();

        if (response.status >= 400) {
            throw new Error("Request failed with status " + response.status);
        }

        allChat = body.messages;
        render();
        failedRequests = 0;
    } catch (error) {
        // backoff code
        console.error(error);
        failedRequests += 1;
    }
}

function render() {
    // as long as allChat is holding all current messages, this will render them
    // into the ui. yes, it's inefficent. yes, it's fine for this example
    const html = allChat.map(({ user, text, time, id }) =>
        template(user, text, time, id)
    );
    msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
    `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

const BACKOFF = 5000;
let timeToMakeNextRequest = 0;
let failedRequests = 0;
// RAF => requestAnimationFrame
async function RAFTimer(time) {
    if (timeToMakeNextRequest <= time) {
        await getNewMsgs();
        timeToMakeNextRequest = time + INTERVAL + failedRequests * BACKOFF;
    }

    requestAnimationFrame(RAFTimer);
}

requestAnimationFrame(RAFTimer);
