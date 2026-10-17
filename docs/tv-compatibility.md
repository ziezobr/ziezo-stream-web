# Compatibilidade com TV

- Identificação automática de webOS/Web0S, Tizen, Smart TV, NetCast, HbbTV, Bravia, Viera, Google/Android TV e Fire TV. Preferência manual permanece disponível; ?tv=on e ?tv=off substituem a preferência salva.
- Menu simples e CSS específico de TV, sem animações ou filtros de fundo; controle remoto navega pelo foco espacial e teclas de retorno fecham diálogos quando o evento chega ao documento principal.
- Compilação JavaScript e CSS com alvo Chromium 79. A LG documenta Chromium 94 no webOS 23, 87 no webOS 22 e 79 no webOS 6. Não é garantia para modelos antigos anteriores ao alvo.
- Player incorporado recebe permissão de autoplay, tela cheia e conteúdo criptografado. O botão Controlar vídeo transfere o foco para o frame. Abrir player diretamente oferece alternativa para navegadores que falham dentro do frame.
- O site não altera os codecs, DRM, certificados, scripts ou políticas do fornecedor externo. Sua compatibilidade não pode ser garantida pelo código do Ziezo.
- Testes: reconhecimento de identificadores, exceções desktop/celular, preferências e compilação de produção. Verificação visual no modo TV em navegador desktop; não foi realizado teste físico em LG ou Samsung.

Referência: https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine
