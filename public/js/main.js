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



const checkbox = document.querySelectorAll('.friends-list')
const chatForm = document.getElementById('chat-form')  //collect form id
const chatMessages = document.querySelector(".chat-messages")
const socket = io()
const username = document.querySelector("#username").innerHTML
const addButton = document.getElementById("addBtn")
const pre_add = document.getElementById("preAdd")


addButton.addEventListener("click", function(){
    var arr = []
    for (var i = 0; i < checkbox.length; i++){
        if (checkbox[i].checked){
            arr.push(checkbox[i].id)
        }
    }
    const chatRoom = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    })
    console.log(chatRoom);

    socket.emit("add-user", ({arr, chatRoom}))
})

// const chatRoom = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// })
// if (chatRoom == {}) {
//     console.log("working");
//     pre_add.style.visibility = "hidden"
// }else{
//     pre_add.style.visibility = "visible"
// }


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
