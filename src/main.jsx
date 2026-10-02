import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Gamepad2,
  Search,
  User,
  Heart,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Coffee,
  GlassWater,
  Shirt,
  PersonStanding,
  Image,
  Keyboard,
  Headphones,
  Star,
  Package,
  Copy,
  LogOut,
} from "lucide-react";
import catalog from "./catalog.json";
import { registerAccount, loginAccount } from "./auth.js";
import {
  money,
  normalizeCart,
  addItem,
  totals,
  validCep,
  readStored,
} from "./store.js";
import "./styles.css";
const products = catalog.products;
const categories = [
  ["Canecas", Coffee],
  ["Copos Térmicos", GlassWater],
  ["Roupas", Shirt],
  ["Action Figures", PersonStanding],
  ["Quadros", Image],
  ["Teclados", Keyboard],
  ["Headsets", Headphones],
];
const descriptions = [
  "Algodão premium, estampa inspirada em Demon Slayer e caimento confortável para acompanhar você em qualquer aventura.",
  "Seu universo favorito sempre por perto. Copo com isolamento térmico e arte inspirada nos piratas de One Piece.",
  "Transforme seu setup com iluminação RGB, teclas mecânicas e o visual marcante da Akatsuki.",
  "Goku em uma pose icônica de batalha. Uma peça cheia de detalhes para completar sua coleção.",
  "Entre no jogo com conforto e estilo. Um headset inspirado no universo de Bleach.",
  "Uma pausa para o café com seus ninjas favoritos. Caneca de cerâmica com arte de Naruto e Sasuke.",
  "Leve seus personagens favoritos para a parede. Conjunto de três quadros decorativos de anime.",
  "Toda a energia do Gear 5 em uma peça para sua coleção. Luffy em sua transformação mais livre.",
];
function usePersistent(key, fallback, validate = (x) => x) {
  const [value, set] = useState(() => validate(readStored(key, fallback)));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage may be unavailable in private mode. */
    }
  }, [key, value]);
  return [value, set];
}
function ProductImage({ product, ...props }) {
  return (
    <img
      src={product.image}
      alt={product.name}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "./placeholder.svg";
      }}
      {...props}
    />
  );
}
function Modal({ title, children, onClose, drawer = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.focus();
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current.querySelectorAll(
          'button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]',
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={drawer ? "modal drawer" : "modal"}
      >
        <div className="section-heading">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  const [cart, setCart] = usePersistent("geekstore.cart", [], (x) =>
    normalizeCart(x, products),
  );
  const [favorites, setFavorites] = usePersistent(
    "geekstore.favorites",
    [],
    (x) =>
      Array.isArray(x)
        ? x.filter((id) => products.some((p) => p.id === id))
        : [],
  );
  const [profile, setProfile] = usePersistent(
    "geekstore.profile.v2",
    null,
    (x) =>
      x && typeof x.name === "string" && typeof x.email === "string" ? x : null,
  );
  const [orders, setOrders] = usePersistent("geekstore.orders", [], (x) =>
    Array.isArray(x)
      ? x.filter(
          (o) =>
            o &&
            typeof o.id === "string" &&
            Array.isArray(o.items) &&
            Number.isInteger(o.total),
        )
      : [],
  );
  const [drawer, setDrawer] = useState(false),
    [account, setAccount] = useState(false),
    [info, setInfo] = useState("");
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Todas"),
    [sort, setSort] = useState("featured"),
    [tab, setTab] = useState("Todos"),
    [toast, setToast] = useState("");
  const [coupon, setCoupon] = useState(""),
    [couponInput, setCouponInput] = useState(""),
    [delivery, setDelivery] = useState("standard");
  const toastTimer = useRef();
  useEffect(() => {
    const handler = () => {
      setRoute(location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const notify = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  const go = (path) => {
    location.hash = path;
    setDrawer(false);
  };
  const count = cart.reduce((s, r) => s + r.qty, 0),
    amount = totals(cart, products, coupon, delivery);
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const add = (p, size = p.sizes[0], qty = 1) => {
    const next = addItem(cart, p, size, qty);
    if (next === cart) {
      notify("Limite de estoque atingido.");
      return;
    }
    setCart(next);
    setDrawer(true);
  };
  const change = (row, delta) =>
    setCart((prev) =>
      delta > 0
        ? addItem(
            prev,
            products.find((p) => p.id === row.id),
            row.size,
            delta,
          )
        : prev
            .map((r) =>
              r.id === row.id && r.size === row.size
                ? { ...r, qty: r.qty - 1 }
                : r,
            )
            .filter((r) => r.qty > 0),
    );
  const remove = (row) =>
    setCart((prev) =>
      prev.filter((r) => r.id !== row.id || r.size !== row.size),
    );
  const filterCategory = (c) => {
    setCategory(c);
    setQuery("");
    go("/");
    setTimeout(
      () =>
        document
          .getElementById("produtos")
          ?.scrollIntoView({ behavior: "smooth" }),
      60,
    );
  };
  const applyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim().toUpperCase() === "GEEK15") {
      setCoupon("GEEK15");
      notify("Cupom GEEK15 aplicado: 15% de desconto.");
    } else {
      notify("Cupom inválido. Experimente GEEK15.");
    }
  };
  const visible = products
    .filter(
      (p) =>
        (category === "Todas" || p.category === category) &&
        p.name
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")) &&
        (route !== "/favoritos" || favorites.includes(p.id)),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : tab === "Lançamentos"
            ? Number(b.id) - Number(a.id)
            : tab === "Mais Desejados"
              ? b.price - a.price
              : 0,
    );
  function Card({ p }) {
    return (
      <article className="product-card">
        <div className="product-art">
          <a href={"#/produto/" + p.id} aria-label={"Ver " + p.name}>
            <ProductImage product={p} loading="lazy" />
          </a>
          <span className="tag">{p.universe}</span>
          <button
            className={
              "favorite icon-button " +
              (favorites.includes(p.id) ? "selected" : "")
            }
            aria-label={
              (favorites.includes(p.id)
                ? "Remover dos favoritos: "
                : "Favoritar: ") + p.name
            }
            aria-pressed={favorites.includes(p.id)}
            onClick={() => toggleFavorite(p.id)}
          >
            <Heart
              size={18}
              fill={favorites.includes(p.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
        <div className="product-body">
          <div className="rating">
            ★★★★★ <span>5.0 · Coleção geek</span>
          </div>
          <a className="product-title" href={"#/produto/" + p.id}>
            {p.name}
          </a>
          <p className="excerpt">{descriptions[Number(p.id) - 1]}</p>
          <strong className="price">{money(p.price)}</strong>
          <button
            className="primary full"
            onClick={() =>
              p.sizes.length > 1 ? go("/produto/" + p.id) : add(p)
            }
          >
            <ShoppingCart size={16} />
            {p.sizes.length > 1 ? "Escolher tamanho" : "Adicionar ao carrinho"}
          </button>
        </div>
      </article>
    );
  }
  function CartRows() {
    return (
      <div className="cart-rows">
        {cart.map((row) => {
          const p = products.find((p) => p.id === row.id);
          return (
            <article className="cart-row" key={row.id + row.size}>
              <ProductImage product={p} />
              <div>
                <a href={"#/produto/" + p.id} onClick={() => setDrawer(false)}>
                  {p.name}
                </a>
                <small>
                  {row.size} · {money(p.price)}
                </small>
                <div className="quantity">
                  <button
                    aria-label={"Diminuir quantidade de " + p.name}
                    onClick={() => change(row, -1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{row.qty}</span>
                  <button
                    disabled={
                      cart
                        .filter((r) => r.id === p.id)
                        .reduce((s, r) => s + r.qty, 0) >= p.stock
                    }
                    aria-label={"Aumentar quantidade de " + p.name}
                    onClick={() => change(row, 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="row-end">
                <button
                  className="icon-button"
                  aria-label={"Remover " + p.name}
                  onClick={() => remove(row)}
                >
                  <Trash2 size={17} />
                </button>
                <strong>{money(p.price * row.qty)}</strong>
              </div>
            </article>
          );
        })}
      </div>
    );
  }
  function Summary() {
    return (
      <>
        <dl className="totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{money(amount.subtotal)}</dd>
          </div>
          {coupon && (
            <div className="green">
              <dt>
                GEEK15{" "}
                <button
                  className="text-button"
                  onClick={() => setCoupon("")}
                  aria-label="Remover cupom"
                >
                  ×
                </button>
              </dt>
              <dd>− {money(amount.discount)}</dd>
            </div>
          )}
          <div>
            <dt>Frete estimado</dt>
            <dd className={amount.shipping === 0 ? "green" : ""}>
              {amount.shipping ? money(amount.shipping) : "Grátis"}
            </dd>
          </div>
          <div className="total">
            <dt>Total</dt>
            <dd>{money(amount.total)}</dd>
          </div>
        </dl>
      </>
    );
  }
  const product = route.startsWith("/produto/")
    ? products.find((p) => p.id === route.split("/")[2])
    : null;
  return (
    <>
      <a
        href="#conteudo"
        className="skip"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("conteudo").focus();
        }}
      >
        Pular para conteúdo
      </a>
      <header>
        <div className="header-main container">
          <a href="#/" className="brand">
            <span className="brand-mark">
              <Gamepad2 />
            </span>
            <span>
              Geek<span className="violet">Store</span>
              <small>Sua cultura pop, do seu jeito!</small>
            </span>
          </a>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              go("/");
              document
                .getElementById("produtos")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Search size={18} />
            <input
              aria-label="Buscar produtos"
              placeholder="O que você está procurando?"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (route !== "/" && route !== "/favoritos") go("/");
              }}
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </form>
          <div className="header-actions">
            <button aria-label="Minha conta" onClick={() => setAccount(true)}>
              <User size={19} />
              <span>
                {profile ? profile.name.split(" ")[0] : "Minha Conta"}
              </span>
            </button>
            <button
              onClick={() => {
                setCategory("Todas");
                setQuery("");
                go("/favoritos");
              }}
              aria-label="Favoritos"
            >
              <Heart size={20} />
              <span>Favoritos</span>
            </button>
            <button
              className="cart-button"
              onClick={() => setDrawer(true)}
              aria-label={"Carrinho, " + count + " itens"}
            >
              <ShoppingCart size={19} />
              <span>Carrinho</span>
              <b>{count}</b>
            </button>
          </div>
        </div>
        <nav className="container">
          <button
            className={route === "/" && category === "Todas" ? "active" : ""}
            onClick={() => filterCategory("Todas")}
          >
            Início
          </button>
          {categories.map(([c, Icon]) => (
            <button
              key={c}
              className={category === c ? "active" : ""}
              onClick={() => filterCategory(c)}
            >
              <Icon size={14} />
              {c}
            </button>
          ))}
        </nav>
      </header>
      <main className="container" id="conteudo" tabIndex={-1}>
        {(route === "/" || route === "/favoritos") && (
          <>
            {route === "/" && !query && category === "Todas" && (
              <>
                <section
                  className="hero"
                  style={{
                    backgroundImage: `linear-gradient(90deg,rgba(10,10,17,1) 0%,rgba(10,10,17,.98) 33%,rgba(10,10,17,.45) 60%,rgba(10,10,17,.1)),url("${catalog.hero}")`,
                  }}
                >
                  <div>
                    <span className="eyebrow">✦ PERSONALIZE O SEU MUNDO</span>
                    <h1>
                      Produtos geeks para quem vive a <span>cultura pop!</span>
                    </h1>
                    <p>
                      Canecas, teclados, quadros, camisetas, action figures,
                      copos, headsets e muito mais!
                    </p>
                    <button
                      className="primary"
                      onClick={() =>
                        document
                          .getElementById("produtos")
                          .scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      <ShoppingCart size={18} />
                      Ver produtos
                    </button>
                  </div>
                </section>
                <section className="categories">
                  <div className="section-heading">
                    <h2>Categorias Populares</h2>
                    <button
                      className="text-button"
                      onClick={() => filterCategory("Todas")}
                    >
                      Ver todas <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="category-grid">
                    {categories.map(([c, Icon], i) => (
                      <button
                        key={c}
                        style={{
                          "--accent": [
                            "#ad84ff",
                            "#60a5fa",
                            "#f472b6",
                            "#fbbf24",
                            "#34d399",
                            "#22d3ee",
                            "#fb923c",
                          ][i],
                        }}
                        onClick={() => filterCategory(c)}
                      >
                        <span>
                          <Icon size={27} />
                        </span>
                        {c}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
            <section id="produtos">
              <div className="catalog-heading">
                <div>
                  <h2>
                    {route === "/favoritos"
                      ? "Meus Favoritos"
                      : query
                        ? "Resultados da busca"
                        : category === "Todas"
                          ? "Produtos em Destaque"
                          : category}
                  </h2>
                  <p>
                    {query
                      ? `${visible.length} produtos para “${query}”`
                      : route === "/favoritos"
                        ? "Sua próxima coleção começa aqui."
                        : "Os colecionáveis e periféricos mais desejados do momento"}
                  </p>
                </div>
                <div className="filters">
                  {["Todos", "Mais Desejados", "Lançamentos"].map((t) => (
                    <button
                      className={tab === t ? "active" : ""}
                      key={t}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                  <select
                    aria-label="Ordenar produtos"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="featured">Destaques</option>
                    <option value="low">Menor preço</option>
                    <option value="high">Maior preço</option>
                  </select>
                </div>
              </div>
              {visible.length ? (
                <div className="product-grid">
                  {visible.map((p) => (
                    <Card key={p.id} p={p} />
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Search size={40} />
                  <h3>
                    {route === "/favoritos"
                      ? "Nenhum favorito por aqui"
                      : "Nenhum produto encontrado"}
                  </h3>
                  <p>
                    {route === "/favoritos"
                      ? "Toque no coração dos produtos para salvá-los."
                      : "Experimente outro termo ou veja todas as categorias."}
                  </p>
                  <button
                    className="primary"
                    onClick={() => {
                      setQuery("");
                      setCategory("Todas");
                      go("/");
                    }}
                  >
                    Explorar produtos
                  </button>
                </div>
              )}
            </section>
            <section className="promo">
              <div>
                <span className="eyebrow">✦ UM EXTRA PARA SUA COLEÇÃO</span>
                <h2>Semana do Colecionador</h2>
                <p>
                  Seus universos favoritos com 15% de desconto. Use o cupom
                  GEEK15.
                </p>
              </div>
              <button
                className="coupon-copy"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText("GEEK15");
                    notify("Cupom copiado!");
                  } catch {
                    notify("Use o código GEEK15 no carrinho.");
                  }
                }}
              >
                <span>
                  <small>Cupom de 15% OFF</small>
                  <strong>GEEK15</strong>
                </span>
                <Copy size={18} />
              </button>
            </section>
            <div className="benefits">
              <div>
                <Truck />
                <span>
                  <b>Frete Grátis Brasil</b>
                  <small>Em pedidos a partir de R$ 199,00</small>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  <b>Uma experiência completa</b>
                  <small>Checkout demonstrativo, sem cobrança</small>
                </span>
              </div>
              <div>
                <RefreshCcw />
                <span>
                  <b>Sua coleção sempre por perto</b>
                  <small>Favoritos salvos neste navegador</small>
                </span>
              </div>
            </div>
          </>
        )}
        {product && (
          <ProductDetails
            key={product.id}
            product={product}
            add={add}
            favorite={favorites.includes(product.id)}
            toggleFavorite={() => toggleFavorite(product.id)}
          />
        )}
        {route === "/checkout" &&
          (cart.length ? (
            <>
              <div className="page-heading">
                <button className="text-button" onClick={() => go("/")}>
                  <ArrowLeft size={16} />
                  Continuar comprando
                </button>
                <h1>Finalize sua aventura</h1>
                <p>Preencha os dados de entrega para simular seu pedido.</p>
              </div>
              <div className="notice">
                <ShieldCheck size={19} />
                Ambiente demonstrativo: nenhum pagamento será realizado. Use
                dados fictícios.
              </div>
              <div className="checkout-layout">
                <CheckoutForm
                  profile={profile}
                  delivery={delivery}
                  setDelivery={setDelivery}
                  onSubmit={(data) => {
                    const order = {
                      id:
                        "GEEK-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
                      date: new Date().toISOString(),
                      items: cart.map((r) => ({
                        ...r,
                        name: products.find((p) => p.id === r.id).name,
                        price: products.find((p) => p.id === r.id).price,
                      })),
                      ...amount,
                      delivery,
                      payment: data.payment,
                    };
                    setOrders((prev) => [order, ...prev]);
                    setCart([]);
                    setCoupon("");
                    go("/pedido/" + order.id);
                  }}
                />
                <aside className="panel">
                  <h2>Resumo do pedido</h2>
                  <CartRows />
                  <Summary />
                </aside>
              </div>
            </>
          ) : (
            <div className="empty">
              <ShoppingCart size={44} />
              <h1>Seu carrinho está vazio</h1>
              <button className="primary" onClick={() => go("/")}>
                Explorar produtos
              </button>
            </div>
          ))}
        {route.startsWith("/pedido/") && (
          <Order
            order={orders.find((o) => o.id === route.split("/")[2])}
            go={go}
          />
        )}
        {!["/", "/favoritos", "/checkout"].includes(route) &&
          !product &&
          !route.startsWith("/pedido/") && (
            <div className="empty">
              <h1>Página não encontrada</h1>
              <a className="primary" href="#/">
                Voltar ao início
              </a>
            </div>
          )}
      </main>
      <footer className="container">
        <div>
          <a href="#/" className="brand">
            <Gamepad2 />
            <span>
              Geek<span className="violet">Store</span>
            </span>
          </a>
          <p>
            Sua base de comando para colecionismo,
            <br />
            periféricos e cultura pop.
          </p>
        </div>
        <div>
          <b>Informações</b>
          {["Sobre a loja", "Trocas e devoluções", "Privacidade"].map((t) => (
            <button key={t} onClick={() => setInfo(t)}>
              {t}
            </button>
          ))}
        </div>
        <div>
          <b>Minha coleção</b>
          <button onClick={() => setAccount(true)}>
            Minha conta e pedidos
          </button>
          <button onClick={() => go("/favoritos")}>Meus favoritos</button>
          <button onClick={() => setDrawer(true)}>Meu carrinho</button>
        </div>
        <div>
          <b>Projeto demonstrativo</b>
          <p>
            React + Vite
            <br />
            Sem cobranças ou envios reais.
          </p>
        </div>
        <p className="copyright">
          © {new Date().getFullYear()} GeekStore · Feito para colecionadores e
          gamers.
        </p>
      </footer>
      {drawer && (
        <Modal
          title={`Meu carrinho (${count})`}
          drawer
          onClose={() => setDrawer(false)}
        >
          {cart.length ? (
            <>
              <p className="shipping-note">
                <Truck size={17} />
                {amount.subtotal >= 19900
                  ? "Você desbloqueou frete padrão grátis!"
                  : `Faltam ${money(19900 - amount.subtotal)} para frete padrão grátis`}
              </p>
              <CartRows />
              <form className="coupon-form" onSubmit={applyCoupon}>
                <input
                  aria-label="Cupom de desconto"
                  placeholder="Cupom de desconto"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button className="secondary">Aplicar</button>
              </form>
              <Summary />
              <button className="primary full" onClick={() => go("/checkout")}>
                Finalizar compra <ArrowRight size={18} />
              </button>
              <button
                className="text-button full"
                onClick={() => setDrawer(false)}
              >
                Continuar comprando
              </button>
              <small className="muted">
                Frete estimado. Pedido demonstrativo, sem cobrança.
              </small>
            </>
          ) : (
            <div className="empty">
              <ShoppingCart size={48} />
              <h3>Seu carrinho está esperando uma aventura</h3>
              <button
                className="primary"
                onClick={() => {
                  setDrawer(false);
                  go("/");
                }}
              >
                Explorar produtos
              </button>
            </div>
          )}
        </Modal>
      )}
      {account && (
        <Modal
          title={profile ? "Minha conta" : "Bem-vindo à GeekStore"}
          onClose={() => setAccount(false)}
        >
          <Account
            profile={profile}
            orders={orders}
            onSave={(p) => {
              setProfile(p);
              notify("Você entrou na sua conta.");
            }}
            onLogout={() => setProfile(null)}
            onOrder={(id) => {
              setAccount(false);
              go("/pedido/" + id);
            }}
          />
        </Modal>
      )}
      {info && (
        <Modal title={info} onClose={() => setInfo("")}>
          <p>
            {info === "Privacidade"
              ? "Este frontend salva carrinho, favoritos, perfil demonstrativo e pedidos no armazenamento local do navegador. Os dados de entrega não são salvos. As imagens e fontes podem ser carregadas de serviços externos."
              : info === "Trocas e devoluções"
                ? "Este projeto simula uma loja. Não há venda, envio ou devolução real. Para operar comercialmente, conecte o frontend a um backend e configure as políticas da loja."
                : "GeekStore é uma demonstração de loja em React + Vite, criada a partir do layout fornecido. Explore o catálogo e experimente o fluxo completo de compra."}
          </p>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
function ProductDetails({ product: p, add, favorite, toggleFavorite }) {
  const [size, setSize] = useState(p.sizes[0]),
    [qty, setQty] = useState(1),
    [cep, setCep] = useState(""),
    [shipping, setShipping] = useState(""),
    [tab, setTab] = useState("Descrição");
  return (
    <>
      <div className="breadcrumb">
        <a href="#/">Início</a>
        <ChevronRight size={14} />
        <span>{p.category}</span>
        <ChevronRight size={14} />
        <span>{p.universe}</span>
      </div>
      <section className="detail-layout">
        <div className="detail-image">
          <ProductImage product={p} />
          <span className="tag">{p.universe}</span>
        </div>
        <div className="detail-info">
          <span className="eyebrow">{p.category} · COLEÇÃO GEEK</span>
          <h1>{p.name}</h1>
          <div className="rating">
            ★★★★★ <span>Seleção GeekStore</span>
          </div>
          <p className="green">
            <Check size={15} />
            Em estoque · catálogo demonstrativo
          </p>
          <strong className="detail-price">{money(p.price)}</strong>
          <p className="muted">
            ou 10x de {money(Math.ceil(p.price / 10))} · simulação
          </p>
          <p>{descriptions[Number(p.id) - 1]}</p>
          {p.sizes.length > 1 && (
            <fieldset>
              <legend>Tamanho</legend>
              <div className="size-options">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    className={size === s ? "active" : ""}
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="buy-row">
            <div className="quantity">
              <button
                disabled={qty === 1}
                aria-label="Diminuir quantidade"
                onClick={() => setQty(qty - 1)}
              >
                <Minus size={17} />
              </button>
              <span>{qty}</span>
              <button
                disabled={qty === p.stock}
                aria-label="Aumentar quantidade"
                onClick={() => setQty(qty + 1)}
              >
                <Plus size={17} />
              </button>
            </div>
            <button className="primary" onClick={() => add(p, size, qty)}>
              <ShoppingCart size={19} />
              Adicionar ao carrinho
            </button>
            <button
              className={"icon-button " + (favorite ? "selected" : "")}
              aria-label="Favoritar produto"
              aria-pressed={favorite}
              onClick={toggleFavorite}
            >
              <Heart fill={favorite ? "currentColor" : "none"} />
            </button>
          </div>
          <form
            className="shipping-form"
            onSubmit={(e) => {
              e.preventDefault();
              setShipping(
                validCep(cep)
                  ? `Estimativa demonstrativa: 5–8 dias úteis · ${p.price * qty >= 19900 ? "Grátis" : money(1590)}`
                  : "Informe um CEP com 8 dígitos.",
              );
            }}
          >
            <label htmlFor="cep-product">
              <Truck size={17} />
              Calcular entrega
            </label>
            <div>
              <input
                id="cep-product"
                inputMode="numeric"
                placeholder="00000-000"
                maxLength={9}
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
              <button className="secondary">Calcular</button>
            </div>
            <p role="status">{shipping}</p>
          </form>
        </div>
      </section>
      <section className="panel detail-tabs">
        <div className="tabs">
          {["Descrição", "Especificações"].map((t) => (
            <button
              className={t === tab ? "active" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "Descrição" ? (
          <p>
            {descriptions[Number(p.id) - 1]} Imagens ilustrativas do projeto
            original. Preços e disponibilidade são demonstrativos.
          </p>
        ) : (
          <dl className="totals">
            <div>
              <dt>Categoria</dt>
              <dd>{p.category}</dd>
            </div>
            <div>
              <dt>Universo</dt>
              <dd>{p.universe}</dd>
            </div>
            <div>
              <dt>Referência</dt>
              <dd>GK-{p.id.padStart(4, "0")}</dd>
            </div>
            <div>
              <dt>Opções</dt>
              <dd>{p.sizes.join(", ")}</dd>
            </div>
          </dl>
        )}
      </section>
    </>
  );
}
function CheckoutForm({ profile, delivery, setDelivery, onSubmit }) {
  const [payment, setPayment] = useState("pix");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  function submit(e) {
    e.preventDefault();
    if (submitting.current) return;
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!validCep(data.cep)) {
      setError("Informe um CEP válido com 8 dígitos.");
      return;
    }
    if (
      !data.name.trim() ||
      !data.street.trim() ||
      !data.city.trim() ||
      !data.number.trim()
    ) {
      setError("Preencha os dados de entrega.");
      return;
    }
    submitting.current = true;
    onSubmit({ ...data, payment });
  }
  return (
    <form className="checkout-form" onSubmit={submit}>
      <section className="panel">
        <h2>
          <span className="step">1</span>Seus dados
        </h2>
        <div className="form-grid">
          <label>
            Nome completo
            <input
              name="name"
              autoComplete="name"
              defaultValue={profile?.name || ""}
              required
              minLength={3}
            />
          </label>
          <label>
            E-mail
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={profile?.email || ""}
              required
            />
          </label>
        </div>
      </section>
      <section className="panel">
        <h2>
          <span className="step">2</span>Endereço de entrega
        </h2>
        <div className="form-grid">
          <label>
            CEP
            <input
              name="cep"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              required
              pattern="[0-9]{5}-?[0-9]{3}"
            />
          </label>
          <label>
            Estado
            <select name="state" required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                .split(" ")
                .map((s) => (
                  <option key={s}>{s}</option>
                ))}
            </select>
          </label>
          <label className="span-two">
            Rua / Avenida
            <input name="street" autoComplete="address-line1" required />
          </label>
          <label>
            Número
            <input name="number" required />
          </label>
          <label>
            Complemento (opcional)
            <input name="extra" />
          </label>
          <label>
            Bairro
            <input name="neighborhood" required />
          </label>
          <label>
            Cidade
            <input name="city" autoComplete="address-level2" required />
          </label>
        </div>
        <h3>Opções de entrega</h3>
        {[
          [
            "standard",
            "Entrega padrão",
            "5–8 dias úteis · grátis a partir de R$ 199",
          ],
          ["express", "Entrega expressa", "2–3 dias úteis · R$ 29,90"],
        ].map(([value, title, description]) => (
          <label className="radio-card" key={value}>
            <input
              type="radio"
              name="delivery"
              checked={delivery === value}
              onChange={() => setDelivery(value)}
            />
            <span>
              <b>{title}</b>
              <small>{description}</small>
            </span>
          </label>
        ))}
        <small className="muted">
          Valores e prazos são exemplos, sem consulta a transportadoras.
        </small>
      </section>
      <section className="panel">
        <h2>
          <span className="step">3</span>Forma de pagamento
        </h2>
        {[
          ["pix", "Pix"],
          ["card", "Cartão"],
          ["boleto", "Boleto"],
        ].map(([value, label]) => (
          <label className="radio-card" key={value}>
            <input
              type="radio"
              name="payment"
              value={value}
              checked={payment === value}
              onChange={() => setPayment(value)}
            />
            {label} (simulação)
          </label>
        ))}
        <p className="muted">
          Não solicitamos dados bancários. A confirmação registra apenas um
          pedido de demonstração neste navegador.
        </p>
        <label className="check-label">
          <input type="checkbox" required />
          Entendo que este pedido é uma simulação.
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary full" type="submit">
          <ShieldCheck size={19} />
          Confirmar pedido demonstrativo
        </button>
      </section>
    </form>
  );
}
function Order({ order, go }) {
  if (!order)
    return (
      <div className="empty">
        <Package size={42} />
        <h1>Pedido não encontrado</h1>
        <p>Os pedidos ficam salvos apenas neste navegador.</p>
        <button className="primary" onClick={() => go("/")}>
          Voltar à loja
        </button>
      </div>
    );
  return (
    <section className="success">
      <span className="success-icon">
        <Check size={38} />
      </span>
      <span className="eyebrow">MISSÃO CUMPRIDA</span>
      <h1>Seu pedido foi registrado!</h1>
      <p>Obrigado por explorar o universo GeekStore.</p>
      <div className="notice">
        Pedido demonstrativo. Nenhuma cobrança ou entrega será realizada.
      </div>
      <div className="panel">
        <div className="section-heading">
          <h2>{order.id}</h2>
          <span className="green">Simulação concluída</span>
        </div>
        <p className="muted">
          {new Date(order.date).toLocaleString("pt-BR")} ·{" "}
          {order.payment === "pix"
            ? "Pix"
            : order.payment === "card"
              ? "Cartão"
              : "Boleto"}
        </p>
        {order.items.map((r, i) => (
          <div className="order-row" key={i}>
            <span>
              {r.qty}× {r.name}
              <small>{r.size}</small>
            </span>
            <b>{money(r.qty * r.price)}</b>
          </div>
        ))}
        <dl className="totals">
          <div>
            <dt>Frete</dt>
            <dd>{money(order.shipping)}</dd>
          </div>
          <div>
            <dt>Desconto</dt>
            <dd>− {money(order.discount)}</dd>
          </div>
          <div className="total">
            <dt>Total</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
      </div>
      <button className="primary" onClick={() => go("/")}>
        Continuar explorando <ArrowRight size={18} />
      </button>
    </section>
  );
}
function Account({ profile, orders, onSave, onLogout, onOrder }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function submit(e) {
    e.preventDefault();
    if (pending.current) return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const user = register
        ? await registerAccount(data)
        : await loginAccount(data);
      form.reset();
      onSave(user);
    } catch (err) {
      setError(err.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <div className="notice">
        Conta de demonstração salva apenas neste navegador. Use uma senha de
        teste.
      </div>
      {profile ? (
        <>
          <h3>Olá, {profile.name}!</h3>
          <p>{profile.email}</p>
          <button className="secondary" onClick={onLogout}>
            <LogOut size={16} />
            Sair do perfil
          </button>
          <h3>Pedidos neste navegador</h3>
          {orders.length ? (
            orders.map((o) => (
              <button
                className="order-link"
                key={o.id}
                onClick={() => onOrder(o.id)}
              >
                <span>
                  {o.id}
                  <small>{new Date(o.date).toLocaleDateString("pt-BR")}</small>
                </span>
                <b>{money(o.total)}</b>
                <ChevronRight size={17} />
              </button>
            ))
          ) : (
            <p className="muted">
              Seus pedidos demonstrativos aparecerão aqui.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="tabs">
            <button
              className={!register ? "active" : ""}
              disabled={busy}
              onClick={() => {
                setRegister(false);
                setError("");
              }}
            >
              Entrar
            </button>
            <button
              className={register ? "active" : ""}
              disabled={busy}
              onClick={() => {
                setRegister(true);
                setError("");
              }}
            >
              Cadastrar
            </button>
          </div>
          <p>
            {register
              ? "Crie sua conta com nome, e-mail e uma senha simples."
              : "Entre com seu e-mail e senha cadastrados."}
          </p>
          <form
            className="account-form"
            key={register ? "register" : "login"}
            onSubmit={submit}
          >
            {register && (
              <label>
                Seu nome
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  disabled={busy}
                />
              </label>
            )}
            <label>
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={busy}
              />
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={register ? 6 : undefined}
                disabled={busy}
                aria-describedby={register ? "password-hint" : undefined}
              />
            </label>
            {register && (
              <small id="password-hint" className="muted">
                Pelo menos 6 caracteres, sem exigência de símbolos.
              </small>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="primary full" disabled={busy}>
              {busy ? "Aguarde..." : register ? "Criar conta" : "Entrar"}
              <ArrowRight size={17} />
            </button>
          </form>
        </>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

