from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
import whisper
import shutil

app = FastAPI(title="CivicPulse AI API")

# Load Whisper model (base is a good balance for speed/accuracy)
model = whisper.load_model("base")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "../data/feedback.json"

class Feedback(BaseModel):
    id: Optional[str] = None
    text: str
    category: str
    sentiment: Optional[str] = "Neutral"
    timestamp: Optional[str] = None

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.get("/")
async def root():
    return {"message": "CivicPulse AI API is running"}

@app.post("/feedback")
async def add_feedback(feedback: Feedback):
    data = load_data()
    feedback.id = str(len(data) + 1)
    feedback.timestamp = datetime.now().isoformat()
    
    # Mock AI analysis for now (Sentiment)
    text_lower = feedback.text.lower()
    if any(word in text_lower for word in ["bad", "terrible", "broke", "issue", "problem"]):
        feedback.sentiment = "Negative"
    elif any(word in text_lower for word in ["good", "great", "excellent", "thanks", "helpful"]):
        feedback.sentiment = "Positive"
    else:
        feedback.sentiment = "Neutral"
    
    data.append(feedback.dict())
    save_data(data)
    return feedback

@app.get("/feedback", response_model=List[Feedback])
async def get_feedback():
    return load_data()

@app.get("/stats")
async def get_stats():
    data = load_data()
    total = len(data)
    if total == 0:
        return {"total": 0, "sentiment": "None", "top_issue": "None"}
    
    sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    category_counts = {}
    
    for item in data:
        sentiment_counts[item["sentiment"]] = sentiment_counts.get(item["sentiment"], 0) + 1
        category_counts[item["category"]] = category_counts.get(item["category"], 0) + 1
    
    overall_sentiment = max(sentiment_counts, key=sentiment_counts.get)
    top_issue = max(category_counts, key=category_counts.get) if category_counts else "None"
    
    # Calculate percentages for categories
    top_issues = sorted([{"name": k, "val": round((v/total)*100)} for k, v in category_counts.items()], key=lambda x: x["val"], reverse=True)

    return {
        "total": total,
        "sentiment": overall_sentiment,
        "top_issue": top_issue,
        "top_issues_list": top_issues[:4]
    }

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    lines = content.decode("utf-8").splitlines()
    if len(lines) < 2:
        return {"message": "CSV is empty"}
    
    data = load_data()
    count = 0
    for line in lines[1:]: # Skip header
        parts = line.split(",")
        if len(parts) >= 2:
            text = parts[0].strip()
            category = parts[1].strip()
            
            feedback = Feedback(text=text, category=category)
            feedback.id = str(len(data) + 1)
            feedback.timestamp = datetime.now().isoformat()
            
            # Sentiment logic
            text_lower = text.lower()
            if any(word in text_lower for word in ["bad", "terrible", "broke", "issue", "problem"]):
                feedback.sentiment = "Negative"
            elif any(word in text_lower for word in ["good", "great", "excellent", "thanks", "helpful"]):
                feedback.sentiment = "Positive"
            else:
                feedback.sentiment = "Neutral"
            
            data.append(feedback.dict())
            count += 1
            
    save_data(data)
    return {"message": f"Successfully uploaded {count} feedback items"}

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    # Save temporary audio file
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Transcribe using Whisper
        result = model.transcribe(temp_file)
        text = result["text"].strip()
        
        # Close the file before deleting
        os.remove(temp_file)
        
        if not text:
            return {"message": "Could not transcribe audio"}

        # Process as regular feedback
        data = load_data()
        feedback = Feedback(text=text, category="Other") # Default category for voice
        feedback.id = str(len(data) + 1)
        feedback.timestamp = datetime.now().isoformat()
        
        # Sentiment logic (reuse existing)
        text_lower = text.lower()
        if any(word in text_lower for word in ["bad", "terrible", "broke", "issue", "problem"]):
            feedback.sentiment = "Negative"
        elif any(word in text_lower for word in ["good", "great", "excellent", "thanks", "helpful"]):
            feedback.sentiment = "Positive"
        else:
            feedback.sentiment = "Neutral"
        
        data.append(feedback.dict())
        save_data(data)
        
        return {
            "message": "Audio feedback transcribed and saved",
            "transcription": text,
            "feedback": feedback
        }
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
