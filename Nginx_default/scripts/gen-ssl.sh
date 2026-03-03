#!/bin/sh
set -e

CERT_PATH="/certs/localhost.crt"
KEY_PATH="/certs/localhost.key"

if [ ! -f "$CERT_PATH" ]; then
    echo "🔐 Генерация самоподписанного сертификата..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_PATH" \
        -out "$CERT_PATH" \
        -subj '/CN=localhost' \
        -addext 'subjectAltName = DNS:localhost, IP:127.0.0.1'
    echo "✅ Сертификаты созданы:"
    echo "   - $KEY_PATH"
    echo "   - $CERT_PATH"
else
    echo "✅ Сертификаты уже существуют"
fi