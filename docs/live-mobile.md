# TV ao vivo em dispositivos móveis

Em 23/10/2026 foram investigados o código do Ziezo e as páginas públicas do EmbedTV. A configuração publicada pelo provedor utiliza no-referrer e iframe sem sandbox. O Ziezo conserva sandbox no modo protegido e oferece modo compatível explícito, sem sandbox. Esse modo pode permitir publicidade e navegação do provedor; não deve ser descrito como bloqueador de anúncios.

O player móvel tem altura mínima de 280px, botão para abrir o provedor no navegador, botão para focar o frame e rolagem até a região do player ao escolher canal. Os seis filtros e a lista permanecem inalterados. A proporção retorna a 16:9 em paisagem.

Na inspeção, a página da CNN Brasil apontava para um recurso de erro do provedor. O iframe de Globo SP apresentou controles e pôster; isso não comprova reprodução. Scripts de publicidade também produziram erro no console. Nenhuma fonte interna foi extraída ou substituída.

Limitações: o documento externo não informa progresso ou erros ao Ziezo. O modo compatível é uma alternativa de incorporação e não garante disponibilidade. Teste físico em Android e Safari ainda necessário; tamanho móvel no desktop não simula codecs nem políticas de autoplay.
