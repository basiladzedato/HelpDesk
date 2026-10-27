const API = "http://127.0.0.1:8081";

const state = {
  user: null,
  tickets: [],
};

const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const ticketForm = document.getElementById("ticketForm");
const ticketModal = document.getElementById("ticketModal");
const ticketList = document.getElementById("ticketList");
const toast = document.getElementById("toast");

document.querySelectorAll("[data-auth-tab]").forEach((button) => {
  button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
});

loginForm.addEventListener("submit", login);
registerForm.addEventListener("submit", register);
ticketForm.addEventListener("submit", createTicket);

document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("refreshButton").addEventListener("click", loadTickets);
document
  .getElementById("topNewTicket")
  .addEventListener("click", openTicketModal);
document
  .getElementById("sidebarNewTicket")
  .addEventListener("click", openTicketModal);
document
  .getElementById("closeModal")
  .addEventListener("click", closeTicketModal);
document
  .getElementById("cancelTicket")
  .addEventListener("click", closeTicketModal);

ticketModal.addEventListener("click", (event) => {
  if (event.target === ticketModal) {
    closeTicketModal();
  }
});

ticketList.addEventListener("change", async (event) => {
  if (!event.target.matches("[data-status-ticket]")) {
    return;
  }

  const id = event.target.dataset.statusTicket;
  const status = event.target.value;
  await updateTicketStatus(id, status);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTicketModal();
  }
});

restoreSession();

async function restoreSession() {
  const user = await getCurrentUser();

  if (!user) {
    showAuth();
    return;
  }

  state.user = user;
  showDashboard();
  await loadTickets();
}

function switchAuthTab(tab) {
  const isLogin = tab === "login";

  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authTab === tab);
  });

  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
}

async function login(event) {
  event.preventDefault();

  const submitButton = loginForm.querySelector("button[type='submit']");
  setButtonLoading(submitButton, true, "Signing in...");

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  try {
    const response = await fetch(`${API}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      showToast("Invalid username or password.", true);
      return;
    }

    const user = await getCurrentUser();

    if (!user) {
      showToast(
        "Login succeeded, but the account session could not be read.",
        true,
      );
      return;
    }

    state.user = user;
    showDashboard();
    await loadTickets();
    showToast(`Welcome back, ${user.username}.`);
    loginForm.reset();
  } catch (error) {
    showToast("Could not reach the backend.", true);
  } finally {
    setButtonLoading(submitButton, false, "Sign in");
  }
}

async function register(event) {
  event.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("registerPasswordConfirm").value;

  if (password !== confirm) {
    showToast("Passwords do not match.", true);
    return;
  }

  const submitButton = registerForm.querySelector("button[type='submit']");
  setButtonLoading(submitButton, true, "Creating...");

  try {
    const response = await fetch(`${API}/register-user`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      showToast(await readError(response), true);
      return;
    }

    showToast("Account created. You can sign in now.");
    document.getElementById("loginUsername").value = username;
    registerForm.reset();
    switchAuthTab("login");
    document.getElementById("loginPassword").focus();
  } catch (error) {
    showToast("Could not reach the backend.", true);
  } finally {
    setButtonLoading(submitButton, false, "Create account");
  }
}

async function getCurrentUser() {
  try {
    const response = await fetch(`${API}/api/me`, {
      credentials: "include",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.includes("application/json")) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

function showDashboard() {
  authScreen.classList.add("hidden");
  appShell.classList.remove("hidden");

  const username = state.user.username;
  const role = state.user.role;

  document.getElementById("sidebarUsername").textContent = username;
  document.getElementById("sidebarRole").textContent = role;
  document.getElementById("avatar").textContent = username
    .charAt(0)
    .toUpperCase();

  const support = role === "SUPPORT";

  document.getElementById("ticketSectionTitle").textContent = support
    ? "All support tickets"
    : "Your tickets";

  document.getElementById("ticketSectionSubtitle").textContent = support
    ? "Review requests from every user and update their status."
    : "Track your requests and their current status.";
}

function showAuth() {
  state.user = null;
  state.tickets = [];

  appShell.classList.add("hidden");
  authScreen.classList.remove("hidden");
  closeTicketModal();
}

async function loadTickets() {
  ticketList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⌁</div>
            <h3>Loading tickets...</h3>
        </div>
    `;

  try {
    const response = await fetch(`${API}/api/tickets`, {
      credentials: "include",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.includes("application/json")) {
      if (
        response.status === 401 ||
        response.status === 403 ||
        response.redirected
      ) {
        showAuth();
        showToast("Your session is no longer active.", true);
        return;
      }

      throw new Error("Could not load tickets");
    }

    state.tickets = await response.json();
    renderTickets();
    renderStats();
  } catch (error) {
    ticketList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">!</div>
                <h3>Could not load tickets</h3>
                <p>Check that the Spring Boot container is running.</p>
            </div>
        `;
  }
}

function renderTickets() {
  if (!state.tickets.length) {
    ticketList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⌁</div>
                <h3>No tickets yet</h3>
                <p>Create your first support request.</p>
            </div>
        `;
    return;
  }

  const support = state.user?.role === "SUPPORT";

  ticketList.innerHTML = state.tickets
    .map((ticket) => {
      const status = ticket.status || "OPEN";
      const statusClass = status.toLowerCase().replace("_", "-");
      const statusText = status.replace("_", " ");
      const owner = ticket.username
        ? `<span>Owner: ${escapeHtml(ticket.username)}</span>`
        : "";

      const supportControl = support
        ? `
                <div class="support-control">
                    <select data-status-ticket="${ticket.id}" aria-label="Change ticket status">
                        ${statusOption("OPEN", status)}
                        ${statusOption("IN_PROGRESS", status)}
                        ${statusOption("RESOLVED", status)}
                    </select>
                </div>
            `
        : "";

      return `
            <article class="ticket">
                <div class="ticket-main">
                    <div class="ticket-topline">
                        <span class="ticket-id">#${ticket.id}</span>
                        <span class="status-badge status-${statusClass}">
                            ${escapeHtml(statusText)}
                        </span>
                    </div>

                    <h3>${escapeHtml(ticket.title || "Untitled ticket")}</h3>

                    <p class="ticket-description">
                        ${escapeHtml(ticket.description || "No description provided.")}
                    </p>

                    <div class="ticket-meta">
                        ${owner}
                        <span>${formatDate(ticket.createdAt)}</span>
                    </div>
                </div>

                ${supportControl}
            </article>
        `;
    })
    .join("");
}

function renderStats() {
  const tickets = state.tickets;

  document.getElementById("totalCount").textContent = tickets.length;
  document.getElementById("openCount").textContent = tickets.filter(
    (ticket) => (ticket.status || "OPEN") === "OPEN",
  ).length;
  document.getElementById("progressCount").textContent = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  ).length;
  document.getElementById("resolvedCount").textContent = tickets.filter(
    (ticket) => ticket.status === "RESOLVED",
  ).length;
}

async function createTicket(event) {
  event.preventDefault();

  const title = document.getElementById("ticketTitle").value.trim();
  const description = document.getElementById("ticketDescription").value.trim();
  const submitButton = ticketForm.querySelector("button[type='submit']");

  setButtonLoading(submitButton, true, "Creating...");

  try {
    const response = await fetch(`${API}/api/tickets`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      showToast(await readError(response), true);
      return;
    }

    ticketForm.reset();
    closeTicketModal();
    showToast("Ticket created.");
    await loadTickets();
  } catch (error) {
    showToast("Could not create ticket.", true);
  } finally {
    setButtonLoading(submitButton, false, "Create ticket");
  }
}

async function updateTicketStatus(id, status) {
  try {
    const response = await fetch(
      `${API}/api/tickets/${id}/status?status=${encodeURIComponent(status)}`,
      {
        method: "PUT",
        credentials: "include",
      },
    );

    if (!response.ok) {
      showToast(await readError(response), true);
      await loadTickets();
      return;
    }

    showToast(`Ticket #${id} changed to ${status.replace("_", " ")}.`);
    await loadTickets();
  } catch (error) {
    showToast("Could not update ticket status.", true);
  }
}

async function logout() {
  try {
    await fetch(`${API}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    showAuth();
    showToast("Logged out.");
  }
}

function openTicketModal() {
  ticketModal.classList.remove("hidden");
  setTimeout(() => document.getElementById("ticketTitle").focus(), 0);
}

function closeTicketModal() {
  ticketModal.classList.add("hidden");
}

function statusOption(value, current) {
  const label = value.replace("_", " ");
  return `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`;
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function readError(response) {
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await response.json();

      if (body.error) {
        return body.error;
      }

      const firstValue = Object.values(body)[0];
      return firstValue || `Request failed (${response.status})`;
    }

    const text = await response.text();
    return text || `Request failed (${response.status})`;
  } catch (error) {
    return `Request failed (${response.status})`;
  }
}

function showToast(message, error = false) {
  toast.textContent = message;
  toast.classList.toggle("error", error);
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function setButtonLoading(button, loading, label) {
  button.disabled = loading;

  const firstSpan = button.querySelector("span");

  if (firstSpan) {
    firstSpan.textContent = label;
  } else {
    button.textContent = label;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
