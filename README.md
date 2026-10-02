# GeekStore — React + Vite

Frontend responsivo construído a partir das seis telas do ZIP original. Mantém a identidade escura, os destaques roxos e o catálogo ilustrado fornecido.


```

## Funcionalidades

- Catálogo com oito produtos, busca por nome, categorias e ordenação por preço.
- Abas de destaques, mais desejados e lançamentos com ordenação demonstrativa.
- Detalhe de cada produto, tamanho de roupa, quantidade, descrição e especificações.
- Favoritos e carrinho persistidos no navegador, com remoção e limite de estoque por produto.
- Cupom GEEK15: 15% sobre produtos. Frete padrão de R$ 15,90, grátis a partir de R$ 199 de subtotal. Frete expresso de R$ 29,90.
- Checkout com validação dos campos, CEP, opções de entrega e seleção de pagamento simulado.
- Confirmação de pedido e histórico local com valores e produtos da compra.
- Perfil demonstrativo para preencher nome e e-mail no checkout.
- Layout responsivo, navegação por teclado, fechamento de modal por Escape e gerenciamento de foco.

## Limites da demonstração

Não há backend. Cadastrar cria uma conta local com nome, e-mail e senha de pelo menos 6 caracteres. Entrar verifica e-mail e senha. Senhas são derivadas com PBKDF2 e salt aleatório, sem armazenamento em texto puro. É uma demonstração local, sem autenticação em servidor. Perfis antigos sem senha precisam se cadastrar novamente. Pix, cartão e boleto são escolhas de simulação: não há cobrança, QR Code, boleto emitido ou envio. Dados de entrega não são persistidos. Use dados fictícios.

Carrinho, favoritos, perfil e pedidos ficam em localStorage neste navegador. O histórico é do navegador, não de uma conta autenticada. Limpar os dados do site remove esse conteúdo. Com armazenamento desativado, a interface continua em memória, mas os dados não permanecem após recarregar.

O catálogo, estoque, popularidade e prazos são dados demonstrativos. Os valores de venda e estoque devem ser recalculados e validados no servidor em uma implantação comercial. Integre API de catálogo/pedidos, autenticação segura, frete e um provedor de pagamento antes de operar a loja.

As imagens originais usam URLs externas do Google; as fontes usam Google Fonts. Portanto, precisam de conexão e da disponibilidade desses serviços. Produtos têm imagem alternativa local quando a original falha. Para publicação, substitua por arquivos hospedados e com direitos de uso adequados.

## Organização

- `src/main.jsx`: componentes, telas, navegação por hash e fluxo da loja.
- `src/styles.css`: identidade visual e regras responsivas.
- `src/catalog.json`: dados e URLs de imagem extraídos do layout.
- `src/store.js`: regras de carrinho, estoque, valores e armazenamento.
- `src/store.test.js`: testes das regras de negócio.
- `public/placeholder.svg`: alternativa local para imagens indisponíveis.

Rotas: `#/`, `#/favoritos`, `#/produto/1`, `#/checkout` e `#/pedido/ID`. As rotas por hash funcionam em hospedagem estática sem regras de rewrite. O `base: './'` permite servir a aplicação também em subpastas.

## Publicar

Execute `npm run build` e publique o conteúdo de `dist/` em uma hospedagem estática. Não abra `index.html` diretamente pelo explorador: utilize um servidor HTTP.

## Imagens locais atualizadas
Goku e Luffy usam PNGs locais de 1024 x 1024 em public/images. A capa usa o PNG enviado em 1376 x 768, com enquadramento via CSS para ocultar as faixas de navegação e produtos embutidas na arte. Os arquivos são preservados na resolução original, sem ampliação artificial. Os demais produtos continuam usando as URLs originais.

