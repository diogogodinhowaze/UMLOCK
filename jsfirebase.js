// Configuração Firebase (usa a tua config real)
const firebaseConfig = {
  apiKey: "AIzaSyDvtjKEMAXRkfEJ7YGNgs-TW4H2YGzBZbM",
  authDomain: "lmslock-33b95.firebaseapp.com",
  databaseURL: "https://lmslock-33b95-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lmslock-33b95",
  storageBucket: "lmslock-33b95.appspot.com",
  messagingSenderId: "701373252784",
  appId: "1:701373252784:web:0118db4f8282c9903e2775",
  measurementId: "G-0FL77DBKKP"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const mensagensRef = db.ref('logs/mensagens');

const listaMensagens = document.getElementById('listaMensagens');
const loginSection = document.getElementById('loginSection');

let loginForm;  // variável para o formulário que vamos criar dinamicamente

// Cria dinamicamente o formulário e insere na página
function criarFormularioLogin() {
  loginForm = document.createElement('form');
  loginForm.id = "loginForm";
  loginForm.innerHTML = `
    <h2>Login</h2>
    <input type="email" id="email" placeholder="Email" required />
    <input type="password" id="password" placeholder="Senha" required />
    <button type="submit">Entrar</button>
    <p id="loginError" class="error-message"></p>
  `;
  loginSection.innerHTML = ''; // limpa conteúdo
  loginSection.appendChild(loginForm);

  // Escuta submit do form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('#email').value.trim();
    const password = loginForm.querySelector('#password').value.trim();
    const loginError = loginForm.querySelector('#loginError');

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

    // Destaco eventos específicos
    if (msg.codigo.startsWith("MOTION:")) {
      li.textContent = `${msg.codigo}`;
    } else {
      li.textContent = msg.codigo || "Sem código";
    }

    const spanHora = document.createElement('span');
    spanHora.classList.add('time');
    spanHora.textContent = msg.hora || "";
    li.appendChild(spanHora);

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

    let lista = [];

    if (Array.isArray(data)) {
      lista = data.filter(m => m !== null);
    } else {
      lista = Object.values(data);
    }

    atualizarLista(lista);
  });
}

// Controla a visibilidade dos elementos dependendo do estado de autenticação
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
