from flask import Blueprint,request,jsonify
from utils.file_index import generate_embeddings,get_index
from utils.retrieval_utils import prepare_query,generate_prompt,generate_response,generate_presigned_urls
import os
from dotenv import load_dotenv
load_dotenv()

SUPABASE_BUCKET=os.getenv("SUPABASE_BUCKET")
retrieval_bp=Blueprint('retrieval', __name__)


@retrieval_bp.route('/query', methods=['POST'])
def query_kb():
    data=request.get_json()
    query=data.get('query')
    index_name=data.get('index_name')

    if not query:
        return jsonify({"error":"Query is required"}),400
    if not index_name:
        return jsonify({"error":"Index name is required"}),400
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
    return jsonify({"query":query,"response":response,"presigned_urls":presigned_urls})




