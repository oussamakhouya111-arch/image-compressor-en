FROM python:3.12-slim
WORKDIR /site
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "python -m http.server ${PORT:-3000} --bind 0.0.0.0"]
