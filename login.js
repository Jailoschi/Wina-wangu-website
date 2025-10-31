const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const formTitle = document.getElementById("form-title");
const toggleText = document.getElementById("toggle-text");

toggleText.addEventListener("click", toggleForms);

function toggleForms() {
    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        formTitle.textContent = "Login";
        toggleText.textContent = "Don’t have an account? Sign up";
    } else {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        formTitle.textContent = "Sign Up";
        toggleText.textContent = "Already have an account? Login";
    }
}

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    let users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[username] && users[username].password === password) {
        localStorage.setItem("currentUser", username);
        alert("Login successful!");
        window.location.href = "index.html";
    } else {
        alert("Invalid username or password");
    }
});

signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    let users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[name]) { alert("User already exists!"); return; }

    users[name] = { email, password };
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful! You can now login.");
    toggleForms();
});