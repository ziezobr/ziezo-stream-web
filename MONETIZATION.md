# Publicidade discreta — Google AdSense

Conta de editor: ca-pub-9523043610392807. Bloco manual: 3166345030.

A metatag verifica o vínculo do site com a conta, sem carregar publicidade. O arquivo ads.txt também precisa estar na raiz https://ziezobr.github.io/ads.txt, no repositório ziezobr.github.io. A raiz contém a entrada do aplicativo e o aviso de privacidade.

## Ativação

1. Aguardar aprovação do site no AdSense e resolver eventuais pendências apresentadas pelo Google.
2. Configurar o consentimento aplicável em Privacidade e mensagens, incluindo CMP certificada onde exigida. A integração não substitui uma CMP.
3. Manter anúncios automáticos e otimização automática desativados para ziezobr.github.io. Não inserir o script do Google globalmente; o componente carrega somente quando elegível.
4. Após as etapas anteriores, definir as variáveis de repositório ADSENSE_APPROVED=true e ADSENSE_CONSENT_READY=true e publicar novamente o site. Enquanto uma delas estiver ausente, nenhum anúncio ou script publicitário é carregado pelo aplicativo.

## Frequência e formato

- Primeiro anúncio elegível após 50 minutos da primeira visita ao espaço de publicidade. Intervalo mínimo de 50 minutos entre solicitações por navegador.
- No máximo uma solicitação por carregamento da página. Não há atualização automática de anúncios.
- O espaço precisa estar visível no catálogo e a aba ativa. Não há pop-ups, sobreposições ou interrupção do player.
- Perfis infantis, app Electron, player, detalhes e diálogos não solicitam anúncios.
- A frequência é compartilhada entre abas por localStorage e Web Locks. Sem armazenamento ou Web Locks, a exibição é suprimida.
- O intervalo não controla publicidade do provedor de vídeo externo.

Testes: node --test tests/ad-policy.test.mjs. Não clicar nos próprios anúncios nem usar anúncios reais em testes automatizados.

A aprovação e o pagamento dependem do Google. A existência da integração não garante elegibilidade do conteúdo, aprovação ou receita.
