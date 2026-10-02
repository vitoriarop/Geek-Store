import test from "node:test";
import assert from "node:assert/strict";
import { registerAccount, loginAccount } from "./auth.js";
const memory = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};
test("cadastro, login, senha incorreta, duplicata e hash persistente", async () => {
  const storage = memory();
  const user = await registerAccount(
    {
      name: "Cliente Teste",
      email: " Cliente@EXAMPLE.com ",
      password: "abc123",
    },
    storage,
  );
  assert.deepEqual(user, {
    name: "Cliente Teste",
    email: "cliente@example.com",
  });
  assert.equal(
    storage.getItem("geekstore.accounts.v1").includes("abc123"),
    false,
  );
  assert.deepEqual(
    await loginAccount(
      { email: "CLIENTE@example.com", password: "abc123" },
      storage,
    ),
    user,
  );
  await assert.rejects(
    loginAccount({ email: user.email, password: "errada" }, storage),
    /E-mail ou senha incorretos/,
  );
  await assert.rejects(
    loginAccount({ email: "outro@example.com", password: "abc123" }, storage),
    /E-mail ou senha incorretos/,
  );
  await assert.rejects(
    registerAccount(
      { name: user.name, email: user.email, password: "abc456" },
      storage,
    ),
    /já está cadastrado/,
  );
});
test("cadastro rejeita senha curta e falha de persistência", async () => {
  await assert.rejects(
    registerAccount(
      { name: "Teste", email: "a@example.com", password: "123" },
      memory(),
    ),
    /6 caracteres/,
  );
  await assert.rejects(
    registerAccount(
      { name: "Teste", email: "a@example.com", password: "123456" },
      {
        getItem: () => null,
        setItem: () => {
          throw new Error();
        },
      },
    ),
    /salvar o cadastro/,
  );
});
