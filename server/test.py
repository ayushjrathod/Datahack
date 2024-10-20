import json
from transformers import AutoTokenizer, AutoModel
from unsloth import FastLanguageModel

# Configuration
embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
max_seq_length = 2048
dtype = None  # None for auto detection
load_in_4bit = True  # Use 4bit quantization to reduce memory usage

class AIChatbot:
    def __init__(self):
        # Load the main language model
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name="unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
            max_seq_length=max_seq_length,
            dtype=dtype,
            load_in_4bit=load_in_4bit
        )
        
        # Enable faster inference
        FastLanguageModel.for_inference(self.model)

    def get_answers(self, answer_json):
        """Process the answer and filter out any topics present in the JSON input."""
        
        input_template_context = """
                <|begin_of_text|><|start_header_id|>system<|end_header_id|>

                Cutting Knowledge Date: December 2023
                Today Date: 23 July 2024
                <|eot_id|><|start_header_id|>user<|end_header_id|>

                You are to see the answer provided and the list of available topics, you are to formulate a answer if the answer can be an answer for some topic's details, if none of the topics are relevant, reply with "none".

                Answer : {answer}
                Topics : {topics}

                if any match then give me a json response of the topic and the answer like this:
                topic :
                answer :

                <|eot_id|><|start_header_id|>assistant<|end_header_id|>
        """
        
        # List of topics
        topics = "remote_work, uefi_bios_protection, secure_boot, auto_security_updates, network_segmentation, network_access_control, dmz_implementation, ddos_protection, firewall_management, vpn_policy, data_handling_policies, encryption_algorithms, ssl_tls_implementation, data_loss_prevention, password_storing_policies, data_integrity_practices, access_control_management, ssh_security, firewall_configurations, machine_updates, server_logs_storage, social_engineering_training, mfa_implementation, communication_security, least_privilege_principle, incident_response_timeline, data_encryption_transmission, intrusion_detection_prevention, third_party_risk_management, compliance_regulations"
        topics_list = topics.split(", ")

        # Extract the answer from JSON input
        provided_answers = json.loads(answer_json)
        
        # Remove topics that are present in the JSON input
        for item in provided_answers["questions"]:
            if item["id"] in topics_list:
                topics_list.remove(item["id"])

        # Join remaining topics into a string
        remaining_topics = ", ".join(topics_list)

        # Generate response by formatting the input template
        input_text = input_template_context.format(answer=provided_answers, topics=remaining_topics)

        # Inference using the language model
        inputs = self.tokenizer(input_text, return_tensors="pt")
        outputs = self.model.generate(**inputs)
        
        # Decode the output to a human-readable format
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        return response


# Example usage
chatbot = AIChatbot()
answer_json = """
{
  "questions": [
    {"id": "remote_work", "answer": "No sufficient Information", "category": "Remote work policy"},
    {"id": "uefi_bios_protection", "answer": "No sufficient Information", "category": "Security Features"}
  ]
}
"""
response = chatbot.get_answers(answer_json)
print(response)
