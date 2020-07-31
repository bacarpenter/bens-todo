const auth = firebase.auth();
const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const userDetails = document.getElementById("userDetails");
const provider = new firebase.auth.GoogleAuthProvider();

// Signing in and out
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

//When user auth state changes:
auth.onAuthStateChanged((user) => {
  if (user) {
    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    userDetails.innerHTML = `<p>User ID: ${user.uid}</p>`;
    document.getElementById("userName").innerHTML = `<h3>Hello ${user.displayName}!</h3>`
    userDetails.hidden = false;
  } else {
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    userDetails.innerHTML = "";
    userDetails.hidden = true;
  }
});

//Data base:
const db = firebase.firestore();

const createThing = document.getElementById("taskConfirm");
const thingsList = document.getElementById("thingsList");

let thingsRef;
let unsubscribe;

auth.onAuthStateChanged((user) => {
  if (user) {
    thingsRef = db.collection("things");

    const { serverTimestamp } = firebase.firestore.FieldValue;

    createThing.onclick = () => {
      thingsRef.add({
        uid: user.uid,
        name: document.getElementById("inputPassword").value,
        createdAt: serverTimestamp(),
        completed: false,
        color: document.getElementById("colorSelector").value,
      });
    };

    unsubscribe = thingsRef
      .where("uid", "==", user.uid)
      .where("completed", "==", false)
      .orderBy("createdAt") // Requires a query
      .onSnapshot((querySnapshot) => {
        // Map results to an array of li elements

        const items = querySnapshot.docs.map((doc) => {
          return `<li id="item_${doc.id}">
                        <p style="color:${doc.data().color};">${
            doc.data().name
          } 
                            <input type="checkbox" aria-label="Checkbox for previous task" onclick="completeTask('${
                              doc.id
                            }')">
                        </p>
                    </li>`;
        });

        thingsList.innerHTML = items.join("");
      });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

function completeTask(id) {
  const { serverTimestamp } = firebase.firestore.FieldValue;

  console.log(id);
  compTask = document.getElementById(`item_${id}`);
  compTask.hidden = "true";
  var compTaskRef = db.collection("things").doc(id);
  var upadatedTask = compTaskRef.set(
    {
      completed: true,
      completedAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log(upadatedTask);
}
