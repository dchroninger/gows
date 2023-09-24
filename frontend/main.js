let user = prompt("Enter your name");
let sendBtn = document.getElementById("message-send-button");
let messageInput = document.getElementById("message-input");
let messageList = document.getElementById("message-list");
let userList = document.getElementById("friend-list");
let users = [];

let socket = new WebSocket("ws://dave.local:8081/ws");

socket.addEventListener("open", (event) => {
  console.log("Open Event: " + JSON.stringify(event));
  let msg = {
    type: "user_join",
    data: user,
  };
  console.log("Sending message: " + JSON.stringify(msg));
  socket.send(JSON.stringify(msg));
});

socket.addEventListener("message", (event) => {
  if (event.data === "connected") {
    return;
  }

  let msg = JSON.parse(event.data);

  switch (msg.type) {
    case "user_join":
      users.push(msg.data);
      if (msg.data !== user) {
        userList.innerHTML += `
              <div class="h-12 flex items-center justify-center">
                <p class="text-xs text-gray-600">${msg.data}</p>
              </div>
            `;
      }

      messageList.innerHTML =
        `<div class="flex w-[100%]">
              <div class="p-3 w-[100%] mt-4 flex justify-around">
                <p class="break-word text-gray-500">${msg.data} has joined the chat.</p>
              </div>
            </div>` + messageList.innerHTML;
      break;
    case "user_leave":
      users = users.filter((user) => user !== msg.data);
      messageList.innerHTML =
        `<div class="flex w-[100%]">
              <div class="p-3 w-[100%] mt-4 flex justify-around">
                <p class="break-word text-gray-500">${msg.data} has left the chat.</p>
              </div>
            </div>` + messageList.innerHTML;
      break;
    case "chat_message":
      let isOwnMessage = msg.sender === user;
      if (isOwnMessage) {
        messageList.innerHTML =
          `<div class="flex w-[100%] justify-end">
              <div class="bg-pink-300 p-3 max-w-xs rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl mt-4 shadow-lg">
                <p class="break-word">${msg.data}</p>
              </div>
            </div>` + messageList.innerHTML;
      } else {
        messageList.innerHTML =
          `<div class="flex flex-col justify-start">
                <p class="text-gray-400 text-sm mt-4 max-w-xs">${msg.sender}</p>
                <div class="bg-blue-300 p-3 max-w-xs rounded-tl-2xl rounded-br-2xl rounded-tr-2xl mt-1 shadow-lg">
                  <p class="break-word">${msg.data}</p>
                </div>
              </div>` + messageList.innerHTML;
      }
  }
});

function enterToSendWhenInputFocusedHandler(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendBtn.click();
  }
}

messageInput.onfocus = () => {
  messageInput.addEventListener("keydown", enterToSendWhenInputFocusedHandler);
};

messageInput.onblur = () => {
  messageInput.removeEventListener(
    "keydown",
    enterToSendWhenInputFocusedHandler
  );
};

// Only add the event listener once
if (sendBtn.getAttribute("message-input-listener") !== "true") {
  console.log("adding event listener");
  sendBtn.addEventListener("click", function () {
    sendBtn.setAttribute("message-input-listener", "true");
    message = messageInput.value;
    if (message) {
      let msg = {
        type: "chat_message",
        data: message,
        sender: user,
      };

      socket.send(JSON.stringify(msg));
      messageInput.value = "";
    }
  });
}
