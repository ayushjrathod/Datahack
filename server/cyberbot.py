from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import os
import shutil
import torch
import numpy as np
from transformers import TextIteratorStreamer, AutoTokenizer, AutoModel
from unsloth import FastLanguageModel
from threading import Thread
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import silhouette_score
import fitz  # PyMuPDF to extract text from PDFs

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

# Configuration
embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
max_chunk_size = 128
max_seq_length = 2048
dtype = None  # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class AIChatbot:
    def __init__(self):
        # Load the main language model
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name="unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
            max_seq_length=max_seq_length,
            dtype=dtype,
            load_in_4bit=load_in_4bit
        )
        # Enable native 2x faster inference
        FastLanguageModel.for_inference(self.model)
        # Load the embedding model for semantic chunking
        self.embedding_tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
        self.embedding_model = AutoModel.from_pretrained(embedding_model_name)
    
    def encode_text(self, text):
        """Encode text into embeddings using a pre-trained model."""
        inputs = self.embedding_tokenizer(text, return_tensors='pt', truncation=True, padding=True)
        with torch.no_grad():
            outputs = self.embedding_model(**inputs)
        embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
        return embeddings
    
    def chunk_text(self, text):
        """Chunk the text into smaller pieces."""
        tokens = self.embedding_tokenizer.tokenize(text)
        token_chunks = [tokens[i:i + max_chunk_size] for i in range(0, len(tokens), max_chunk_size)]
        text_chunks = [self.embedding_tokenizer.convert_tokens_to_string(chunk) for chunk in token_chunks]
        return text_chunks
    
    def determine_optimal_clusters(self, embeddings, max_clusters=10):
        """Determine the optimal number of clusters using the Elbow Method and Silhouette Score."""
        distortions = []
        silhouette_scores = []
        K = range(2, max_clusters + 1)
        
        for k in K:
            kmeans = KMeans(n_clusters=k, n_init=10, random_state=0)
            kmeans.fit(embeddings)
            labels = kmeans.labels_
            distortions.append(kmeans.inertia_)
            if k > 1:
                silhouette_scores.append(silhouette_score(embeddings, labels))
        
        if silhouette_scores:
            optimal_clusters = K[1:][np.argmax(silhouette_scores)]
        else:
            optimal_clusters = K[0]
        
        return optimal_clusters
    
    def semantic_chunking(self, text):
        """Perform semantic chunking on the text using dynamic clustering."""
        chunks = self.chunk_text(text)
        embeddings = np.vstack([self.encode_text(chunk) for chunk in chunks])
        optimal_clusters = self.determine_optimal_clusters(embeddings)
        
        # Perform KMeans clustering
        kmeans = KMeans(n_clusters=optimal_clusters, n_init=10, random_state=0)
        kmeans.fit(embeddings)
        labels = kmeans.labels_
        
        chunked_texts = {i: [] for i in range(optimal_clusters)}
        for i, label in enumerate(labels):
            chunked_texts[label].append(chunks[i])
        
        return chunked_texts, embeddings, chunks
    
    def retrieve_chunks(self, query, top_n=5):
        """Retrieve and return the most similar chunks based on a query."""
        query_embedding = self.encode_text(query)
        similarities = cosine_similarity(query_embedding, self.embeddings).flatten()
        top_indices = np.argsort(similarities)[-top_n:][::-1]
        retrieved_chunks = " ".join(self.chunks[index] for index in top_indices)
        return retrieved_chunks
    
    def generate_question_and_answer(self, topic, context):
        """Generate question and answer for the given topic."""
        question = f"What is the significance of {topic}?"
        input_template =  """
                <|begin_of_text|><|start_header_id|>system<|end_header_id|>
                Cutting Knowledge Date: December 2023
                Today Date: 23 July 2024
                <|eot_id|><|start_header_id|>user<|end_header_id|>
                Context : {context}
                Topic : {topic}
                Question : {question}
                <|eot_id|><|start_header_id|>assistant<|end_header_id|>
                """
        input_text = input_template.format(context=context, topic=topic, question=question)
        inputs = self.tokenizer(input_text, return_tensors="pt")
        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True)
        generation_kwargs = dict(inputs, streamer=streamer, max_new_tokens=256)
        thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()

        response = ""
        for new_text in streamer:
            response += new_text

        thread.join()
        return question, response
    
    def process_pdf(self, file_path):
        """Extract and chunk text from a PDF."""
        with fitz.open(file_path) as pdf:
            text = ""
            for page in pdf:
                text += page.get_text()
        return self.semantic_chunking(text)
    
    def generate_questions_and_answers(self, chunked_texts, file_name):
        """Generate questions and answers for each topic and save them to a file."""
        with open(f"./uploads/{file_name}_QA.txt", "w") as f:
            for topic in initial_topics:
                context = " ".join([chunk for chunks in chunked_texts.values() for chunk in chunks])
                question, answer = self.generate_question_and_answer(topic, context)
                f.write(f"Topic: {topic}\n")
                f.write(f"Question: {question}\n")
                f.write(f"Answer: {answer}\n\n")

chatbot = AIChatbot()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Save the file to the './uploads/' folder
    file_path = os.path.join("./uploads", file.filename)
    
    try:
        with open(file_path, 'wb') as f:
            contents = await file.read()
            f.write(contents)

        # Process the uploaded PDF file
        chunked_texts, _, _ = chatbot.process_pdf(file_path)

        # Generate questions and answers and save to file
        chatbot.generate_questions_and_answers(chunked_texts, file.filename)

        return JSONResponse(content={"message": "File uploaded and processed successfully", "filename": file.filename})
    
    except Exception as e:
        return JSONResponse(content={"message": "File upload failed", "error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
