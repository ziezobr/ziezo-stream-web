# ZIEZO STREAM Android 2.1.0

Aplicativo WebView para Android 8 ou superior, celular, tablet e Android TV. Identificador: com.ziezostream.android. Sem bibliotecas nativas específicas de arquitetura.

Abre https://ziezobr.github.io/ziezo-stream-web/ e acrescenta ?tv=on em Android TV. O catálogo e o site recebem as alterações publicadas sem reinstalação. Atualizações do binário APK ainda exigem instalar a versão nova, assinada com a mesma chave. LG webOS e Samsung Tizen não executam APK.

Inclui logo e banner Android TV, navegação Voltar/Início/Recarregar, suporte ao vídeo em tela cheia. Requer internet e Android System WebView atualizado. A disponibilidade e a compatibilidade dos players externos variam.

## Compilar

JDK 21, Android SDK 36 e Build Tools instalados. Configure android/local.properties com sdk.dir ou ANDROID_HOME. Execute gradlew assembleRelease lintRelease dentro de android. O workflow do GitHub gera um APK sem assinatura apenas para validação; ele não é o instalador público.

## Assinatura de distribuição

O APK público usa chave de produção privada mantida fora deste repositório. Nunca envie keystore ou senha ao Git. A chave e suas credenciais devem ser preservadas pelo proprietário para futuras atualizações. Use zipalign antes de apksigner sign e confira com apksigner verify --verbose --print-certs. Distribua o APK assinado e SHA256SUMS-Android.txt em uma release separada android-v2.1.0, sem marcar como Latest para preservar o atualizador Windows.

## Validação e limites

Compilação release, Android Lint e assinatura são verificáveis localmente. Não havia dispositivo Android ou emulador conectado durante a preparação. Não foi feita instalação ou teste físico. Não há permissões de câmera, microfone, localização, arquivos, instalação de pacotes nem ponte JavaScript nativa. Conteúdo HTTP e acesso a arquivos no WebView estão desativados.
