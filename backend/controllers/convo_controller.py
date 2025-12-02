from fastapi import APIRouter, HTTPException, status
from services.supabase import supabase


router = APIRouter(prefix="/convo", tags=["conversations"])

@router.post('/create', status_code=status.HTTP_201_CREATED)
def create_conversation(name: str):
    # to implement group creation
    return {"message": f"Conversation '{name}' created successfully."}