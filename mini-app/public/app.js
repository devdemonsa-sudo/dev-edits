const SUPABASE_URL = "https://ladwwdxqcvhwcmaxjozw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHd3ZHhxY3Zod2NtYXhqb3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDA0ODQsImV4cCI6MjA5Njk3NjQ4NH0.9dWWXqjuOYplVSGRP22FXlOfPAiChCt_zW3gPiZxry8";

const loginCard = document.getElementById("loginCard");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");
const statusPill = document.getElementById("statusPill");

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

function setMessage(text, tone = "muted") {
  loginMessage.textContent = text;
  loginMessage.dataset.tone = tone;
}

function setLoggedInView(loggedIn) {
  loginCard.hidden = loggedIn;
  appShell.hidden = !loggedIn;
  logoutButton.hidden = !loggedIn;
  statusPill.textContent = loggedIn ? "Acesso liberado" : "Acesso restrito";
}

async function refreshSession() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  setLoggedInView(Boolean(session));
  if (!session) {
    setMessage("Use sua conta autorizada para acessar.");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  setMessage("Entrando...");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage("Não foi possível entrar. Verifique email e senha.", "error");
    return;
  }

  setMessage("Acesso liberado.");
  await refreshSession();
});

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  await refreshSession();
});

supabase.auth.onAuthStateChange(() => {
  refreshSession();
});

refreshSession();
