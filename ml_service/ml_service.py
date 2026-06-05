from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import os

app = FastAPI()

# =========================
# 🔥 SAFE MODEL LOAD
# =========================
MODEL_PATH = "trained_model.pkl"

if not os.path.exists(MODEL_PATH):
    raise Exception("❌ trained_model.pkl not found in ml_service folder")

model = joblib.load(MODEL_PATH)


# =========================
# INPUT SCHEMAS
# =========================
class NodeInput(BaseModel):
    weather: float
    traffic: float
    ships: float
    delay: float


class BatchInput(BaseModel):
    nodes: list[NodeInput]


# =========================
# SINGLE PREDICT
# =========================
@app.post("/predict")
def predict(data: NodeInput):
    try:
        features = np.array([[
            data.weather,
            data.traffic,
            data.ships,
            data.delay
        ]])

        prediction = model.predict(features)[0]

        return {"predictedRisk": float(prediction)}

    except Exception as e:
        return {"predictedRisk": 0.0, "error": str(e)}


# =========================
# 🔥 BATCH PREDICT (FIXED)
# =========================
@app.post("/predict-batch")
def predict_batch(data: BatchInput):

    try:
        # 🔥 handle empty input
        if not data.nodes or len(data.nodes) == 0:
            return {"predictions": []}

        features = []

        for n in data.nodes:
            features.append([
                float(n.weather),
                float(n.traffic),
                float(n.ships),
                float(n.delay)
            ])

        features = np.array(features)

        # 🔥 ensure correct shape
        if len(features.shape) != 2:
            raise Exception("Invalid feature shape")

        predictions = model.predict(features)

        return {
            "predictions": predictions.tolist()
        }

    except Exception as e:
        print("❌ ML BATCH ERROR:", e)

        # 🔥 fallback safe response
        fallback = [0.0 for _ in data.nodes]

        return {
            "predictions": fallback,
            "error": str(e)
        }


# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def root():
    return {"message": "ML API running"}