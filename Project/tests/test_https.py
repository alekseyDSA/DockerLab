#!/usr/bin/env python3
"""
Интеграционные тесты для HTTPS.
"""

import subprocess
import requests
import pytest
import time

class TestHTTPS:
    """Тестирование HTTPS соединения"""

    @pytest.fixture(scope="class", autouse=True)
    def check_containers(self):
        """Проверка, что контейнеры запущены"""
        result = subprocess.run(
            ['docker', 'ps', '--filter', 'name=nginx-ssl', '--format', '{{.Names}}'],
            capture_output=True,
            text=True
        )
        if not result.stdout.strip():
            pytest.skip("Контейнеры не запущены. Запустите сначала docker-compose up")

    def test_http_responds(self):
        """Проверка, что HTTP отвечает"""
        response = requests.get('http://localhost:8080', timeout=5)
        assert response.status_code == 200

    def test_https_responds(self):
        """Проверка, что HTTPS отвечает (игнорируя сертификат)"""
        response = requests.get(
            'https://localhost:8443',
            verify=False,  # игнорируем самоподписанный сертификат
            timeout=5
        )
        assert response.status_code == 200

    def test_https_certificate(self):
        """Проверка информации о сертификате"""
        import ssl
        import socket

        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        with socket.create_connection(('localhost', 8443)) as sock:
            with context.wrap_socket(sock, server_hostname='localhost') as ssock:
                cert = ssock.getpeercert()
                # Для самоподписанного сертификата cert будет пустым
                # Проверяем, что соединение установлено
                assert ssock.version() in ['TLSv1.2', 'TLSv1.3']