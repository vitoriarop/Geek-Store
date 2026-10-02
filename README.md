# 🎮 GeekStore

**Sua cultura pop, do seu jeito.**

Loja virtual demonstrativa de produtos geek, desenvolvida com **React e Vite**. O projeto reúne catálogo, favoritos, carrinho e checkout em uma interface responsiva com tema escuro e destaques em roxo.

## ✨ Funcionalidades

- **Catálogo:** oito produtos com busca por nome, filtros por categoria e ordenação por preço.
- **Página de produto:** descrição, especificações, seleção de tamanho e quantidade.
- **Favoritos:** produtos salvos para consultar depois.
- **Carrinho:** adicionar, remover e alterar quantidades, respeitando o estoque demonstrativo.
- **Cupom:** aplicação do código `GEEK15` para 15% de desconto nos produtos.
- **Checkout:** formulário de entrega validado, opções de frete e seleção de pagamento.
- **Pedidos:** confirmação com resumo da compra e histórico neste navegador.
- **Cadastro e login:** criação de conta local com nome, e-mail e senha; entrada com e-mail e senha.
- **Persistência:** carrinho, favoritos, contas e pedidos armazenados com `localStorage`.
- **Responsividade e acessibilidade:** adaptação a celular e desktop, navegação por teclado e modais com controle de foco e fechamento por Escape.

> Este projeto funciona como uma demonstração de frontend. Pagamentos, fretes, estoque e pedidos são simulados; não há backend ou transações reais.

## 🛠️ Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React 19 | Componentes e estado da interface |
| Vite 6 | Servidor de desenvolvimento e build |
| JavaScript | Comportamento das telas e regras da loja |
| CSS | Tema, componentes e layout responsivo |
| Lucide React | Ícones |
| Web Crypto API | Derivação de senhas para o cadastro local |
| Node.js Test Runner | Testes das regras de carrinho e conta |
| Prettier | Formatação do código |

## 🚀 Como executar

### Pré-requisitos

- Node.js 22.
- npm instalado com o Node.js.

### 1. Abra a pasta do projeto

Após clonar o repositório ou extrair o ZIP, abra no VS Code a pasta que contém o arquivo **`package.json`**.

Se você extraiu o arquivo `geekstore-react-vite.zip` e está na pasta externa, entre na subpasta:

```powershell
cd geekstore
```

### 2. Instale as dependências

```sh
npm install
```

### 3. Inicie o servidor

```sh
npm run dev
```

Abra o endereço exibido no terminal, normalmente [http://127.0.0.1:5173](http://127.0.0.1:5173).

### Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o desenvolvimento com atualização automática |
| `npm test` | Executa os testes de carrinho e conta |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve a versão de produção localmente |

Para conferir o build:

```sh
npm run build
npm run preview
```

## 🧭 Navegação

| Rota | Tela |
| --- | --- |
| `#/` | Página inicial e catálogo |
| `#/favoritos` | Produtos favoritos |
| `#/produto/1` | Detalhes do produto de ID 1 |
| `#/checkout` | Finalização do pedido |
| `#/pedido/ID` | Confirmação de um pedido salvo |

O carrinho e a conta abrem em modais. A navegação por hash permite servir o projeto em hospedagens estáticas sem regras de redirecionamento para as rotas.

## 🛒 Regras da demonstração

| Regra | Comportamento |
| --- | --- |
| Cupom `GEEK15` | Desconto de 15% no subtotal dos produtos |
| Frete padrão | R$ 15,90; grátis a partir de R$ 199,00 de subtotal, antes do desconto |
| Frete expresso | R$ 29,90 |
| Estoque | Limite por produto, compartilhado entre tamanhos |
| Pagamento | Pix, cartão ou boleto, todos simulados |
| Senha | Mínimo de 6 caracteres, sem exigência de símbolos |

### Cadastro e login

1. Abra **Minha Conta** e selecione **Cadastrar**.
2. Preencha nome, e-mail e uma senha de teste.
3. Após sair do perfil, entre novamente usando o e-mail e a senha cadastrados.

O cadastro rejeita e-mails duplicados e o login valida as credenciais. As senhas são derivadas com **PBKDF2, SHA-256 e salt aleatório**, sem armazenamento em texto puro.

A conta existe apenas no navegador em que foi criada. Essa implementação local não substitui autenticação em servidor. Use dados fictícios e uma senha que não utilize em outros serviços.

### Armazenamento

- Os dados permanecem após recarregar a página, quando o armazenamento está disponível.
- Limpar os dados do site remove as contas, os favoritos, o carrinho e os pedidos salvos.
- O histórico de pedidos pertence ao navegador e não é separado por conta.
- O endereço preenchido no checkout não é persistido no pedido.
- Se o navegador bloquear o armazenamento, o cadastro informa o erro e os demais estados podem permanecer apenas em memória.

## 📁 Estrutura do projeto

```text
geekstore/
├── public/
│   ├── images/
│   │   ├── goku-kamehameha.png
│   │   ├── luffy-gear-5.png
│   │   └── hero-geekstore.png
│   └── placeholder.svg
├── src/
│   ├── main.jsx           # Componentes, telas e navegação
│   ├── styles.css        # Estilos e responsividade
│   ├── catalog.json      # Produtos, preços e imagens
│   ├── store.js          # Carrinho, totais e armazenamento
│   ├── store.test.js     # Testes das regras da loja
│   ├── auth.js           # Cadastro e login locais
│   └── auth.test.js      # Testes das contas
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── VALIDACAO.md
└── README.md
```

## 🖼️ Imagens

As imagens de Goku e Luffy estão incluídas em `public/images/`, com resolução de **1024 × 1024**. A capa local tem **1376 × 768**, com enquadramento por CSS.

As imagens dos demais produtos usam URLs externas. As fontes são carregadas pelo Google Fonts. Esses recursos dependem de conexão e da disponibilidade dos serviços; os produtos possuem uma imagem alternativa local para falhas de carregamento.

## 🧪 Testes

```sh
npm test
```

A suíte verifica:

- Quantidades e limite de estoque entre tamanhos.
- Recuperação de carrinhos inválidos e tratamento de linhas duplicadas.
- Cálculo de subtotal, cupom e frete em centavos.
- Formato do CEP.
- Cadastro, normalização de e-mail e login.
- Rejeição de senha incorreta, conta inexistente, e-mail duplicado e senha curta.
- Falha ao salvar o cadastro e ausência da senha em texto puro no armazenamento.

Consulte [VALIDACAO.md](./VALIDACAO.md) para as verificações realizadas e as restrições encontradas no ambiente de desenvolvimento.

## 📦 Build e publicação

```sh
npm run build
```

Publique o conteúdo da pasta `dist/` em uma hospedagem estática. A configuração `base: './'` permite servir o projeto em subpastas.

Use um servidor HTTP para abrir o projeto; não execute `index.html` diretamente pelo explorador de arquivos. Para disponibilizá-lo na internet, use HTTPS, necessário para a Web Crypto API fora de ambientes locais confiáveis.

## 🔧 Problemas comuns

### `Missing script: "dev"`

O terminal provavelmente está fora da pasta do projeto. Confira se a pasta atual contém o `package.json` da GeekStore:

```powershell
dir
```

Se houver uma subpasta `geekstore`, execute:

```powershell
cd geekstore
npm install
npm run dev
```

### Falha no servidor de desenvolvimento

Confira a versão do Node.js com `node --version` e reinstale as dependências com `npm install`. Em ambientes com restrições de acesso a pastas, consulte as notas em [VALIDACAO.md](./VALIDACAO.md).

Se o build concluir, você também pode abrir a versão de produção:

```sh
npm run build
npm run preview
```

## Próximas etapas

- Integrar uma API de produtos, estoque e pedidos.
- Implementar autenticação e sessões no servidor.
- Vincular o histórico de pedidos à conta autenticada.
- Integrar cotação de frete e provedor de pagamento.
- Validar preços, descontos e disponibilidade no backend.
- Hospedar todos os recursos de imagem junto ao projeto.

---

Projeto demonstrativo de uma experiência de compra para fãs de anime, games e cultura pop.
