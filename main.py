import joblib 
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

# Model aur database load karna
model = joblib.load('Mental_Health_Model.pkl')
top_countries = ['Other','India','USA','Canada','Australia','UK','Germany','Mexico','Turkey','France']

app = FastAPI()

# 🔥 STEP 1: CORS Middleware sabse pehle hona chahiye taaki browser errors na aayein
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# 🔥 STEP 2: Ab static assets (.js, .css) ko safe location par mount karein
# Isse browser static assets ko automatic fetch kar sakega
app.mount("/ui", StaticFiles(directory="."), name="ui")

BASE_DIR = Path(__file__).resolve().parent

@app.get("/")
async def read_index():
    return FileResponse(BASE_DIR / "index.html")

# Data structures (Pydantic Models)
class StudentData(BaseModel):
    age                     : int = Field(..., ge=0 , le=100)
    gender                  : Literal['Male','Female']
    country                 : str
    academic_level          : Literal['Undergraduate', 'Graduate', 'High School']
    most_used_platform      : Literal['Facebook','LinkedIn','Instagram','Snapchat','Twitter','YouTube','TikTok','LINE','KakaoTalk','VKontakte','WhatsApp','WeChat']
    purpose_of_use          : Literal['Networking', 'Education', 'Entertainment', 'News']
    avg_daily_usage_hours   : float = Field(..., ge=0, le=24)
    daily_unlocks           : int   = Field(..., ge=0)
    study_hours             : float = Field(..., ge=0 , le=24)
    physical_activity_hours : float = Field(..., ge=0 , le=24)
    sleep_hours_per_night   : float = Field(..., ge=0 , le=24 )
    stress_level            : Literal['Medium', 'Low', 'Very High', 'High']

class PredictionResponse(BaseModel):
    predicted_mental_health_score: float

# ML Prediction Endpoint
@app.post('/predict', response_model=PredictionResponse)
def predict(data: StudentData):
    country_group = data.country if data.country in top_countries else "Other"
    input_row = pd.DataFrame([{
        'Age'                    : data.age,
        'Gender'                 : data.gender,
        'Country'                : data.country,
        'Academic_Level'         : data.academic_level,
        'Most_Used_Platform'     : data.most_used_platform,
        'Purpose_Of_Use'         : data.purpose_of_use,
        'Avg_Daily_Usage_Hours'  : data.avg_daily_usage_hours,
        'Daily_Unlocks'          : data.daily_unlocks,
        'Study_Hours'            : data.study_hours,
        'Physical_Activity_Hours': data.physical_activity_hours,
        'Sleep_Hours_Per_Night'  : data.sleep_hours_per_night,
        'Stress_Level'           : data.stress_level,
        'Grouped_Country'        : country_group      
    }])

    prediction = model.predict(input_row)[0]
    return PredictionResponse(predicted_mental_health_score=round(float(prediction), 2))

if __name__ == '__main__':
    import uvicorn
    # Render deployment ke liye Port 10000 use karna safe hota hai, local par ye 5000 standard hai
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host='0.0.0.0', port=port)
