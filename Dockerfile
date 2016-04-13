FROM nginx:1.9
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD /bin/bash -c "sed -i 's@API_URL@'"$API_URL"'@g' /usr/share/nginx/html/res/config/local/*.config* && sed -i 's@API_URL@'"$API_URL"'@g' /usr/share/nginx/html/scripts/main.* && nginx -g 'daemon off;'"

