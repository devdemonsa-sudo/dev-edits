const SUPABASE_URL = "https://ladwwdxqcvhwcmaxjozw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHd3ZHhxY3Zod2NtYXhqb3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDA0ODQsImV4cCI6MjA5Njk3NjQ4NH0.9dWWXqjuOYplVSGRP22FXlOfPAiChCt_zW3gPiZxry8";

const loginCard = document.getElementById("loginCard");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");
const statusPill = document.getElementById("statusPill");
const submitButton = document.getElementById("submitButton");
const authTabs = Array.from(document.querySelectorAll(".auth-tab"));
const passwordField = document.querySelector('[data-field="password"]');
const passwordInput = document.querySelector('input[name="password"]');
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const pages = Array.from(document.querySelectorAll(".page"));

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

let authMode = "login";

function setMessage(text, tone = "muted") {
  loginMessage.textContent = text;
  loginMessage.dataset.tone = tone;
}

function setLoggedInView(loggedIn, allowlisted = false) {
  loginCard.hidden = loggedIn && allowlisted;
  appShell.hidden = !(loggedIn && allowlisted);
  logoutButton.hidden = !(loggedIn && allowlisted);
  statusPill.textContent = loggedIn && allowlisted ? "Acesso liberado" : "Acesso restrito";
}

function setAuthMode(nextMode) {
  authMode = nextMode;
  authTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === nextMode);
  });
  const showPassword = nextMode !== "recover";
  passwordField.hidden = !showPassword;
  passwordInput.required = showPassword;
  submitButton.textContent =
    nextMode === "login" ? "Entrar" : nextMode === "signup" ? "Cadastrar" : "Enviar link";
  setMessage(
    nextMode === "login"
      ? "Use sua conta autorizada para acessar."
      : nextMode === "signup"
        ? "Crie sua conta e aguarde liberação na allowlist."
        : "Vamos enviar um link de recuperação para seu email."
  );
}

function setPage(pageName) {
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.section === pageName));
  pages.forEach((page) => (page.hidden = page.dataset.page !== pageName));
}

async function refreshSession() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session) {
    setLoggedInView(false, false);
    setMessage("Use sua conta autorizada para acessar.");
    return;
  }

  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email?.trim().toLowerCase();
  if (!email) {
    setLoggedInView(true, false);
    setMessage("Usuário sem email válido.", "error");
    return;
  }

  const { data: allowedRows, error } = await supabase
    .from("allowed_users")
    .select("email, active")
    .eq("email", email)
    .eq("active", true)
    .limit(1);

  if (error) {
    setLoggedInView(true, false);
    setMessage("Não foi possível validar acesso com a allowlist.", "error");
    return;
  }

  const allowed = (allowedRows || []).length > 0;
  setLoggedInView(true, allowed);
  if (allowed) {
    setMessage("Acesso liberado.");
  } else {
    setMessage("Sua conta está logada, mas ainda não foi liberada na allowlist.", "error");
  }
}

authTabs.forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.mode));
});

navItems.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.section));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (authMode === "recover") {
    setMessage("Enviando link de recuperação...");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });
    if (error) {
      setMessage("Não foi possível enviar o link de recuperação.", "error");
      return;
    }
    setMessage("Verifique seu email para recuperar a senha.");
    return;
  }

  setMessage(authMode === "signup" ? "Criando conta..." : "Entrando...");

  const result =
    authMode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

  if (result.error) {
    setMessage("Não foi possível concluir a operação. Verifique os dados.", "error");
    return;
  }

  if (authMode === "signup") {
    setMessage("Conta criada. Agora aguarde liberação na allowlist.", "muted");
  }

  await refreshSession();
});

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  await refreshSession();
});

supabase.auth.onAuthStateChange(() => {
  refreshSession();
});

setAuthMode("login");
setPage("overview");
refreshSession();
