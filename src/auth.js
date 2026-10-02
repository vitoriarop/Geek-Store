// Local demonstration only. Production authentication must run on a server.
const KEY = "geekstore.accounts.v1";
const normalizeEmail = (email) => email.trim().toLowerCase();
const hex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

async function derive(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: Uint8Array.from(salt),
      iterations: 210000,
    },
    key,
    256,
  );
  return hex(new Uint8Array(bits));
}

function accounts(storage) {
  try {
    const value = JSON.parse(storage.getItem(KEY) || "[]");
    if (!Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new Error(
      "Não foi possível acessar as contas salvas neste navegador.",
    );
  }
}

export async function registerAccount(
  { name, email, password },
  storage = localStorage,
) {
  name = name.trim();
  email = normalizeEmail(email);
  if (name.length < 2)
    throw new Error("Informe seu nome com pelo menos 2 caracteres.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Informe um e-mail válido.");
  if (password.length < 6)
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await derive(password, salt);
  const saved = accounts(storage);
  if (saved.some((a) => a.email === email))
    throw new Error("Este e-mail já está cadastrado. Entre com sua senha.");
  try {
    storage.setItem(
      KEY,
      JSON.stringify([...saved, { name, email, salt, hash }]),
    );
  } catch {
    throw new Error(
      "Não foi possível salvar o cadastro. Verifique o armazenamento do navegador.",
    );
  }
  return { name, email };
}

export async function loginAccount(
  { email, password },
  storage = localStorage,
) {
  const account = accounts(storage).find(
    (a) => a.email === normalizeEmail(email),
  );
  if (
    !account ||
    !Array.isArray(account.salt) ||
    (await derive(password, account.salt)) !== account.hash
  ) {
    throw new Error("E-mail ou senha incorretos.");
  }
  return { name: account.name, email: account.email };
}
