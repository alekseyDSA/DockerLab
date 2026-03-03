#!/usr/bin/env python3
"""
Универсальный запускатор тестов для Windows и Linux
"""

import subprocess
import sys
import os
from pathlib import Path

# Цвета для вывода
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    RESET = '\033[0m'

def print_color(message, color):
    """Цветной вывод"""
    if sys.platform == 'win32':
        print(message)
    else:
        print(f"{color}{message}{Colors.RESET}")

def run_tests():
    """Запуск всех тестов"""
    print_color("=" * 35, Colors.CYAN)
    print_color("Starting", Colors.CYAN)
    print_color("=" * 35, Colors.CYAN)

    # Переход в корень проекта
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    print(f"Рабочая директория: {project_root}")

    # Проверка наличия pytest
    try:
        import pytest
        print_color("pytest найден", Colors.GREEN)
    except ImportError:
        print_color("Устанавливаю pytest...", Colors.YELLOW)
        subprocess.run([sys.executable, "-m", "pip", "install", "pytest", "requests", "pyyaml"])

    # Проверка запущенных контейнеров
    result = subprocess.run(
        ["docker", "ps", "--filter", "name=nginx-ssl", "--format", "{{.Names}}"],
        capture_output=True,
        text=True
    )
    containers_running = bool(result.stdout.strip())

    if containers_running:
        print_color("Контейнеры запущены", Colors.GREEN)
        print(f"   Контейнеры: {result.stdout.strip()}")
    else:
        print_color("Контейнеры не запущены. Интеграционные тесты будут пропущены.", Colors.YELLOW)
        print("   Запустите сначала: docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml --env-file .env.dev up")

    # Проверка наличия тестовых файлов
    test_files = [
        "tests/test_structure.py",
        "tests/test_nginx_config.py",
        "tests/test_docker_compose.py",
        "tests/test_https.py"
    ]

    for test_file in test_files:
        if not Path(test_file).exists():
            print_color(f"Тестовый файл не найден: {test_file}", Colors.RED)
            return 1

    # Список тестов для запуска
    tests = [
        ("tests/test_structure.py", "Тестирование структуры проекта..."),
        ("tests/test_nginx_config.py", "Тестирование конфигураций nginx..."),
        ("tests/test_docker_compose.py", "Тестирование docker-compose файлов..."),
    ]

    if containers_running:
        tests.append(("tests/test_https.py", "Интеграционное тестирование HTTPS..."))

    # Запуск тестов
    all_passed = True
    for test_file, description in tests:
        print_color(f"\n{description}", Colors.YELLOW)
        print(f"   Запуск: pytest {test_file} -v --tb=short")

        result = subprocess.run([
            sys.executable, "-m", "pytest", test_file, "-v", "--tb=short"
        ])

        if result.returncode != 0:
            print_color(f"Тесты не пройдены в {test_file}!", Colors.RED)
            all_passed = False
            # Не выходим сразу, чтобы увидеть все ошибки

    if all_passed:
        print_color(f"\nВсе тесты успешно пройдены!", Colors.GREEN)
        return 0
    else:
        print_color(f"\nНекоторые тесты не пройдены!", Colors.RED)
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())