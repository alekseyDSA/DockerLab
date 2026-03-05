#!/usr/bin/env python3
"""
Тесты docker-compose файлов.
Проверяет синтаксис и логику compose-файлов.
"""

import yaml
import pytest
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent

class TestDockerCompose:
    """Тестирование docker-compose файлов"""

    def load_yaml(self, filename):
        """Загрузка YAML с правильной кодировкой"""
        filepath = ROOT_DIR / filename
        with open(filepath, 'r', encoding='utf-8-sig') as f:  # utf-8-sig игнорирует BOM
            return yaml.safe_load(f)

    def test_base_compose_syntax(self):
        """Проверка синтаксиса base.yml"""
        data = self.load_yaml('docker-compose.base.yml')

        assert 'services' in data
        assert 'nginx' in data['services']
        assert 'certbot' in data['services']

        nginx = data['services']['nginx']
        assert 'image' in nginx
        assert 'volumes' in nginx
        assert 'networks' in nginx

    def test_dev_compose_syntax(self):
        """Проверка синтаксиса dev.yml"""
        data = self.load_yaml('docker-compose.dev.yml')

        assert 'services' in data
        assert 'nginx' in data['services']
        assert 'ports' in data['services']['nginx']

    def test_prod_compose_syntax(self):
        """Проверка синтаксиса prod.yml"""
        data = self.load_yaml('docker-compose.prod.yml')

        assert 'services' in data
        assert 'nginx' in data['services']
        assert 'depends_on' in data['services']['nginx']
        assert 'healthcheck' in data['services']['certbot']

    def test_setup_compose_syntax(self):
        """Проверка синтаксиса setup.yml"""
        data = self.load_yaml('docker-compose.setup.yml')

        assert 'services' in data
        assert 'ssl-gen' in data['services']
        assert 'ssl-check' in data['services']