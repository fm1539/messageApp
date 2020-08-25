var popup = document.getElementById('add-gc');
  

function openPopup(){
    popup.classList.remove("hide")
    popup.classList.add("show")
  }

function close1(){
    for (var i = 0; i < popup.classList.length; i++){
        popup.classList.remove(popup.classList[i]);
    }
    popup.classList.add("hide")
        
}



const chatForm = document.getElementById('chat-form')  //collect form id
const chatMessages = document.querySelector(".chat-messages")
const socket = io()
const username = document.querySelector("#username").innerHTML

socket.emit("join", username)

//Message from Server
socket.on('chatMessage', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight
})


const create_btn = document.getElementById('create-btn')
console.log(gcname);
create_btn.addEventListener("click", function(){
    const gcname = document.getElementById('gcname').value
    console.log("working");
    socket.emit('create-room', ({gcname, username}))
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
