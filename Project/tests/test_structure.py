#!/usr/bin/env python3
"""
Тесты структуры проекта.
Проверяет, что все необходимые файлы и папки существуют.
"""

import os
import pytest
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent  # Это D:\DockerLab\Nginx_default
PARENT_DIR = ROOT_DIR.parent  # Это D:\DockerLab (где лежит .gitignore)

def test_required_directories_exist():
    """Проверка наличия обязательных директорий внутри Nginx_default"""
    required_dirs = [
        'conf.d/development',
        'conf.d/production',
        'certs/self-signed',
        'certbot/www',
        'data',
        'scripts',
        'tests',
    ]

    for dir_path in required_dirs:
        full_path = ROOT_DIR / dir_path
        assert full_path.exists(), f"Директория {dir_path} не существует в {ROOT_DIR}"
        assert full_path.is_dir(), f"{dir_path} не является директорией"

def test_required_files_exist():
    """Проверка наличия обязательных файлов внутри Nginx_default"""
    required_files = [
        'docker-compose.base.yml',
        'docker-compose.dev.yml',
        'docker-compose.prod.yml',
        'docker-compose.setup.yml',
        '.env.dev',
        '.env.prod',
        'Dockerfile.ssl-gen',
        'scripts/gen-ssl.sh',
        'conf.d/development/http.dev.conf',
        'conf.d/development/https.dev.conf',
        'conf.d/production/main.prod.conf',
    ]

    for file_path in required_files:
        full_path = ROOT_DIR / file_path
        assert full_path.exists(), f"Файл {file_path} не существует в {ROOT_DIR}"
        assert full_path.is_file(), f"{file_path} не является файлом"

def test_gitignore_exists_in_parent():
    """Проверка, что .gitignore существует в родительской директории"""
    gitignore_path = PARENT_DIR / '.gitignore'
    assert gitignore_path.exists(), f".gitignore не найден в {PARENT_DIR}"
    assert gitignore_path.is_file(), ".gitignore не является файлом"

def test_gitignore_contains_required_patterns():
    """Проверка, что .gitignore содержит нужные паттерны"""
    gitignore_path = PARENT_DIR / '.gitignore'

    with open(gitignore_path, encoding='utf-8') as f:
        content = f.read()

    # Паттерны для игнорирования (общие для всех мини-проектов)
    required_patterns = [
        '.env',
        '.secrets',
        '*.key',
        '*.crt',
        '*.log',
        '.vscode/',
        '.idea/',
        '__pycache__/',
        '*.pyc',
    ]

    # Специфичные для Nginx_default (опционально, могут быть в родительском .gitignore)
    optional_patterns = [
        'certs/self-signed/',
        'data/',
        'certbot/www/',
    ]

    for pattern in required_patterns:
        assert pattern in content, f"Обязательный шаблон '{pattern}' не найден в .gitignore"

    # Для опциональных паттернов просто выводим предупреждение
    for pattern in optional_patterns:
        if pattern not in content:
            print(f"Предупреждение: шаблон '{pattern}' не найден в .gitignore (рекомендуется добавить)")

def test_project_structure_is_consistent():
    """Проверка согласованности структуры проекта"""
    # Проверяем, что в conf.d нет лишних файлов
    dev_dir = ROOT_DIR / 'conf.d/development'
    prod_dir = ROOT_DIR / 'conf.d/production'

    dev_files = list(dev_dir.glob('*.conf'))
    prod_files = list(prod_dir.glob('*.conf'))

    # В development должно быть 2 конфига (http и https)
    assert len(dev_files) == 2, f"В development должно быть 2 .conf файла, найдено {len(dev_files)}"

    # В production должен быть 1 конфиг (main.prod.conf)
    assert len(prod_files) == 1, f"В production должен быть 1 .conf файл, найдено {len(prod_files)}"

    # Проверяем, что нет конфликтующих имен
    dev_names = [f.name for f in dev_files]
    assert 'http.dev.conf' in dev_names, "http.dev.conf не найден"
    assert 'https.dev.conf' in dev_names, "https.dev.conf не найден"

    prod_names = [f.name for f in prod_files]
    assert 'main.prod.conf' in prod_names, "main.prod.conf не найден"