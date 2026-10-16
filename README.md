# Ziezo Stream

Aplicativo React/Vite com Supabase Auth, perfis, lista e histórico por conta. Publicação automática no GitHub Pages a cada atualização da branch main.

## Desenvolvimento

Copie `.env.example` para `.env.local`, configure a URL e a chave publicável do Supabase e execute `npm ci` e `npm run dev`.

## Autenticação

O acesso usa somente e-mail e senha pelo Supabase Auth. Configure um SMTP próprio no painel para que confirmação de cadastro e recuperação de senha funcionem para visitantes externos à equipe. O serviço padrão do Supabase tem envio restrito. Nunca publique senha SMTP ou service role.

Site URL e redirects permitidos: `https://ziezobr.github.io/ziezo-stream-web/`. O reset de senha e a confirmação de e-mail retornam a este endereço.

## Player e histórico

Vídeos nativos salvam o tempo real do player. Players externos dependem dos recursos disponibilizados pelo provedor; não é possível presumir acesso ao tempo de um iframe de outra origem.

## Créditos

Metadados e imagens: TMDB. Este produto usa a API TMDB, mas não é endossado nem certificado pelo TMDB. Filmes abertos: Blender Foundation, CC BY 3.0; créditos e links de licença no aplicativo.

Navegação adaptada do componente Adaptive Notch Navigation Bar, Arunachalam / 21st.dev, licença MIT. Veja THIRD_PARTY_NOTICES.md.
