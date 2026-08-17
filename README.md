# Student Marks Prediction

Full-stack app for predicting student marks and generating target-based recommendations,
with SHAP-based explainability and Gemini-powered narrative summaries.

## Structure

```text
frontend/
  src/
    main.jsx              # entry point
    App.jsx                # top-level state + page routing
    api/                    # fetch wrapper + predict/explain calls
    pages/                  # PredictPage, RecommendationsPage, InsightsPage
    components/
      forms/                # StudentForm, FormField
      charts/                # ComparisonBarChart, ImprovementBarChart, PriorityBarChart, PerformanceRadar
      cards/                  # RiskCard, GapCard, FeatureAdviceCard
      layout/                  # Sidebar, BackButton
      common/                   # EmptyState, InfluencingFactors
    hooks/                       # usePrediction, useExplanation
    utils/                        # validate, normalize
    constants/                     # fields, featureMeta

backend/
  app/
    main.py
    core/
    routers/                # predict, explain, dashboard
    schemas/
    services/                # model_service, explainer_service, gemini_service
  ml/
    shap_train.py
    notebook.ipynb
    data/
    models/
  tests/                       # pytest placeholders
  .env.example
```

## Backend

```bash
cd backend
cp .env.example .env   # fill in GEMINI_API_KEY if you want live LLM summaries
pip install -r requirements.txt
python ml/shap_train.py
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
