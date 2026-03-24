let user=""
let isAdmin=false

const ADMIN_PASS="9999"

function login(){
if(username.value==="2025" && password.value==="2025"){
user="2025"
loginBox.style.display="none"
posts.style.display="block"
loadPosts()
}else{
alert("Wrong login")
}
}

function logout(){
location.reload()
}

function adminMode(){
let pass=prompt("Admin password")

if(pass===ADMIN_PASS){
isAdmin=true
adminBox.style.display="block"
adminMsgBox.style.display="block"
loadMessages()
}else{
alert("Wrong admin password")
}
}

function openMsg(){
messageBox.style.display="block"
}

function sendMsg(){

let msgs=JSON.parse(localStorage.getItem("msgs")||"[]")

msgs.unshift({
user:user,
text:msgText.value
})

localStorage.setItem("msgs",JSON.stringify(msgs))

msgText.value=""
alert("Message sent to admin")
}

function loadMessages(){

let msgs=JSON.parse(localStorage.getItem("msgs")||"[]")

let html=""

msgs.forEach(m=>{
html+=`<div class="msg"><b>${m.user}</b>: ${m.text}</div>`
})

adminMessages.innerHTML=html
}

function addPost(){
if(!isAdmin) return

let posts=JSON.parse(localStorage.getItem("posts")||"[]")

posts.unshift({
text:postText.value,
agree:0,
disagree:0,
voted:[],
comments:[]
})

localStorage.setItem("posts",JSON.stringify(posts))
postText.value=""
loadPosts()
}

function loadPosts(){

let posts=JSON.parse(localStorage.getItem("posts")||"[]")
let html=""

posts.forEach((p,i)=>{

let total=p.agree+p.disagree

let agreePercent= total? Math.round((p.agree/total)*100):0
let disagreePercent= total? Math.round((p.disagree/total)*100):0

let voted=p.voted.includes(user)

html+=`
<div class="card">

<b>Admin</b>
<p>${p.text}</p>

<button onclick="agree(${i})" ${voted?'disabled':''}>
👍 Agree (${p.agree})
</button>

<button class="disagree" onclick="disagree(${i})" ${voted?'disabled':''}>
👎 Disagree (${p.disagree})
</button>

${isAdmin ? `
<div style="margin-top:10px">
<button onclick="editPost(${i})">✏️ Edit</button>
<button class="disagree" onclick="del(${i})">🗑 Delete</button>
</div>
` : ''}

<div class="bar">
<div class="agreeBar" style="width:${agreePercent}%"></div>
</div>
${agreePercent}% Agree

<div class="bar">
<div class="disagreeBar" style="width:${disagreePercent}%"></div>
</div>
${disagreePercent}% Disagree

<div style="margin-top:10px">
<input id="c${i}" placeholder="comment">
<button onclick="comment(${i})">Comment</button>
</div>

${p.comments.map(c=>`<div class="comment">${c}</div>`).join("")}

</div>
`
})

document.getElementById("posts").innerHTML=html
}

function agree(i){
let posts=JSON.parse(localStorage.getItem("posts"))

if(posts[i].voted.includes(user)) return

posts[i].agree++
posts[i].voted.push(user)

localStorage.setItem("posts",JSON.stringify(posts))
loadPosts()
}

function disagree(i){
let posts=JSON.parse(localStorage.getItem("posts"))

if(posts[i].voted.includes(user)) return

posts[i].disagree++
posts[i].voted.push(user)

localStorage.setItem("posts",JSON.stringify(posts))
loadPosts()
}

function comment(i){
let text=document.getElementById("c"+i).value

let posts=JSON.parse(localStorage.getItem("posts"))

posts[i].comments.push(user+": "+text)

localStorage.setItem("posts",JSON.stringify(posts))
loadPosts()
}

function del(i){
let pass=prompt("Admin password to delete")

if(pass!==ADMIN_PASS) return alert("Wrong password")

let posts=JSON.parse(localStorage.getItem("posts"))

posts.splice(i,1)

localStorage.setItem("posts",JSON.stringify(posts))
loadPosts()
}
function deletePost(i){

let pass=prompt("Admin password")

if(pass!=="9999"){
alert("Wrong password")
return
}

let posts=JSON.parse(localStorage.getItem("posts"))

posts.splice(i,1)

localStorage.setItem("posts",JSON.stringify(posts))

loadPosts()
}

function editPost(i){

let pass=prompt("Admin password")

if(pass!=="9999"){
alert("Wrong password")
return
}

let posts=JSON.parse(localStorage.getItem("posts"))

let newText=prompt("Edit post",posts[i].text)

if(newText){
posts[i].text=newText
localStorage.setItem("posts",JSON.stringify(posts))
loadPosts()
}
}
