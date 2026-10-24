# Qualidade e revisão

## Portão canônico

`npm run check` executa testes Node, verificação TypeScript e build Vite. A CI do GitHub Pages executa testes e build antes da publicação.

## Players: classificação de falhas

1. **Local:** URL inválida, ID fora do contrato, iframe ausente, sandbox/permissões incorretas, botão sem ação ou estado visual enganoso. Deve ser reproduzido e corrigido no repositório.
2. **Documento externo:** DNS, TLS, HTTP, CSP ou bloqueio de incorporação. `npm run audit:players` registra a página afetada sem procurar playlists ou mídia interna.
3. **Interno ao iframe:** vídeo ausente, anúncio, faixa de áudio, servidor, codec ou DRM. A política de mesma origem impede diagnóstico pelo frontend; precisa ser verificado pelo provedor.
4. **Dispositivo:** WebView antigo, codec/DRM, rotação ou tela cheia. Exige teste no aparelho e não pode ser inferido apenas pelo build.

## Revisão por risco

- Auth, RLS, armazenamento e dados: revisão de segurança e isolamento por usuário.
- Player e navegação: comportamento, acessibilidade, mobile/TV e regressões.
- APK/desktop: versão, assinatura, manifesto, instalador e atualização.
- Dependências: versões fixas e lockfile; não aplicar atualização principal automática.

## Harness

Modo: adaptação nativa inspirada no Harness², não o CLI oficial. Caso inicial: o inventário não encontrou instruções canônicas nem um diagnóstico reproduzível dos players. Candidato adotado: `AGENTS.md`, documentos responsáveis, comandos canônicos e auditoria de embeds. A reexecução deve preservar personalizações e não duplicar seções.

## Limites atuais

Não há ESLint configurado; TypeScript e os testes existentes formam o portão atual. Context7, Graphify, Sentry e revisão independente não estavam disponíveis nesta sessão. Testes físicos em TV e Android continuam necessários para codecs, WebView e reprodução externa.

## Auditoria de players em 21/10/2026

A auditoria verificou 145 páginas configuradas de TV e dois contratos de filme/série. Resultado: 147 respostas HTTP aceitas, nenhum URL inválido ou duplicado e nenhum cabeçalho explícito bloqueando iframe. Isso comprova somente que as páginas externas responderam naquele instante. Não comprova reprodução, áudio dublado, codec, DRM, anúncio, conteúdo correto ou funcionamento em uma TV física.

## Correções de 24/10/2026

- Downloads e janela Instalar leem versão e URL do mesmo manifesto android-latest.json; eliminado link antigo 2.1.
- TV retorna ao modo protegido quando o canal muda, para não herdar a permissão de navegação do canal anterior.
- Indicador sobre o player de TV sai após 20 segundos; aviso e ações de recuperação continuam fora do iframe.
- Critérios: manifesto aponta para APK existente; nenhuma versão Android literal nesses dois componentes; troca de canal redefine proteção; testes, tipos e build passam. Não altera binário Android nem garante reprodução de terceiros.
