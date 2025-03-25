from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel
from typing import List, Dict, Generator
import os
import sys
import traceback
import json
from groq import Groq
from fastapi.templating import Jinja2Templates
from fastapi import Request

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# DIRECTLY SET YOUR API KEY HERE
GROQ_API_KEY = "***********************************" # Your API key should already be here

# Initialize Groq client with direct API key
try:
    client = Groq(api_key=GROQ_API_KEY)
    model = "llama-3.2-90b-vision-preview"  # Using the requested model
    
    # Test API connection
    print("Testing Groq API connection...")
    models = client.models.list()
    print("✅ API connection successful!")
    print("Available models:")
    for m in models.data:
        print(f"- {m.id}")
    
    # Check if our model is available
    if model not in [m.id for m in models.data]:
        print(f"⚠️ Warning: Model '{model}' not found in available models list.")
        print("Falling back to llama3-8b-8192 if needed.")
    
except Exception as e:
    print(f"❌ Error initializing Groq client: {e}")
    print("Please check your API key and internet connection.")
    traceback.print_exc()
    sys.exit(1)  # Exit if we can't connect

class ChatRequest(BaseModel):
    messages: List[Dict]

# Streaming chat endpoint using Server-Sent Events
@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint using exact parameters from the user's code"""
    async def generate_stream():
        try:
            # Using the exact parameters from the user's code
            completion = client.chat.completions.create(
                model=model,
                messages=request.messages,
                temperature=1,  # Set to 1 as requested
                max_completion_tokens=1024,  # Set to 1024 as requested
                top_p=1,  # Set to 1 as requested
                stream=True,
                stop=None,
            )
            
            # Send each chunk as it arrives
            for chunk in completion:
                content = chunk.choices[0].delta.content
                if content:
                    # Format as SSE
                    yield f"data: {json.dumps({'content': content})}\n\n"
            
            # Send a final event to signal completion
            yield f"data: {json.dumps({'done': True})}\n\n"
                
        except Exception as e:
            error_message = str(e)
            print(f"Error in streaming chat: {error_message}")
            traceback.print_exc()
            # Send error as SSE
            yield f"data: {json.dumps({'error': error_message})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream"
    )

# Regular non-streaming endpoint (using same parameters for consistency)
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Regular non-streaming chat endpoint"""
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=request.messages,
            temperature=1,
            max_completion_tokens=1024,
            top_p=1,
        )
        
        response_text = completion.choices[0].message.content
        return {"response": response_text}
    
    except Exception as e:
        error_message = str(e)
        print(f"Error in chat endpoint: {error_message}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_message)

# Set up templates directory
templates = Jinja2Templates(directory="frontend/templates")

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    try:
        with open("frontend/index.html", "r") as f:
            html_content = f.read()
        return html_content
    except FileNotFoundError:
        return templates.TemplateResponse("error.html", {"request": request, "message": "The frontend index.html file was not found."})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app,port=8000)
