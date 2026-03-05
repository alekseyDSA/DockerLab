# Makefile
.PHONY: dev prod setup test clean logs help

ENV ?= dev  # переменная для выбора окружения

help: ## Показать эту справку
	@awk 'BEGIN {FS = ":.*##"; printf "\nИспользование: make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

dev: ## Запустить режим разработки
	docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml --env-file .env.dev up --build

prod: ## Запустить продакшен режим
	docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build

setup: ## Инициализация проекта (генерация SSL, создание папок)
	@mkdir -p certs/self-signed certbot/www data
	docker-compose -f docker-compose.setup.yml up ssl-gen
	@echo "Проект инициализирован"

clean: ## Очистить всё (контейнеры, volumes, сертификаты)
	docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml down -v
	docker-compose -f docker-compose.setup.yml down -v
	@rm -rf certs/self-signed/* certbot/www/* data/*
	@echo "Проект очищен"

test: ## Запустить тесты
	python tests/run_tests.py

logs: ## Посмотреть логи
	docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f

ssl-renew: ## Принудительное обновление SSL в продакшене
	docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml exec certbot certbot renew
	docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml exec nginx nginx -s reload