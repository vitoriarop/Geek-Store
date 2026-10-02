# Validação

- `npm test`: 5 testes aprovados (estoque entre tamanhos, recuperação de dados, totais/cupom/frete, linhas duplicadas e CEP).
- `npm run build`: aprovado, bundle de produção gerado em `dist/`.
- Build servido com `npm run preview` e aberto no navegador.
- Busca por Caneca retornou um produto.
- Favorito incluído e exibido na tela de favoritos.
- Camiseta tamanho M, quantidade 2, adicionada corretamente; carrinho preservado após recarregar.
- Checkout com dados fictícios concluído: copo de R$ 139,90, desconto GEEK15 de R$ 20,99, frete de R$ 15,90, total R$ 134,81. Carrinho esvaziado após confirmação.
- Layout inspecionado em larguras de celular e desktop; sem transbordamento horizontal no celular.
- Nenhum erro de console registrado na verificação do build.

## Restrição do ambiente de execução

O processo de desenvolvimento (`npm run dev`) iniciou, mas o otimizador nativo do esbuild foi bloqueado pelo sandbox ao consultar uma pasta ancestral fora do projeto. Isso impediu validar o modo de desenvolvimento neste ambiente. O build e o modo preview foram executados com sucesso. O carregador de configuração `runner` evita a etapa nativa de empacotamento da configuração.

Para abrir a versão já validada: `npm run preview`. Em uma instalação local comum, tente `npm run dev` para desenvolvimento com atualização automática.

## Cadastro com senha
- Sete testes aprovados, incluindo cadastro, login, senha incorreta, e-mail duplicado, senha curta e falha de armazenamento.
- Build de produção aprovado após a alteração.
- Login exige e-mail e senha; cadastro exige nome, e-mail e senha de 6 caracteres.

