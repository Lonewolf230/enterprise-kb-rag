from services.openai import openai_client
from services.supabase import supabase

def prepare_query(results:list)->str:
    context=""
    for res in results:
        context+=res['text']+"\n\n"
    return context


def generate_prompt(context:str,query:str)->str:
    prompt=f"""

Context:
{context}

Question:
{query}
"""
    print(prompt)
    return prompt


def generate_response(prompt:str)->str:
    response=openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role":"system","content":'You are an AI assistant helping '
                'users find information from a knowledge base. '
                'Use the following context to answer the question at the end. '
                'If the context does not contain the answer, respond with "I don\'t know".'
                'Also avoid including unnecessary or unwanted information.'},
            {"role":"user","content":prompt}
        ],
        max_tokens=500,
        temperature=0.2,
    )
    print("LLM Response: ",response)
    return response.choices[0].message.content


def generate_presigned_urls(bucket_name:str,object_keys:list,expiration_time:int=3600)->list:
    urls=supabase.storage.from_(bucket_name).create_signed_urls(
        object_keys,expires_in=expiration_time
    )
    print(urls)
    return urls
