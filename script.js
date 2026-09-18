// =============== Phase 1 ====================
// Google Authentication without Realtime Firebase access
// ============================================




// main.js (Firebase Modular API)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, onChildChanged, onChildRemoved, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6r-gDFJcG6qjYbkRG517QeujZtSPHvRo",
  authDomain: "chatapp-22dd3.firebaseapp.com",
  databaseURL: "https://chatapp-22dd3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatapp-22dd3",
  storageBucket: "chatapp-22dd3.firebasestorage.app",
  messagingSenderId: "344569549806",
  appId: "1:344569549806:web:e9b4e7c2e0357e0633b4ff",
  measurementId: "G-1713VZ0N9C"
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

// ===============================
// Google Authentication
// ===============================
onAuthStateChanged(auth, (user) => {
    if(user) {
        $("#userInfo").text("Logged in as " + user.displayName)
        $("#loginBtn").hide()
        $("#logoutBtn").show()
        $("addChatBtn").show()
    } else
    {
        $("#userInfo").text("Not logged in")
        $("#loginBtn").show()
        $("#logoutBtn").hide()
        $("#addChatBtn").hide()
        $(".chatBox").remove()
    }
})
// ===============================
// Login / Logout
// ===============================
$(document).ready(function () {
    $("#loginBtn").click(async function () {
        try {
            const result = await signInWithPopup(auth, provider);
        } catch (err)
        {
            console.error("Google Login Error")
        }
    })
    $("#logoutBtn").click(async function () {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Logout error: " + err);
        }
    })
})



// define chatBox draggability 
const dragSettings = {
    // the chatbix bcomes undraggable when ppl start typing
    cancel: '.textarea',

    // a chatbox being dragged has to go to the top layer
    "zIndex": 3000,

    // maintain stacking order
    "stack": '.chatBox'
}


// on page loaded
$(document).ready(function() {
    rebuildAllChats()

    $('#addChatBtn').click(addChatToBoard)

    window.onbeforeunload = saveChatsToStorage
})

function buildChatBox(text="", top=150, left=30)
{
    // create a chatbox using html codes
    let chatBox = ''
    + ' <div class="chatBox" '

    + 'style="left:' + left + 'px;  '
    + 'top:' + top + 'px" >'
    

    + ' <div class="toolbar"> '
    + ' <span class="close"> x </span> '
    + ' </div> '
    + ' <div class="textarea" contenteditable="true"> '
    + text
    + ' </div> '
    + ' </div> '
    return chatBox
}
function addChatToBoard()
{
    var newChat = buildChatBox()
    $('#pinboard').append(newChat)
    $('.chatBox').draggable(dragSettings)
    $('span.close').click(deleteChat)
}

function deleteChat()
{
    // identify the chatBox the close button belongs to
    $(this).closest('.chatBox').fadeOut('fast', function() {
        $(this).remove()
    })
}

function saveChatsToStorage()
{
    window.localStorage.clear()

    $('.chatBox').each(function() {
        const jsonData = {
            top : parseInt($(this).position().top),
            left : parseInt($(this).position().left),
            text : $(this).children('.textarea').text(),
        }

        var chatId = window.localStorage.length

        window.localStorage.setItem(chatId, JSON.stringify(jsonData))
    })
}

function rebuildAllChats()
{
    const numChats = window.localStorage.length

    // start rebuilding if numChats is greater than 0
    if(numChats > 0)
    {
        for(var i = 0; i < numChats; i++)
        {
            var chatId = window.localStorage.key(i)

            const jsonData = JSON.parse(window.localStorage.getItem(chatId))

            const chatBox = buildChatBox(jsonData.text, jsonData.top, jsonData.left)

            $('#pinboard').append(chatBox)
        }
    }

    $('.chatBox').draggable(dragSettings)
    $('span.close').click(deleteChat)
}