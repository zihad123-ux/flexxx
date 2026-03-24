// 🔹 Firebase Setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔹 User/Admin Setup
let user = "";
let isAdmin = false;
const ADMIN_PASS = "9999";

// 🔹 Login
function login() {
  if (document.getElementById("username").value === "2025" &&
      document.getElementById("password").value === "2025") {
    user = "2025";
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("posts").style.display = "block";
    document.getElementById("messageBox").style.display = "block";
    loadPosts();
  } else { 
    alert("Wrong login"); 
  }
}

// 🔹 Admin Panel Access
function adminMode() {
  let pass = prompt("Admin password");
  if(pass === ADMIN_PASS){
    isAdmin = true;
    document.getElementById("adminBox").style.display = "block";
    document.getElementById("adminMsgBox").style.display = "block";
    loadMessages();
  } else {
    alert("Wrong admin password");
  }
}

// 🔹 User Messages
function sendMsg() {
  let text = document.getElementById("msgText").value;
  if (!text) return;
  db.collection("messages").add({
    user: user,
    text: text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => { document.getElementById("msgText").value=""; alert("Message sent to admin"); });
}

function loadMessages() {
  db.collection("messages").orderBy("createdAt","desc").onSnapshot(snapshot=>{
    let html="";
    snapshot.forEach(doc=>{
      let m = doc.data();
      html += `<div class="msg"><b>${m.user}</b>: ${m.text}</div>`;
    });
    document.getElementById("adminMessages").innerHTML = html;
  });
}

// 🔹 Admin Post
function addPost() {
  if(!isAdmin) return;
  let text=document.getElementById("postText").value;
  if(!text) return;
  db.collection("posts").add({
    text:text,
    agree:0,
    disagree:0,
    voted:[],
    comments:[],
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=>{ document.getElementById("postText").value=""; loadPosts(); });
}

// 🔹 Load Posts
function loadPosts() {
  db.collection("posts").orderBy("createdAt","desc").onSnapshot(snapshot=>{
    let html="";
    snapshot.forEach(doc=>{
      let p = doc.data();
      let id = doc.id;
      let total = p.agree + p.disagree;
      let agreePercent = total ? Math.round((p.agree/total)*100) : 0;
      let disagreePercent = total ? Math.round((p.disagree/total)*100) : 0;
      let voted = p.voted.includes(user);

      let commentsHtml = "";
      if(p.comments && p.comments.length>0){
        p.comments.forEach(c=>{ commentsHtml += `<div class="comment">${c}</div>`; });
      }

      html += `
      <div class="card">
        <b>Admin</b>
        <p>${p.text}</p>
        <button onclick="vote('${id}','agree')" ${voted?'disabled':''}>👍 Agree (${p.agree})</button>
        <button class="disagree" onclick="vote('${id}','disagree')" ${voted?'disabled':''}>👎 Disagree (${p.disagree})</button>
        ${isAdmin?`<div style="margin-top:10px">
          <button onclick="editPost('${id}')">Edit</button>
          <button class="disagree" onclick="deletePost('${id}')">Delete</button>
        </div>`:''}
        <div class="bar"><div class="agreeBar" style="width:${agreePercent}%"></div></div>${agreePercent}% Agree
        <div class="bar"><div class="disagreeBar" style="width:${disagreePercent}%"></div></div>${disagreePercent}% Disagree
        <div class="comments">
          ${commentsHtml}
          <input id="c${id}" placeholder="Add comment">
          <button onclick="comment('${id}')">Comment</button>
        </div>
      </div>
      `;
    });
    document.getElementById("posts").innerHTML = html;
  });
}

// 🔹 Vote
function vote(postId,type){
  let postRef=db.collection("posts").doc(postId);
  db.runTransaction(transaction=>{
    return transaction.get(postRef).then(doc=>{
      if(!doc.exists) throw "Post missing!";
      let data=doc.data();
      if(!data.voted) data.voted=[];
      if(data.voted.includes(user)) return;
      let update={};
      update[type]=(data[type]||0)+1;
      update.voted=[...data.voted,user];
      transaction.update(postRef,update);
    });
  });
}

// 🔹 Comment
function comment(postId){
  let text=document.getElementById("c"+postId).value;
  if(!text) return;
  let postRef=db.collection("posts").doc(postId);
  postRef.update({ comments: firebase.firestore.FieldValue.arrayUnion(user+": "+text) })
  .then(()=>{ document.getElementById("c"+postId).value=""; });
}

// 🔹 Admin Edit/Delete
function editPost(postId){
  let pass = prompt("Admin password");
  if(pass!==ADMIN_PASS) return alert("Wrong password");
  let newText = prompt("Edit post");
  if(!newText) return;
  db.collection("posts").doc(postId).update({ text:newText });
}

function deletePost(postId){
  let pass = prompt("Admin password");
  if(pass!==ADMIN_PASS) return alert("Wrong password");
  db.collection("posts").doc(postId).delete();
}
