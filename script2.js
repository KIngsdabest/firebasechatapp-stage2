// =============== Phase 2 ====================
// Google Authentication without Realtime Firebase access
// ============================================


// ======================================================
// Firebase Modular API
// ======================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// ======================================================
// Firebase Initialization
// ======================================================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const chatsRef = ref(db, "chats");

// ======================================================
// Draggable Chat Settings
// ======================================================
const draggableChat = {
    // Clicking/typing inside the editable area
    // should NOT drag the chat box.
    cancel: ".editable",
    // Put the selected chat box on top.
    zIndex: 3000,
    // Automatically stack chat boxes.
    stack: ".chatBox"
};

// ======================================================
// Google Authentication State
// ======================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user);
        $("#userInfo").text("Logged in as " + user.displayName);
        $("#loginBtn").hide();
        $("#addChatBtn").show();
        $("#logoutBtn").show();

        startChatListeners()
    }
    else {
        console.log("No user logged in");
        $("#userInfo").text("Please login in to continue");
        $("#loginBtn").show();
        $("#addChatBtn").hide();
        $("#logoutBtn").hide();
        // Remove chat boxes from the screen
        // when the user logs out.
        $(".chatBox").remove();
    }
});

function startChatListeners()
{
    // ==================================================
    // Firebase Realtime Database Listeners
    // ==================================================
    // --------------------------------------------------
    // When a new chat is added
    // --------------------------------------------------
    onChildAdded(chatsRef, (snap) => {
        const chat = snap.val();
        const id = snap.key;
        console.log(
            "Chat added:",
            id,
            chat
        );
        addChatToBoard(
            id,
            chat
        );
    });

    // --------------------------------------------------
    // When an existing chat is changed
    // --------------------------------------------------
    onChildChanged(chatsRef, (snap) => {
        const chat = snap.val();
        const id = snap.key;
        console.log(
            "Chat changed:",
            id,
            chat
        );
        updateChatOnBoard(
            id,
            chat
        );
    });

    // --------------------------------------------------
    // When a chat is deleted
    // --------------------------------------------------
    onChildRemoved(chatsRef, (snap) => {
        const id = snap.key;
        console.log(
            "Chat removed:",
            id
        );
        $(`#${id}`).remove();
    });
}

// ======================================================
// Login / Logout
// ======================================================
$(document).ready(function () {
    $("#loginBtn").click(async function () {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Google login successful!");
            console.log("User:", result.user);
        }
        catch (err) {
            console.error("Google Login Error");
            console.error("Code:", err.code);
            console.error("Message:", err.message);
            console.error("Full error:", err);
            alert(
                "Login failed:\n\n" +
                err.code + "\n" +
                err.message
            );
        }
    });
    $("#logoutBtn").click(async function () {
        try {
            await signOut(auth);
            console.log("Logged out");
        }
        catch (err) {
            console.error(
                "Logout error:",
                err
            );
        }
    });

    // ==================================================
    // Create New Chat
    // ==================================================

    $("#addChatBtn").click(function () {
        // Make sure user is logged in.
        const user = auth.currentUser;
        if (!user) {
            alert("Please login before creating a chat.");
            return;
        }
        // Create a new Firebase child.
        const newRef = push(chatsRef);
        // Initial chat data.
        const newChat = {
            top: 100,
            left: 100,
            text: "",
            owner: user.displayName,
            ownerUid: user.uid
        };
        // Save the new chat to Firebase.
        set(newRef, newChat)
            .then(() => {
                console.log(
                    "New chat created:",
                    newRef.key
                );
            })
            .catch((err) => {
                console.error(
                    "Failed to create chat:",
                    err
                );
            });
    });
});

// ======================================================
// Add Chat to Pinboard
// ======================================================
function addChatToBoard(id, chat) {
    // Prevent duplicate chat boxes.
    if ($(`#${id}`).length) {
        return;
    }
    // Create HTML.
    const html = createChatHTML(
        id,
        chat.left,
        chat.top,
        chat.text,
        chat.owner,
        chat.ownerUid
    );
    // Add it to the pinboard.
    $("#pinboard").append(html);
    // ==================================================
    // Make Chat Box Draggable
    // ==================================================
    $(`#${id}`).draggable({
        ...draggableChat,
        stop: function (event, ui) {
            console.log(
                "Chat moved:",
                id
            );
            // Save the new position.
            update(
                ref(db, "chats/" + id),
                {
                    left: ui.position.left,
                    top: ui.position.top
                }
            )
            .then(() => {
                console.log(
                    "Chat position saved"
                );
            })
            .catch((err) => {
                console.error(
                    "Move failed:",
                    err
                );
            });
        }
    });

    // ==================================================
    // Close/Delete Button
    // ==================================================
    $(`#${id} .close`).click(function () {
        console.log(
            "Deleting chat:",
            id
        );
        remove(
            ref(db, "chats/" + id)
        )
        .then(() => {
            console.log(
                "Chat deleted"
            );
        })
        .catch((err) => {
            console.error(
                "Delete failed:",
                err
            );
        });
    });

    // ==================================================
    // Editable Chat Text
    // ==================================================
    $(`#${id} .editable`).on(
        "blur",
        function () {
            const text = $(this).text();
            console.log(
                "Saving chat text:",
                text
            );
            update(
                ref(db, "chats/" + id),
                {
                    text: text
                }
            )
            .then(() => {
                console.log(
                    "Chat text saved"
                );
            })
            .catch((err) => {
                console.error(
                    "Text update failed:",
                    err
                );
            });
        }
    );
}

// ======================================================
// Update Existing Chat on Screen
// ======================================================
function updateChatOnBoard(id, chat) {
    const $chat = $(`#${id}`);
    // Chat does not exist in the DOM yet.
    if (!$chat.length) {
        return;
    }
    // Update position.
    $chat.css({
        top: chat.top,
        left: chat.left
    });
    // Update text.
    $chat.find(".editable").text(
        chat.text || ""
    );
}

// ======================================================
// Create Chat HTML
// ======================================================
function createChatHTML(
    id,
    left,
    top,
    text = "",
    owner = "unknown",
    ownerUid = ""
    
) {

    const currentUser = auth.currentUser;

    const isOwner = currentUser && currentUser.uid === ownerUid

    const closeButton = isOwner ? `<span class="close"> &times; </span>` : ""

    return `
        <div
            class="chatBox"
            id="${id}"
            style="
                left:${left ?? 100}px;
                top:${top ?? 100}px;
            "
        >
            <div class="toolbar">
                ${closeButton}
            </div>

            <div class="owner">
               👤${escapeHtml(owner)}
            </div>
            <div
                class="editable"
                contenteditable="true"
            >
                ${escapeHtml(text)}
            </div>
        </div>
    `;
}

// ======================================================
// Prevent HTML Injection
// ======================================================
function escapeHtml(s) {
    return String(s).replace(
        /[&<>"']/g,
        function (m) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[m];
        }
    );
}