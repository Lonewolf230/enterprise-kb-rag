import os
from dotenv import load_dotenv
load_dotenv()
import tempfile
import fitz
import tiktoken
import docx2txt
from pinecone import ServerlessSpec
from services.pinecone import pc
from services.openai import openai_client
import whisper

def index_file(index_name:str,file) -> None:
    
    ext = file.filename.rsplit('.', 1)[1].lower()
    tmp_fd, path = tempfile.mkstemp(suffix=f".{ext}")
    os.close(tmp_fd)  
    file.save(path)
    print("Saved temp file:", path)

    if ext=='pdf':
        extracted_text=extract_text_from_pdf(path)
    elif ext in ['docx','doc']:
        extracted_text=extract_text_from_docx(path)
    elif ext in ['mp3','wav','m4a']:
        extracted_text=transcribe_audio(path)
        print("Transcription text: ",extracted_text)
    else:
        raise NotImplementedError(f"File type {ext} not supported yet.")

    chunks=chunk_text(extracted_text)
    vectors=[]
    for i,chunk in enumerate(chunks):
        if not chunk.strip():
            continue

        embedding=generate_embeddings(chunk)
        vectors.append({
            'id': f"{file.filename}_chunk_{i}",
            'values': embedding,
            'metadata': {
                'filename': file.filename,
                'chunk_index': i,
                'text': chunk
            }
        })
    index=get_index(index_name)
    if vectors:
        index.upsert(vectors=vectors)
    os.remove(path)
    return {"status": "success","chunks_indexed": len(vectors),"filename": file.filename}


def extract_text_from_pdf(path:str) -> str:
    text=""
    with fitz.open(path) as doc:
        for page in doc:
            text+=page.get_text("text")
    return text

def extract_text_from_docx(path:str) -> str:
    return docx2txt.process(path)

def generate_embeddings(text:str):
    response=openai_client.embeddings.create(
        input=text,
        model="text-embedding-3-small",
        dimensions=1536
    )
    embeddings=response.data[0].embedding
    return embeddings

def chunk_text(text:str,chunk_size:int=500,overlap:int=50,model:str="text-embedding-3-small"):
    encoder=tiktoken.encoding_for_model(model)
    tokens=encoder.encode(text)
    chunks=[]
    start=0

    while start<len(tokens):
        end=min(start+chunk_size,len(tokens))
        chunk_tokens=tokens[start:end]
        chunk_text=encoder.decode(chunk_tokens)
        chunks.append(chunk_text)
        start+= chunk_size-overlap
    return chunks

def get_index(index_name:str,dimension:int=1536):
    print("Getting index:",index_name)
    print("Index list: ",[i["name"] for i in pc.list_indexes()])
    if index_name not in [i["name"] for i in pc.list_indexes()]:
        print("Creating index:",index_name)
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1",
            )
        )
    return pc.Index(index_name)

def transcribe_audio(file_path:str)->str:
    model=whisper.load_model("small")
    result=model.transcribe(file_path)
    return result["text"]