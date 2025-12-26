// 🔥 FIREBASE CONFIG (PASTE YOUR OWN)
const firebaseConfig = {
  apiKey: "Replace_with_env_la_la_la",
  authDomain: "exam-preparation-planner.firebaseapp.com",
  projectId: "exam-preparation-planner",
  storageBucket: "exam-preparation-planner.firebasestorage.app",
  messagingSenderId: "955145029194",
  appId: "1:955145029194:web:e4c636f9d6a1b833ffc8b3",
  measurementId: "G-HCF9K3GRNJ"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ================= EMAIL LOGIN ================= */
function startPlanner() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const examDate = document.getElementById("examDate").value;

  if (!name || !email || !password || !examDate) {
    alert("Fill all fields");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection("users").doc(cred.user.uid).set({
        name, email, examDate
      });
    })
    .then(() => location.href = "dashboard.html")
    .catch(err => alert(err.message));
}

/* ================= GOOGLE LOGIN ================= */
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(res => {
      return db.collection("users").doc(res.user.uid).set({
        name: res.user.displayName,
        email: res.user.email,
        examDate: ""
      }, { merge: true });
    })
    .then(() => location.href = "./dashboard.html");
}

/* ================= DASHBOARD ================= */
auth.onAuthStateChanged(user => {
  if (!user && location.pathname.includes("dashboard")) {
    location.href = "index.html";
  }

  if (user && document.getElementById("welcome")) {
    db.collection("users").doc(user.uid).get().then(doc => {
      const d = doc.data();

      document.getElementById("welcome").innerText = `Welcome ${d.name} 👋`;

      const examDate = new Date(d.examDate);
      const today = new Date();
      const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
      document.getElementById("daysLeft").innerText = daysLeft;

      // 🤖 AI TASK LOGIC
      const tasks = daysLeft < 10
        ? ["Revision", "Mock Test", "Important Topics"]
        : ["New Topics", "Practice", "Revision"];

      const list = document.getElementById("taskList");
      list.innerHTML = "";
      tasks.forEach(t => {
        const li = document.createElement("li");
        li.innerText = t;
        list.appendChild(li);
      });

      setTimeout(() => {
        document.getElementById("progress").style.width = "65%";
      }, 500);

      // 📈 Chart
      new Chart(document.getElementById("progressChart"), {
        type: "line",
        data: {
          labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
          datasets: [{
            label: "Study Hours",
            data: [2,3,4,3,5,6,4],
            borderWidth: 2,
            tension: 0.4
          }]
        }
      });

      // 📅 Calendar
      const calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"), {
          initialView: "dayGridMonth",
          height: 350,
          events: [
            { title: "Study", date: new Date().toISOString().slice(0,10) },
            { title: "Revision", date: new Date(Date.now()+86400000).toISOString().slice(0,10) },
            { title: "Mock Test", date: new Date(Date.now()+2*86400000).toISOString().slice(0,10) }
          ]
        }
      );
      calendar.render();
    });
  }
});

/* ================= TIMER ================= */
let time = 1500;
function startTimer() {
  setInterval(() => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    document.getElementById("timer").innerText =
      `${m}:${s < 10 ? "0" : ""}${s}`;
    if (time > 0) time--;
  }, 1000);
}

/* ================= LOGOUT ================= */
function logout() {
  auth.signOut().then(() => location.href = "index.html");

}



