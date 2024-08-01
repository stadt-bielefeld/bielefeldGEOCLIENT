FROM python:3.9.13-buster

RUN mkdir -p /docs/
RUN mkdir -p /docs/source/
RUN mkdir -p /docs/build/

WORKDIR /docs/
COPY requirements.txt .
COPY source/ ./source/

RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

CMD sphinx-build -E -b html -d ./build/doctrees ./source ./build/html && python3 -m http.server 8080 --directory ./build/html

EXPOSE 8080
