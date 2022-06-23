FROM python:3.9.13-buster

RUN mkdir -p /opt/formsolutions_mock

COPY index.html /opt/formsolutions_mock/index.html
COPY index.js /opt/formsolutions_mock/index.js
COPY style.css /opt/formsolutions_mock/style.css

CMD python3 -m http.server 8080 --directory /opt/formsolutions_mock/

EXPOSE 8080