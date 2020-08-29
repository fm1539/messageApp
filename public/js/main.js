var popup = document.getElementById('add-gc');

var add_users = document.getElementById('add-users')

function openPopup(){
    popup.classList.remove("hide")
    popup.classList.add("show")
    document.getElementById("overlay2").style.display = "block";
  }

function close1(){
    for (var i = 0; i < popup.classList.length; i++){
        popup.classList.remove(popup.classList[i]);
    }
    popup.classList.add("hide")        
    document.getElementById("overlay2").style.display = "none";
}


function openAddUsers(){
    document.getElementById("overlay3").style.display = "block";
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

function viewMembers(){
    const chatRoom = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    })
    console.log(chatRoom.chat_id);
    document.querySelector("#members-popup").classList.remove('hide')
    document.querySelector("#members-popup").classList.add("show")
    document.getElementById("overlay1").style.display = "block";
    socket.emit("view-members", chatRoom.chat_id)
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

socket.on('joinMessage', (join) => {
    var today = new Date()
    var message = {
        username: "Traverse",
        text: join,
        time: today.getHours() + ":" + today.getMinutes()
    }
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message from Server
socket.on('chatMessage', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight
})

function scrollBottomDiv(){
    console.log("working");
    chatMessages.scrollTop = chatMessages.scrollHeight
}

socket.on('retrieve-members', ({chat}) => {
    console.log("working");
    for (var i = 0; i < chat.usernames.length; i++){
        const div = document.createElement('div');
        div.classList.add('member');
        div.innerHTML = '<h1>' + chat.usernames[i] + '</h1><hr>'
        document.querySelector("#members-popup").appendChild(div)
    }
})

function close2(){
    document.getElementById("overlay1").style.display = "none";
}

function close3(){
    document.getElementById("overlay3").style.display = "none";
}


const create_btn = document.getElementById('create-btn')
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
