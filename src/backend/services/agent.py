import logging
from typing import Optional

from openai import AsyncOpenAI

from backend.core.config import settings

SYSTEM_PROMPT = """
Ты — профессиональный ИИ-ассистент технической поддержки платформы CoreSupport.
Твоя главная цель: быстро, точно и вежливо помогать пользователям решать их проблемы.
### Твой характер и тон:
- Будь вежлив, эмпатичен и спокоен.
- Пиши кратко и по делу, без "воды" и долгих вступлений (например, не пиши "Конечно, я помогу вам с этим").
- Обращайся к пользователю на "Вы".
### Твои правила и ограничения:
1. Отвечай ТОЛЬКО на вопросы, связанные с платформой CoreSupport и её использованием. Если вопрос не по теме — вежливо откажись отвечать.
2. НИКОГДА не выдумывай несуществующие функции, кнопки или страницы. Если ты не знаешь точного решения, лучше скажи: "Я пока не знаю точного ответа на этот вопрос. Пожалуйста, подождите, я переведу диалог на живого оператора."
3. Не пиши скрипты или код для пользователя.
### Работа с контекстом:
- Тебе в систему будут передаваться данные о текущей странице пользователя и возможных ошибках в консоли браузера.
- Если передана ошибка из консоли, переведи её технический язык на простой и понятный пользователю, объяснив причину и предложив шаг для исправления.
- Если пользователь пишет что-то вроде "Тут ничего не работает", сначала посмотри на контекст (страница и ошибки), чтобы понять, где он находится.
### Форматирование ответа:
- Используй Markdown для читаемости.
- Выделяй названия кнопок, разделов меню и файлов **жирным шрифтом** (например: нажмите **Сохранить**).
- Инструкции всегда оформляй в виде нумерованных списков.
"""


class AgentService:
    def __init__(self) -> None:
        self.logger = logging.getLogger(__name__)
        self._client = AsyncOpenAI(
            base_url=settings.openai.base_url,
            api_key=settings.openai.openrouter_api_key,
        )
        self._model = "deepseek/deepseek-v3.2"
        self._temperature = 0.2

    def _build_context(self, user_context: Optional[dict]) -> str:
        ctx = user_context or {}
        context_str = (
            f"Пользователь сейчас на странице: {ctx.get('url', 'Неизвестно')}\n"
        )

        if ctx.get("errors"):
            context_str += f"Ошибки в консоли: {ctx['errors']}\n"

        return context_str

    def _build_messages(self, user_message: str, context_str: str) -> list[dict]:
        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "system", "content": f"ТЕКУЩИЙ КОНТЕКСТ САЙТА:\n{context_str}"},
            {"role": "user", "content": user_message},
        ]

    async def get_response(
        self,
        user_message: str,
        user_context: Optional[dict] = None,
    ) -> str:
        self.logger.debug("Agent request: %.80s...", user_message)

        context_str = self._build_context(user_context)
        messages = self._build_messages(user_message, context_str)

        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=messages,
                temperature=self._temperature,
            )
            answer = response.choices[0].message.content
            self.logger.info("Agent responded successfully")
            return answer

        except Exception as e:
            self.logger.error("Agent error: %s", str(e))
            return f"Произошла ошибка при обращении к ИИ: {str(e)}"


agent_service = AgentService()
