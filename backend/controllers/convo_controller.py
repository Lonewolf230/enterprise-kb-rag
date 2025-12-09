from fastapi import APIRouter, HTTPException, status
from services.supabase import supabase
from pydantic import BaseModel

router = APIRouter(prefix="/convo", tags=["conversations"])

class ConversationCreateRequest(BaseModel):
    name: str
    members: list[str] | None = None
    group: str | None = None
    description: str | None = None
    owner_id: str | None = None

@router.post('/create', status_code=status.HTTP_201_CREATED)
def create_conversation(
    body: ConversationCreateRequest
):
    try:
        #auth status verify to be done
        response=supabase.table("conversations").insert({
            "type": "group" if body.group else "direct",
            "name": body.name,
            "owner_id": body.owner_id,
            "description": body.description if body.description else ""
        }).execute()
        print("Created")
        row=response.data[0]
        print("Row:",row)
        rows=    [{
                "user_id": member,
                "conversation_id": row["id"],
                "role":"member",
            }
            for member in body.members ]
    
        supabase.table("conversation_members").insert( 
            rows
        ).execute()
        return {"message": "Conversation created successfully","name":body.name,"members":body.members,"owner_id":body.owner_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/delete/{conversation_id}', status_code=status.HTTP_200_OK)
def delete_conversation(
    conversation_id: str
):
    try:
        #user auth status verify to be done
        supabase.table("conversations").delete().eq("id", conversation_id).execute()
        return {"message": "Conversation deleted successfully", "conversation_id": conversation_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/leave/{conversation_id}/user/{user_id}', status_code=status.HTTP_200_OK)
def leave_conversation(
    conversation_id: str,
    user_id: str
):
    try:
        #user auth status verify to be done
        supabase.table("conversation_members").delete().eq("conversation_id", conversation_id).eq("user_id", user_id).execute()
        return {"message": "Left conversation successfully", "conversation_id": conversation_id, "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
