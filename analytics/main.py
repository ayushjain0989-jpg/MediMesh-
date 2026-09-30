import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from auth import TOKEN_HOURS, create_access_token, require_user
from hospital_flow import FlowInputs, simulate_flow
from users import authenticate

app = FastAPI(title="MediMesh API", version="0.2.0")

default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
)
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", default_origins).split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginBody(BaseModel):
    loginId: str = Field(min_length=1)
    password: str = Field(min_length=1)
    role: str = Field(min_length=1)


@app.get("/health")
def health():
    return {"ok": True, "service": "medimesh-api", "auth": "jwt"}


@app.post("/auth/login")
def login(body: LoginBody):
    user, error = authenticate(body.loginId, body.password, body.role)
    if error or user is None:
        raise HTTPException(status_code=401, detail=error or "Sign-in failed.")
    token = create_access_token(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": TOKEN_HOURS * 3600,
        "user": user,
    }


@app.get("/auth/me")
def me(claims: dict = Depends(require_user)):
    return claims


@app.post("/analytics/flow")
def analytics_flow(inputs: FlowInputs, claims: dict = Depends(require_user)):
    if claims.get("hospital_id") and claims["hospital_id"] != inputs.hospitalId:
        raise HTTPException(status_code=403, detail="Token is locked to another hospital.")
    return simulate_flow(inputs)
