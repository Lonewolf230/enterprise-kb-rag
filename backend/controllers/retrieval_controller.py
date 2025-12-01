from fastapi import APIRouter
from utils.file_index import generate_embeddings,get_index
from utils.retrieval_utils import prepare_query,generate_prompt,generate_response,generate_presigned_urls
import os
from dotenv import load_dotenv
from pydantic import BaseModel
load_dotenv()

SUPABASE_BUCKET=os.getenv("SUPABASE_BUCKET")
router=APIRouter(prefix="/retrieve",tags=["retrieval"])

class QueryRequest(BaseModel):
    query: str
    index_name: str

@router.post('/query')
def query_kb(body: QueryRequest):
    query=body.query
    index_name=body.index_name

    if not query:
        return {"error": "Query is required"}, 400

    if not index_name:
        return {"error": "Index name is required"}, 400
    
    print("Entering retrieval pipeline")
    
    query_embedding=generate_embeddings(query)
    index=get_index(index_name)

    results=index.query(
        vector=query_embedding,
        top_k=5,
        include_metadata=True,
    )
    print("Retrieved results: ")
    results=[m for m in results.matches if m.score>=0.5]
    hits=[]
    for match in results:
        hits.append({
            'score': match.score,
            'filekey': match.metadata.get('filekey'),
            'filename': match.metadata.get('filename'),
            'chunk_index': match.metadata.get('chunk_index'),
            'text': match.metadata.get('text'),
        })
    print("Hits generated")
    context=prepare_query(hits)
    prompt=generate_prompt(context,query)
    response=generate_response(prompt)
    presigned_urls=generate_presigned_urls(
        bucket_name=SUPABASE_BUCKET,
        object_keys=list({hit['filekey'] for hit in hits}),
        expiration_time=3600
    )
    return {
        "query": query,
        "response": response,
        "sources": hits,
        "presigned_urls": presigned_urls
    }




