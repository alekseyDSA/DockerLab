#!/usr/bin/env python3
"""
Тесты конфигурации nginx.
Проверяет синтаксис и логику конфигов.
"""

import os
import subprocess
import pytest
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent

def test_nginx_configs_syntax():
    """Проверка синтаксиса всех конфигов nginx"""
    config_dirs = [
        ROOT_DIR / 'conf.d/development',
        ROOT_DIR / 'conf.d/production',
    ]

    # Проверяем наличие nginx
    try:
        subprocess.run(['nginx', '-v'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        pytest.skip("nginx не установлен на этой системе (тест пропущен)")

    for config_dir in config_dirs:
        for config_file in config_dir.glob('*.conf'):
            result = subprocess.run(
                ['nginx', '-t', '-c', str(config_file)],
                capture_output=True,
                text=True
            )
            assert result.returncode == 0, \
                f"Ошибка в {config_file}:\n{result.stderr}"

def test_development_configs():
    """Проверка development конфигов"""
    http_conf = ROOT_DIR / 'conf.d/development/http.dev.conf'
    https_conf = ROOT_DIR / 'conf.d/development/https.dev.conf'

    # Проверка HTTP конфига
    with open(http_conf, 'r', encoding='utf-8') as f:
        content = f.read()
        assert 'listen 80;' in content
        assert 'server_name localhost;' in content
        assert 'root /usr/share/nginx/html;' in content

    # Проверка HTTPS конфига
    with open(https_conf, 'r', encoding='utf-8') as f:
        content = f.read()
        assert 'listen 443 ssl;' in content
        assert 'ssl_certificate' in content
        assert '/etc/nginx/ssl/localhost.crt' in content

def test_production_configs():
    """Проверка production конфигов"""
    prod_conf = ROOT_DIR / 'conf.d/production/main.prod.conf'

    with open(prod_conf, 'r', encoding='utf-8') as f:
        content = f.read()
        # Проверка наличия переменных
        assert '${DOMAIN}' in content
        # Проверка наличия ACME challenge
        assert '.well-known/acme-challenge' in content
        # Проверка редиректа
        assert 'return 301 https://' in content