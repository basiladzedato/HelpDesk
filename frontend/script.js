const form = document.getElementById("ticketForm");



form.addEventListener("submit", async (eventz) => {
    eventz.preventDefault();

    const title = document.getElementById("title");
    titleText = title.value;

    const description = document.getElementById("description");
    descriptionText = description.value;

    const url = "http://127.0.0.1:8081/api/tickets";

    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: titleText, description: descriptionText}),
        credentials: "include"
    });

});

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (eventz) => {
    eventz.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("http://127.0.0.1:8081/login", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        credentials: "include",
        body: formData

    });

    const message = document.getElementById("loginMessage");

    if (response.ok) {
        message.textContent = "Login Successful";
    } else {
        message.textContent = "Invalid username or password"
    }

});
