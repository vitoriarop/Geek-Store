import test from "node:test";
import assert from "node:assert/strict";
import { addItem, normalizeCart, totals, validCep } from "./store.js";
const products = [
  { id: "1", price: 11990, stock: 3, sizes: ["P", "M"] },
  { id: "2", price: 5490, stock: 12, sizes: ["Padrão"] },
];
test("mescla itens iguais e respeita estoque entre tamanhos", () => {
  let cart = addItem([], products[0], "P", 2);
  cart = addItem(cart, products[0], "P");
  assert.equal(cart[0].qty, 3);
  assert.equal(addItem(cart, products[0], "M"), cart);
  assert.deepEqual(addItem([], products[0], "G"), []);
});
test("recupera armazenamento inválido e remove produtos desconhecidos", () => {
  assert.deepEqual(normalizeCart(null, products), []);
  assert.deepEqual(
    normalizeCart(
      [
        { id: "x", qty: 1, size: "P" },
        { id: "1", qty: 100, size: "M" },
        { id: "2", qty: -1, size: "Padrão" },
      ],
      products,
    ),
    [{ id: "1", qty: 3, size: "M" }],
  );
});
test("cupom usa centavos e frete padrão fica grátis a partir de R$199", () => {
  assert.deepEqual(totals([{ id: "1", qty: 2 }], products, "GEEK15"), {
    subtotal: 23980,
    discount: 3597,
    shipping: 0,
    total: 20383,
  });
  assert.equal(totals([{ id: "2", qty: 1 }], products).total, 7080);
  assert.equal(
    totals([{ id: "1", qty: 2 }], products, "GEEK15", "express").total,
    23373,
  );
  assert.equal(totals([], products).total, 0);
});
test("normaliza linhas duplicadas e limita estoque total", () => {
  assert.deepEqual(
    normalizeCart(
      [
        { id: "1", qty: 1, size: "P" },
        { id: "1", qty: 1, size: "P" },
        { id: "1", qty: 3, size: "M" },
      ],
      products,
    ),
    [
      { id: "1", qty: 2, size: "P" },
      { id: "1", qty: 1, size: "M" },
    ],
  );
});
test("CEP com e sem máscara", () => {
  assert.equal(validCep("69000-001"), true);
  assert.equal(validCep("69000001"), true);
  assert.equal(validCep("123"), false);
});
