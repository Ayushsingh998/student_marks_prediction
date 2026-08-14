# Student Marks Prediction

Minimal full-stack app for predicting student marks and generating target-based recommendations.

## Structure

```text
backend/
  app/
    main.py
    routers/
    schemas/
    services/
    core/
  ml/
    train.py
    data/data.csv
    models/model.pkl
    models/shap_explainer.pkl
frontend/
README.md
```

## Backend

```bash
cd backend
pip install -r requirements.txt
python ml/train.py
uvicorn app.main:app --reload
```

Endpoints:

- `POST /predict`
- `POST /explain`
- `GET /dashboard-data`

## Frontend

```bash
cd frontend
npm install
npm run dev
```
