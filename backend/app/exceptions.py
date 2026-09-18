"""Domain exceptions for the application."""


class AppError(Exception):
    """Base exception for application errors."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    """Raised when a requested resource is not found."""

    pass


class ForbiddenError(AppError):
    """Raised when an operation is not authorized for the current user."""

    pass


class ConflictError(AppError, ValueError):
    """Raised when a conflict occurs, such as a duplicate resource."""

    pass
