# ZIEZO STREAM Android 2.3.3

Aplicativo WebView para Android 8 ou superior, celular, tablet e Android TV. Identificador: com.ziezostream.android. Sem bibliotecas nativas específicas de arquitetura.

Abre https://ziezobr.github.io/ziezo-stream-web/ e acrescenta ?tv=on em Android TV. O catálogo e o site recebem as alterações publicadas sem reinstalação. Atualizações do binário APK ainda exigem instalar a versão nova, assinada com a mesma chave. LG webOS e Samsung Tizen não executam APK.

Inclui logo e banner Android TV, navegação Voltar/Início/Recarregar, suporte ao vídeo em tela cheia. Requer internet e Android System WebView atualizado. A disponibilidade e a compatibilidade dos players externos variam.

## Compilar

JDK 21, Android SDK 36 e Build Tools instalados. Configure android/local.properties com sdk.dir ou ANDROID_HOME. Execute gradlew assembleRelease lintRelease dentro de android. O workflow do GitHub gera um APK sem assinatura apenas para validação; ele não é o instalador público.

## Assinatura de distribuição

O APK público usa chave de produção privada mantida fora deste repositório. Nunca envie keystore ou senha ao Git. A chave e suas credenciais devem ser preservadas pelo proprietário para futuras atualizações. Use zipalign antes de apksigner sign e confira com apksigner verify --verbose --print-certs. O APK assinado e SHA256SUMS-Android.txt ficam em public/downloads e são distribuídos diretamente na aba Downloads do site. Não há release pública Android.

## Validação e limites

Compilação release, Android Lint e assinatura são verificáveis localmente. Sem dispositivo Android ou emulador conectado, a instalação e retomada precisam de validação física. O app solicita REQUEST_INSTALL_PACKAGES para abrir a confirmação do instalador. A ponte JavaScript expõe somente orientação; a seleção de foto usa o seletor do sistema. Conteúdo HTTP e acesso a arquivos no WebView estão desativados.

## Atualização pelo banner

Na versão 2.3.3, Atualizar agora obtém o APK pelo DownloadManager e abre a confirmação de instalação diretamente. Nenhum gerenciador de arquivos é necessário. O Android pode pedir uma autorização para instalar a partir da ZIEZO e sempre pode exigir confirmação final; não há instalação silenciosa.

O download usa nome único, ID persistido e consulta periódica enquanto o app está visível. Reabrir o app recupera uma atualização concluída. Se a pessoa cancelar o instalador, o botão permite tentar novamente sem baixar de novo. Falha de download libera nova tentativa. Ao mudar a versão instalada, o estado pendente anterior é descartado. O instalador só é aberto com a Activity em primeiro plano.

Publicação deve atualizar em conjunto APK assinado, SHA256SUMS-Android.txt, android-latest.json e cartão Downloads. A assinatura deve permanecer igual à versão instalada. Versões antigas recebem a 2.3.3 usando seu próprio atualizador; aparelhos com fluxo antigo quebrado podem exigir a instalação desta versão uma vez.

