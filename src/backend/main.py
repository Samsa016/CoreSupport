import uvicorn
from fastapi import FastAPI

from backend.api import router as api_routes

app = FastAPI()

app.include_router(api_routes)


@app.get("/")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
