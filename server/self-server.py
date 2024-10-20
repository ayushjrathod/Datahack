from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModel
from unsloth import FastLanguageModel
import json
from typing import Dict, List

# Configuration
embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
max_seq_length = 2048
load_in_4bit = True
initial_topics = [
    "uefi_bios_protection", "secure_boot", "auto_security_updates",
    "network_segmentation", "network_access_control", "dmz_implementation",
    "ddos_protection", "firewall_management", "vpn_policy", "data_handling_policies",
    "encryption_algorithms", "ssl_tls_implementation", "data_loss_prevention",
    "password_storing_policies", "data_integrity_practices", "access_control_management",
    "ssh_security", "firewall_configurations", "machine_updates", "server_logs_storage",
    "social_engineering_training", "mfa_implementation", "communication_security",
    "least_privilege_principle", "incident_response_timeline",
    "data_encryption_transmission", "intrusion_detection_prevention",
    "third_party_risk_management", "compliance_regulations"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIChatbot:
    def __init__(self):
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name="unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
            max_seq_length=max_seq_length,
            load_in_4bit=load_in_4bit
        )
        FastLanguageModel.for_inference(self.model)
        self.embedding_tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
        self.embedding_model = AutoModel.from_pretrained(embedding_model_name)

        self.topics: Dict[str, str] = {topic: "" for topic in initial_topics}
        self.current_topic: str = ""
        self.conversation_history: List[Dict[str, str]] = []

    def generate_response(self, topic: str) -> str:
        input_template = """
        <|begin_of_text|><|start_header_id|>system<|end_header_id|>
        You are an expert cybersecurity consultant conducting a security analysis for an organization. Your goal is to gather comprehensive information about {topic}. Ask relevant questions and provide insights based on the answers. Maintain a professional yet conversational tone.
        Current topic: {topic}
        Conversation history:
        {history}
        <|eot_id|><|start_header_id|>assistant<|end_header_id|>
        """

        history_str = "\n".join([f"Human: {msg['human']}\nAssistant: {msg['assistant']}" for msg in self.conversation_history[-3:]])
        input_text = input_template.format(topic=topic, history=history_str)
        inputs = self.tokenizer(input_text, return_tensors="pt")

        output = self.model.generate(**inputs, max_new_tokens=256)
        return self.tokenizer.decode(output[0], skip_special_tokens=True)

    def evaluate_answer(self, answer: str, topic: str) -> bool:
        input_template = """
        <|begin_of_text|><|start_header_id|>system<|end_header_id|>
        Evaluate if the following answer provides sufficient information about the given cybersecurity topic. Respond with a JSON object containing:
        1. "sufficient": true if the answer is comprehensive, false otherwise
        2. "feedback": brief feedback on the answer quality
        3. "follow_up": a follow-up question if more information is needed, or null if sufficient
        Topic: {topic}
        Answer: {answer}
        <|eot_id|><|start_header_id|>assistant<|end_header_id|>
        """

        input_text = input_template.format(answer=answer, topic=topic)
        inputs = self.tokenizer(input_text, return_tensors="pt")
        output = self.model.generate(**inputs, max_new_tokens=256)
        output_text = self.tokenizer.decode(output[0], skip_special_tokens=True)

        try:
            response_data = json.loads(output_text)
            if response_data.get("sufficient", False):
                self.update_topics(topic, answer)
                return True
            return False
        except json.JSONDecodeError:
            print(f"Error decoding JSON: {output_text}")
            return False

    def update_topics(self, topic: str, answer: str) -> None:
        self.topics[topic] = answer
        with open("topics_and_answers.txt", "a") as f:
            f.write(f"Topic: {topic}\nAnswer: {answer}\n\n")
        del self.topics[topic]

    def get_next_topic(self) -> str:
        if self.topics:
            self.current_topic = next(iter(self.topics))
            return self.current_topic
        return ""

    def process_user_input(self, user_input: str) -> str:
        if not self.current_topic:
            self.get_next_topic()

        if self.evaluate_answer(user_input, self.current_topic):
            self.conversation_history.append({
                "human": user_input,
                "assistant": f"Thank you for the information about {self.current_topic}."
            })
            self.get_next_topic()

        if not self.current_topic:
            return "All topics have been covered. Thank you for your time!"
        else:
            response = self.generate_response(self.current_topic)
            self.conversation_history.append({
                "human": user_input,
                "assistant": response
            })
            return response

chatbot = AIChatbot()

@app.post("/chat")
async def chat(request: Request):
    request_data = await request.json()
    user_input = request_data.get("input", "")
    response = chatbot.process_user_input(user_input)
    return {"message": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)