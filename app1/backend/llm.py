import os
from groq import Groq
from typing import List, Dict, Generator, Optional

class LLMService:
    def __init__(self, model: str = "deepseek-r1-distill-qwen-32b", api_key: Optional[str] = None):
        """Initialize the LLM service with Groq client."""
        # Use provided API key or get from environment variable
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY must be provided or set as environment variable")
        
        self.client = Groq(api_key=self.api_key)
        self.model = model
        
    def generate_stream(self, messages: List[Dict], 
                        temperature: float = 0.6,
                        max_tokens: int = 4096,
                        top_p: float = 0.95) -> Generator[str, None, None]:
        """
        Generate streaming response from the LLM.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Controls randomness (higher = more random)
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            
        Yields:
            Text chunks as they're generated
        """
        try:
            # Check if the parameter is max_tokens or max_completion_tokens
            try:
                completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,  # Standard OpenAI naming
                    top_p=top_p,
                    stream=True,
                )
            except Exception as e:
                if "max_tokens" in str(e):
                    # Try with Groq-specific naming
                    completion = self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=temperature,
                        max_completion_tokens=max_tokens,
                        top_p=top_p,
                        stream=True,
                    )
                else:
                    raise
            
            for chunk in completion:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def generate(self, messages: List[Dict],
                 temperature: float = 0.6,
                 max_tokens: int = 4096,
                 top_p: float = 0.95) -> str:
        """
        Generate complete response from the LLM (non-streaming).
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Controls randomness (higher = more random)
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            
        Returns:
            Complete generated text
        """
        try:
            # Check if the parameter is max_tokens or max_completion_tokens
            try:
                completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,  # Standard OpenAI naming
                    top_p=top_p,
                    stream=False,
                )
            except Exception as e:
                if "max_tokens" in str(e):
                    # Try with Groq-specific naming
                    completion = self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=temperature,
                        max_completion_tokens=max_tokens,
                        top_p=top_p,
                        stream=False,
                    )
                else:
                    raise
            
            return completion.choices[0].message.content
        
        except Exception as e:
            return f"Error: {str(e)}"

# Add this compatibility function to prevent import errors
def get_llm_response(messages: List[Dict], 
                    temperature: float = 0.6,
                    max_tokens: int = 4096,
                    top_p: float = 0.95) -> str:
    """
    Compatibility function to maintain existing API.
    This wraps the LLMService class to provide the same functionality.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content'
        temperature: Controls randomness (higher = more random)
        max_tokens: Maximum tokens to generate
        top_p: Nucleus sampling parameter
        
    Returns:
        Complete generated text
    """
    # Get API key from environment
    api_key = os.environ.get("GROQ_API_KEY")
    
    # Create service and generate response
    service = LLMService(api_key=api_key)
    return service.generate(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=top_p
    )

# Test function to debug any issues
def test_groq_api():
    """Test function to debug Groq API connection"""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("Error: GROQ_API_KEY not found in environment variables")
        return
    
    try:
        client = Groq(api_key=api_key)
        models = client.models.list()
        print("Available models:")
        for model in models.data:
            print(f"- {model.id}")
        
        print("\nTesting chat completion...")
        completion = client.chat.completions.create(
            model="deepseek-r1-distill-qwen-32b",  # Test specific model
            messages=[{"role": "user", "content": "Hello, are you working?"}],
            temperature=0.6,
            max_completion_tokens=100,  # Using Groq-specific parameter
            stream=False,
        )
        print(f"Response: {completion.choices[0].message.content}")
        print("API test successful!")
    
    except Exception as e:
        print(f"Error during API test: {str(e)}")
        print("Please check your API key and model availability.")

# Example usage
if __name__ == "__main__":
    # Run the test function
    test_groq_api() 