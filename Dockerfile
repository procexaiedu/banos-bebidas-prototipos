# Baños Bebidas, LP estática servida por Nginx (atrás do Traefik)
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# só o que o site usa (o .dockerignore tira o resto)
COPY index.html catalogo.html blog-*.html robots.txt sitemap.xml llms.txt llms-full.txt /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY fonts/ /usr/share/nginx/html/fonts/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1/robots.txt || exit 1
