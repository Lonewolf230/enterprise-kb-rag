from services.supabase import supabase
from fastapi import APIRouter,HTTPException,status,Response
from pydantic import BaseModel

router=APIRouter(prefix="/auth",tags=["auth"])

class UserRequest(BaseModel):
    email:str
    password:str
    name: str | None = None

@router.post('/signup',status_code=status.HTTP_201_CREATED)
def signup(body: UserRequest):
    try:
        if not body.email or not body.password:
            raise HTTPException(status_code=400,detail="Email and password are required")


        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            'options':{
                'data': {
                    'username': body.email.split('@')[0],
                    'name': body.name
                }
            }
        })
        print(response.user)

        return {"message": "User registered successfully", "user": response.user.user_metadata}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))

@router.post('/login',status_code=status.HTTP_200_OK)
def login(body: UserRequest,res:Response):
    try:
        email=body.email
        password=body.password

        if not email or not password:
            raise HTTPException(status_code=400,detail="Email and password are required")
        
        response=supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })
        res.set_cookie(
            key="access_token",
            value=response.session.access_token,
            httponly=True,
            samesite="Lax",
            secure=False,
            max_age=3600
        )
        res.set_cookie(
            key="refresh_token",
            value=response.session.refresh_token,
            httponly=True,
            samesite="Lax",
            secure=False,
            max_age=3600*24*30
        )
        return {"message": "User logged in successfully", "user": response.user.user_metadata}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    


@router.post('/logout', status_code=status.HTTP_200_OK)
def logout():
    try:
        supabase.auth.sign_out()
        return {"message": "User logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    

@router.get('/user', status_code=status.HTTP_200_OK)
def get_user():
    try:
        user = supabase.auth.get_user()
        print(user)
        if user is None or user.user is None:
            raise HTTPException(status_code=404,detail="User not found. Check your authentication.")
        return {"user": user.user.user_metadata}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    


@router.delete('/delete_user', status_code=status.HTTP_200_OK)
def delete_user():
    try:
        supabase.auth.admin.delete_user(
            #get user id via middleware or other means
        )
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    