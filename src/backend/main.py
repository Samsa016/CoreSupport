import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api import router as api_routes

logger = logging.getLogger(__name__)

app = FastAPI(
    title="CoreSupport API",
    description="REST API для системы управления задачами CoreSupport",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Глобальные обработчики ошибок ─────────────────────────


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Перехватывает ошибки валидации Pydantic (422)
    и возвращает стандартный 400 Bad Request.
    """
    logger.warning(
        "Validation error on %s %s: %s",
        request.method,
        request.url.path,
        exc.errors(),
    )
    return JSONResponse(
        status_code=400,
        content={
            "detail": exc.errors(),
            "message": "Bad Request — invalid input data",
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Перехватывает все необработанные исключения
    и возвращает стандартный 500 Internal Server Error
    с логированием стек-трейса.
    """
    logger.exception(
        "Unhandled exception on %s %s",
        request.method,
        request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
        },
    )


app.include_router(api_routes)
