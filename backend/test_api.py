import unittest
from fastapi.exceptions import HTTPException
from pydantic import ValidationError
from backend.main import health_check, chat
from backend.schemas import ChatRequest, ChatResponse, HealthResponse
from backend.config import settings


class TestBackendAPI(unittest.TestCase):
    def test_health_check(self):
        response = health_check()
        self.assertIsInstance(response, HealthResponse)
        self.assertEqual(response.status, "ok")
        self.assertEqual(response.app_name, settings.app_name)
        self.assertEqual(response.environment, settings.environment)
        self.assertIsNotNone(response.timestamp)

    def test_chat_greetings(self):
        for greeting in ["hello", "hi", "hey", "namaste", "Hello Nova"]:
            req = ChatRequest(message=greeting)
            res = chat(req)
            self.assertIsInstance(res, ChatResponse)
            self.assertIn("Hello! Welcome to Nova 360 AI", res.reply)

    def test_chat_programming_keywords(self):
        for keyword in ["python", "code", "programming", "PYTHON TIPS"]:
            req = ChatRequest(message=f"I want to learn {keyword}")
            res = chat(req)
            self.assertIsInstance(res, ChatResponse)
            self.assertIn("Let's solve your coding problem", res.reply)

    def test_chat_career_keywords(self):
        for keyword in ["career", "job", "hackathon", "project"]:
            req = ChatRequest(message=f"Tell me about {keyword}")
            res = chat(req)
            self.assertIsInstance(res, ChatResponse)
            self.assertIn("Let's plan your next step!", res.reply)

    def test_chat_health_keywords(self):
        for keyword in ["health", "wellbeing", "doctor", "medicine", "allergy", "symptom", "appointment"]:
            req = ChatRequest(message=f"Guidance on {keyword}")
            res = chat(req)
            self.assertIsInstance(res, ChatResponse)
            self.assertIn("Nova Health & Wellbeing AI", res.reply)
            self.assertIn("does not replace professional medical diagnosis", res.reply)

    def test_chat_default_response(self):
        req = ChatRequest(message="What is the distance to Mars?")
        res = chat(req)
        self.assertIsInstance(res, ChatResponse)
        self.assertIn("Nova 360 AI received your message", res.reply)
        self.assertIn("This is a test backend response", res.reply)

    def test_chat_empty_whitespace_raises_422(self):
        req = ChatRequest(message="   \t\n  ")
        with self.assertRaises(HTTPException) as ctx:
            chat(req)
        self.assertEqual(ctx.exception.status_code, 422)
        self.assertEqual(ctx.exception.detail, "Message cannot be empty.")

    def test_chat_request_validation_empty_string(self):
        with self.assertRaises(ValidationError):
            ChatRequest(message="")

    def test_chat_request_validation_too_long(self):
        with self.assertRaises(ValidationError):
            ChatRequest(message="a" * 4001)

    def test_cors_origins_configuration(self):
        origins = settings.cors_origins
        self.assertIsInstance(origins, list)
        self.assertIn("http://127.0.0.1:5500", origins)
        self.assertIn("http://localhost:5500", origins)
        self.assertIn("http://127.0.0.1:8000", origins)
        self.assertIn("http://localhost:8000", origins)
        self.assertIn("null", origins)


if __name__ == "__main__":
    unittest.main()
