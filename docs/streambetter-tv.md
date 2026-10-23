# TV ao vivo — StreamBetter

Status: integração revertida a pedido do proprietário em 23/10/2026. O provedor ativo voltou a ser EmbedTV, com os 145 canais anteriores e sandbox do iframe restaurado. As informações abaixo são o registro histórico da tentativa de migração.

Integração atualizada em 23/10/2026 usando a API pública `/api/channels`, três páginas de até 100 itens. Foram recebidos 213 registros e mantidos 188 após exclusões solicitadas pelo proprietário e remoção da categoria adulta. Campos ausentes de categoria e logo recebem valores seguros.

Cada canal utiliza a URL HTTPS de `/canal/` fornecida pela API. Busca, categorias, recarga, tela cheia e orientação permanecem no componente LiveTV. A lista é um snapshot; mudanças no provedor exigem nova sincronização.

O iframe da TV fica sem sandbox conforme o contrato documentado do StreamBetter. Publicidade, navegação e reprodução internas são controladas pelo provedor. O carregamento do documento não comprova transmissão disponível.

O APK 2.3.2 tem uma lista nativa de domínios permitidos que não inclui StreamBetter. A reprodução dentro desse APK precisa de atualização nativa e teste físico; esta entrega atualiza o site, não o binário Android.

Validação: TypeScript e build Vite aprovados; dois testes da auditoria de canais aprovados. Não foi certificada reprodução de todos os canais nem compatibilidade em aparelhos físicos.

Fonte: https://streambetter.lol/docs#canais
