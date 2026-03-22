FROM python:3.12-slim

# Копируем сверхбыстрый пакетный менеджер uv из официального образа
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Копируем файлы конфигурации uv (pyproject.toml и uv.lock)
COPY pyproject.toml uv.lock ./

# Устанавливаем зависимости. 
# uv sync автоматически создаст .venv и установит точные версии из uv.lock
# Флаг --no-dev не ставит библиотеки, нужные только для локальной разработки (линтеры, тесты)
RUN uv sync --frozen --no-dev

COPY src/ ./src/

# Добавляем виртуальное окружение, созданное uv, в системный PATH контейнера
ENV PATH="/app/.venv/bin:$PATH"

# Запускаем приложение (0.0.0.0 обязателен для Docker-сетей)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"]