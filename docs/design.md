# Design e acessibilidade

## Direção

Interface escura de cinema, marca Ziezo em alto contraste e realce verde. O layout precisa funcionar em celular, desktop e televisão sem depender de animações.

## Regras verificáveis

- Alvos de toque devem permanecer grandes e espaçados no celular.
- Botões precisam de nome acessível e estado de foco visível.
- Modais preservam saída por botão e teclado quando o evento chega ao documento principal.
- Estados de carregamento, erro e recuperação usam texto; cor não pode ser o único sinal.
- Em TV, reduzir filtros, transições e dependência de hover.
- Tela cheia não deve manter controles de fechar sobre o vídeo; controles reaparecem quando necessários.

## Players

O contêiner pode informar “frame carregado”, nunca “vídeo disponível”. Áudio, legenda, anúncios, servidor e lista interna de episódios pertencem ao iframe externo. Em mobile, seleção de temporada/episódio deve ocupar largura útil antes de abrir o player.

## Validação visual

Testar largura móvel, desktop e modo TV; teclado; orientação; foco no iframe; carregamento lento; ausência de rede; e retorno da tela cheia. Teste em navegador não substitui teste físico em webOS/Android.

## Atualização visual de 23/10/2026

Paleta escura neutra com verde da marca, cartões de descoberta adaptados de Hirael Feature 08 (MIT/21st.dev), navegação Notch existente, tipografia e espaçamento consistentes em catálogo, TV, downloads, perfis e acesso. A logo e os seis filtros da TV permanecem inalterados. O efeito de luz usa propriedades CSS sem renderizar React a cada movimento e fica desativado no modo TV; nenhuma dependência nova foi adicionada.
