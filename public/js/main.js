
const chatForm = document.getElementById('chat-form')  //collect form id
const chatMessages = document.querySelector(".chat-messages")
const socket = io()

//Message from Server
socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight
})

    //Message submit
chatForm.addEventListener('submit', function(err) {
    err.preventDefault();

    //get message text
    const msg = err.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg)

    err.target.elements.msg.value = ""
    err.target.elements.msg.focus()
});

// output message to DOM

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = '<p class="meta">'+ message.username + '<span>' + message.time +'</span' +'</p>'+
    '<p class="text">' + message.text + '</p>'
    document.querySelector(".chat-messages").appendChild(div)
}
