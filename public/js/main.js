var popup = document.getElementById('add-gc');

var add_users = document.getElementById('add-users')

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

function openAddUsers(){
    add_users.classList.remove("hide")
    add_users.classList.add("show")
}



const btn = document.querySelectorAll('.friends-list')
const chatForm = document.getElementById('chat-form')  //collect form id
const chatMessages = document.querySelector(".chat-messages")
const socket = io()
const username = document.querySelector("#username").innerHTML
const addButton = document.querySelectorAll(".addBtn")
const leaveRoom = document.querySelector("#leave")


function addUserAction(username){
    const chatRoom = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    })
    console.log(chatRoom.chat_id);
    socket.emit("add-user", ({username, chatRoom}))
}

// const chatRoom = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// })
// if (chatRoom == {}) {
//     console.log("working");
//     pre_add.style.visibility = "hidden"
// }else{
//     pre_add.style.visibility = "visible"
// }

const chatRoom = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
socket.emit("joinRoom", ({username, chatRoom}))

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

leaveRoom.addEventListener("click", function(){
    const chatRoom = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    })
    socket.emit("leave", ({username, chatRoom}))
})


    //Message submit
chatForm.addEventListener('submit', function(err) {
    err.preventDefault();

    //get message text
    const msg = err.target.elements.msg.value;

    const chatRoom = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    })
    //Emit message to server
    socket.emit('chatMessage', ({msg, chatRoom}))

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
