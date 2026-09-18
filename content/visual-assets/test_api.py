#!/usr/bin/env python3
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
print(f"API Key found: {bool(api_key)}")
print(f"API Key length: {len(api_key) if api_key else 0}")

client = OpenAI(api_key=api_key)

# Test the API key with a simple chat completion
try:
    response = client.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[{'role': 'user', 'content': 'Hello'}],
        max_tokens=10
    )
    print("API key is valid for chat completions")
except Exception as e:
    print(f"Chat completion error: {e}")

# Try to list available models
try:
    models = client.models.list()
    print(f"Total models available: {len(models.data)}")
    dalle_models = [m.id for m in models.data if 'dall' in m.id.lower()]
    print(f"DALL-E models found: {dalle_models}")
except Exception as e:
    print(f"Model listing error: {e}")