
import json
import urllib.error
import urllib.request

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.schemas import HealthResponse, ChatRequest, ChatResponse


OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL_NAME = "llama3.2:3b"


app = FastAPI(
    title=settings.app_name,
    description="Nova 360 AI powered by local Ollama and Llama",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        environment=settings.environment,
    )


@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty.",
        )

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are Nova 360 AI, a helpful and accurate AI assistant. "
                    "Answer clearly and practically. For coding questions, "
                    "explain solutions step by step. Do not claim to have "
                    "performed actions you have not performed."
                ),
            },
            {
                "role": "user",
                "content": message,
            },
        ],
        "stream": False,
    }

    http_request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            http_request, timeout=180
        ) as response:
            result = json.loads(response.read().decode("utf-8"))

        reply = result.get("message", {}).get("content", "").strip()

        if not reply:
            raise HTTPException(
                status_code=502,
                detail="Ollama returned an empty response.",
            )

        return ChatResponse(reply=reply)

    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=502,
            detail=f"Ollama API error: {details}",
        ) from exc

    except urllib.error.URLError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Cannot connect to Ollama. Make sure Ollama is running "
                "and llama3.2:3b is installed."
            ),
        ) from exc

    except TimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail="The AI response timed out. Please try again.",
        ) from exc

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Ollama returned an invalid JSON response.",
        ) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
