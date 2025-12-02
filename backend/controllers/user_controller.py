from fastapi import APIRouter,HTTPException,status,Query
from services.supabase import supabase

router=APIRouter(prefix="/users",tags=["users"])  


@router.get('/search',status_code=status.HTTP_200_OK)
def search_users(
    query:str = Query(...,min_length=1,max_length=15),
    limit: int = 10,
    skip: int = 0
):

    if not query:
        return {"users": []}
    print(query)
    try:
        response=supabase.table("profiles").select("id, username, name").filter("username","ilike",f"%{query}%").limit(limit).offset(skip*limit).execute()
        print("Search response:",response)

    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    
    return {"users": response.data}
