from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException

from app.config import settings
from app.error_handlers import (
    localized_http_error,
    localized_internal_error,
    localized_validation_error,
)
from app.views.auth import router as auth_router
from app.views.health import router as health_router
from app.views.lists import router as lists_router
from app.views.public import router as public_router

app = FastAPI(
    title="Wedding List API",
    description="API para gerenciamento de listas de presentes de casamento",
    version="0.1.0",
)

app.add_exception_handler(HTTPException, localized_http_error)
app.add_exception_handler(RequestValidationError, localized_validation_error)
app.add_exception_handler(Exception, localized_internal_error)

origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(lists_router)
app.include_router(public_router)
