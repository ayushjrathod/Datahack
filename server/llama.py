from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import torch
import json
from transformers import TextIteratorStreamer, AutoTokenizer, AutoModel
from unsloth import FastLanguageModel
from threading import Thread
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

# Configuration
embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
max_seq_length = 4096
dtype = None
load_in_4bit = True

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Conversation(BaseModel):
    messages: List[Dict[str, str]]

class AIChatbot:
    def __init__(self):
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name="unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
            max_seq_length=max_seq_length,
            dtype=dtype,
            load_in_4bit=load_in_4bit
        )
        
        FastLanguageModel.for_inference(self.model)
        
        self.embedding_tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
        self.embedding_model = AutoModel.from_pretrained(embedding_model_name)

        # Load questions from JSON
        with open('security_question_baseline.json', 'r') as f:
            self.questions = json.load(f)['questions']

    def get_next_question(self):
        for question in self.questions:
            if question['answer'] == "No sufficient Information":
                return question
        return None

    def update_answers(self, user_response, current_question):
        # Update the current question
        for question in self.questions:
            if question['id'] == current_question['id']:
                question['answer'] = user_response
                break

        # Check if this answer applies to other questions
        # This is a simplified check. You might want to implement more sophisticated matching logic.
        for question in self.questions:
            if question['answer'] == "No sufficient Information" and question['category'] == current_question['category']:
                question['answer'] = user_response

    def generate_response(self, conversation: Conversation):
        current_question = self.get_next_question()
        
        if not current_question:
            yield "All questions have been answered. Thank you for your time!"
            return

        input_template = f"""
        <|begin_of_text|><|start_header_id|>system<|end_header_id|>
        Cutting Knowledge Date: December 2023
        Today Date: 23 July 2024
        You are an expert in the cyber security domain. You are to assess the cyber security status of the user's organization by asking them questions. Ask a question to gather information about  specifically regarding {current_question['id']}.
        <|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>
        """

        input_template_second = f"""
        <|begin_of_text|><|start_header_id|>system<|end_header_id|>
        Cutting Knowledge Date: December 2023
        Today Date: 23 July 2024
        You are an expert in the cyber security domain. You are to assess the cyber security status of the user's organization by asking them questions. Ask a question to gather information about  specifically regarding {current_question['id']}.
        <|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>
        """

        inputs = self.tokenizer(input_template, return_tensors="pt")
        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True)
        generation_kwargs = dict(inputs, streamer=streamer, max_new_tokens=256)

        thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()

        # Stream the response one token at a time
        for new_text in streamer:
            if new_text != "<|eot_id|>":  # Avoid sending the special end token
                yield new_text

        thread.join()


chatbot = AIChatbot()

@app.post("/ask/")
async def ask_question(conversation: Conversation):
    # Get the last user message
    last_user_message = next((msg for msg in reversed(conversation.messages) if msg['role'] == 'user'), None)
    
    
    if last_user_message:
        # Update answers based on the last user response
        current_question = chatbot.get_next_question()
        if current_question:
            chatbot.update_answers(last_user_message['content'], current_question)

    return StreamingResponse(chatbot.generate_response(conversation), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)