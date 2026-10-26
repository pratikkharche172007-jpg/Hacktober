
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.schemas import HealthResponse, ChatRequest, ChatResponse

app = FastAPI(
    title=settings.app_name,
    description="Minimal FastAPI backend for Nova 360 AI",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

    text = message.lower()

    if any(word in text for word in ["hello", "hi", "hey", "namaste"]):
        reply = "Hello! Welcome to Nova 360 AI. How can I help you today?"
    elif any(word in text for word in ["python", "code", "programming"]):
        reply = (
            "Let's solve your coding problem step by step. "
            "Tell me what you want to build or share your code."
        )
    elif any(word in text for word in ["career", "job", "hackathon", "project"]):
        reply = (
            "Let's plan your next step! Define your goal, choose a small "
            "MVP, build the main feature, and test it with a real example."
        )
    elif any(word in text for word in ["health", "wellbeing", "doctor", "medicine", "medication", "allergy", "symptom", "appointment", "clinic", "hospital", "wellness"]):
        reply = (
            "**Nova Health & Wellbeing AI Guidance**\n\n"
            f"Regarding your question: *{message}*\n\n"
            "Here is structured information to help you manage your health inquiry:\n\n"
            "- **Observation**: Document the timeline, patterns, and severity of what you are experiencing.\n"
            "- **Organization**: Ensure your current medication list, allergy history, and recent lab results are organized before your appointment.\n"
            "- **Questions to Ask**: Note down 2-3 specific questions for your healthcare professional regarding diagnosis, management options, or preventive steps.\n\n"
            "*Notice: This guidance is informational only and does not replace professional medical diagnosis, treatment, or emergency care.*"
        )
    else:
        reply = (
            f"Nova 360 AI received your message: {message}\n\n"
            "This is a test backend response, not a real AI-generated answer. "
            "We can integrate a free local AI model in the next step."
        )

    return ChatResponse(reply=reply)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
