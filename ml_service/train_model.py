import json
import numpy as np
import joblib
from xgboost import XGBRegressor

# =========================
# LOAD DATA
# =========================
data = []

with open("../server/dataset.json") as f:
    for line in f:
        data.append(json.loads(line))

print(f"Loaded {len(data)} samples")

# =========================
# PREPARE DATA
# =========================
X = []
y = []

for d in data:
    X.append([
        d["weather"],
        d["traffic"],
        d["ships"],
        d["delay"]
    ])
    y.append(d["actualDelay"])

X = np.array(X)
y = np.array(y)

# =========================
# TRAIN MODEL
# =========================
model = XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1
)

model.fit(X, y)

# =========================
# SAVE MODEL
# =========================
joblib.dump(model, "trained_model.pkl")

print("✅ Model trained and saved!")