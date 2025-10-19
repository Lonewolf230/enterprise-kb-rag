from pinecone import Pinecone
import os
from dotenv import load_dotenv
load_dotenv()

PINECONE_KEY=os.getenv("PINECONE_API_KEY")
pc=Pinecone(api_key=PINECONE_KEY)