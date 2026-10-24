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
        body: JSON.stringify({title: titleText, description: descriptionText})
    });

});
