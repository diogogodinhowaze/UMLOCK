// Firebase config (podes substituir pelos teus dados)
const firebaseConfig = {
  apiKey: "AIzaSyDvtjKEMAXRkfEJ7YGNgs-TW4H2YGzBZbM",
  authDomain: "lmslock-33b95.firebaseapp.com",
  databaseURL: "https://lmslock-33b95-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lmslock-33b95",
  storageBucket: "lmslock-33b95.appspot.com",
  messagingSenderId: "701373252784",
  appId: "1:701373252784:web:0118db4f8282c9903e2775"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const mensagensRef = db.ref('logs/mensagens');

const listaMensagens = document.getElementById('listaMensagens');
const loginSection = document.getElementById('loginSection');

// Criar formulário de login
function criarFormularioLogin() {
  const form = document.createElement('form');
  form.id = "loginForm";
  form.innerHTML = `
    <h2>Login</h2>
    <input type="email" id="email" placeholder="Email" required />
    <input type="password" id="password" placeholder="Senha" required />
    <button type="submit">Entrar</button>
    <p id="loginError" class="error-message"></p>
  `;
  loginSection.innerHTML = '';
  loginSection.appendChild(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value.trim();
    const loginError = form.querySelector('#loginError');
    try {
      await auth.signInWithEmailAndPassword(email, password);
      loginError.textContent = "";
      loginSection.style.display = 'none';
      document.getElementById('mensagens').style.display = 'block';
      startListening();
    } catch (error) {
      loginError.textContent = error.message;
    }
  });
}

function atualizarLista(mensagens) {
  listaMensagens.innerHTML = '';
  if (!mensagens || mensagens.length === 0) {
    listaMensagens.innerHTML = '<li>Nenhuma mensagem disponível.</li>';
    return;
  }
  mensagens.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg.codigo || "Sem código";
    const span = document.createElement('span');
    span.className = "time";
    span.textContent = msg.hora || "";
    li.appendChild(span);
    listaMensagens.appendChild(li);
  });
}

function startListening() {
  mensagensRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      atualizarLista(null);
      return;
    }
    let lista = Array.isArray(data) ? data.filter(m => m !== null) : Object.values(data);
    atualizarLista(lista);
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = 'none';
    document.getElementById('mensagens').style.display = 'block';
    startListening();
  } else {
    loginSection.style.display = 'block';
    document.getElementById('mensagens').style.display = 'none';
    criarFormularioLogin();
  }
});
