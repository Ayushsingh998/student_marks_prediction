# 🎓 Student Marks Prediction

> An intelligent full-stack machine learning application that predicts student final marks, explains the prediction using SHAP, evaluates progress toward a target score, and generates personalized academic recommendations with optional Gemini-powered AI analysis.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://student-marks-prediction-silk.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://react.dev/)
[![ML](https://img.shields.io/badge/ML-Scikit--learn-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![Explainability](https://img.shields.io/badge/Explainability-SHAP-FF4B4B)](https://shap.readthedocs.io/)

## 🌐 Live Demo

**Frontend:** https://student-marks-prediction-silk.vercel.app/

The application provides a web interface for entering student performance information and viewing predictions, influencing factors, target gaps, charts, and recommendations.

> **Note:** The frontend requires a deployed FastAPI backend configured through `VITE_API_URL`. If the live frontend cannot reach the backend, configure the production backend URL in the frontend deployment environment variables.

---

## 📌 Overview

Student Marks Prediction is a full-stack ML application designed to go beyond a simple marks prediction.

A user enters:

- Attendance
- Internal Test 1 score
- Internal Test 2 score
- Assignment score
- Daily study hours
- Previous-year marks

The system then:

1. Converts the input values into the feature representation expected by the trained model.
2. Predicts the student's final marks.
3. Uses SHAP to identify which factors influenced the prediction.
4. Compares the prediction with a user-defined target.
5. Calculates the marks gap and risk level.
6. Generates factor-wise improvement targets and recommendations.
7. Optionally uses Google Gemini to generate richer personalized academic guidance.
8. Falls back to deterministic backend recommendations if Gemini is unavailable.

---

## ✨ Key Features

### 🤖 ML-Based Marks Prediction
Predicts final marks from academic and behavioral features using a trained Scikit-learn regression pipeline.

### 🔍 SHAP Explainability
Explains **why** the model produced a prediction instead of treating the model as a black box.

The system categorizes factors as:

- Positive influence
- Negative influence
- Neutral influence

### 🎯 Target-Based Recommendations
Students can provide a target score and see:

- Predicted marks
- Target marks
- Marks gap
- Risk level
- Expected improvement
- Priority of each factor
- Actionable recommendations

### 🧠 Gemini-Powered Analysis
When `GEMINI_API_KEY` is configured, Gemini can generate:

- Personalized recommendations
- Detailed performance analysis
- Factor-specific advice
- Practical improvement strategies

If Gemini is unavailable, the application automatically uses backend-generated recommendations.

### 📊 Interactive Visualizations
The frontend includes charts and visual components for:

- Current vs target performance
- Improvement requirements
- Priority analysis
- Performance radar
- SHAP impact
- Influencing factors

### ⚡ FastAPI Backend
Provides REST APIs for prediction and explanation with automatic Swagger/OpenAPI documentation.

### 🌐 React + Vite Frontend
Provides a responsive, component-based user interface with client-side validation and API integration.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │       Student        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite UI    │
                         │     Frontend         │
                         └──────────┬───────────┘
                                    │
                           REST API Requests
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    FastAPI Backend   │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
             ┌───────────────┐             ┌───────────────┐
             │  ML Service   │             │  Explainer    │
             │               │             │    Service    │
             └───────┬───────┘             └───────┬───────┘
                     │                             │
                     ▼                             ▼
             ┌───────────────┐             ┌───────────────┐
             │ Trained Model │             │ SHAP Explainer│
             └───────┬───────┘             └───────┬───────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Target Gap & Risk    │
                         │ Recommendations      │
                         └──────────┬───────────┘
                                    │
                              Gemini Analysis
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Personalized Output  │
                         └──────────────────────┘
```

---

## 🧠 Machine Learning Approach

### Model

The training pipeline uses:

- `StandardScaler`
- `LinearRegression`
- Scikit-learn `Pipeline`

The model is trained on the following five features:

| Feature | Description |
|---|---|
| `attendance_pct` | Attendance percentage |
| `assignment_score_pct` | Assignment score normalized to percentage |
| `daily_study_hours` | Average daily study hours |
| `previous_year_marks_pct` | Previous-year academic performance |
| `internal_avg_pct` | Average of Internal Test 1 and Internal Test 2, normalized to percentage |

### Target

```text
final_marks_pct
```

The training script creates:

```text
backend/ml/models/model.pkl
backend/ml/models/shap_explainer.pkl
```

### Training Flow

```text
Raw Dataset
     │
     ▼
Data Cleaning & Column Mapping
     │
     ▼
Feature Normalization
     │
     ▼
Internal Test Average
     │
     ▼
Train/Test Split
     │
     ▼
StandardScaler
     │
     ▼
Linear Regression──────────────► model.pkl
     │
     ├
     │
SHAP LinearExplainer──────────────► shap_explainer.pkl

```

> The current training script creates an 80/20 train/test split but does not calculate or persist a formal accuracy/R² report. Therefore, this project README intentionally does not claim a specific model accuracy.

---

## 🔍 How SHAP Is Used

SHAP (SHapley Additive exPlanations) is used to explain the contribution of each input feature to the predicted marks.

For each prediction, the backend calculates SHAP values for:

- Attendance
- Internal Tests
- Assignment
- Study Hours
- Academic History

Example interpretation:

```text
Attendance        → +2.40 marks
Internal Tests    → -1.30 marks
Assignment        → +0.80 marks
Study Hours       → +1.70 marks
Academic History  → +0.50 marks
```

A positive SHAP value indicates that the feature pushed the prediction upward relative to the model's baseline, while a negative value indicates downward influence.

This makes the prediction more transparent and useful for academic decision-making.

---

## 🎯 Recommendation & Risk Logic

The application calculates the difference between the target and predicted marks:

```text
Marks Gap = Target Marks - Predicted Marks
```

Risk levels are determined from the gap:

| Gap | Risk |
|---:|---|
| ≤ 5 marks | Low |
| > 5 and ≤ 15 marks | Medium |
| > 15 marks | High |

The recommendation service then evaluates controllable factors and assigns priorities based on their SHAP impact and required improvement.

---

## 🧩 Gemini Integration

Gemini is optional.

The backend sends a structured academic-performance plan containing:

- Predicted marks
- Target marks
- Marks gap
- Risk level
- Student metrics
- SHAP impacts
- Calculated feature targets

Gemini returns structured recommendations that are merged with the backend's canonical feature calculations.

### Fallback Design

```text
             Explanation Request
                     │
                     ▼
              Backend Analysis
                     │
                     ▼
               Gemini API?
                /       \
              Yes        No/Error
               │           │
               ▼           ▼
        Gemini Analysis  Backend
               │        Fallback
               └─────┬─────┘
                     ▼
             Final Recommendations
```

This means the core application can still generate recommendations without an active Gemini API key.

---

## 📁 Project Structure

```text
student_marks_prediction/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── predict.js
│   │   │
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   ├── charts/
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   │
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── routers/
│   │   │   ├── predict.py
│   │   │   └── explain.py
│   │   ├── schemas/
│   │   │   └── student.py
│   │   ├── services/
│   │   │   ├── model_service.py
│   │   │   ├── explainer_service.py
│   │   │   └── gemini_service.py
│   │   └── main.py
│   │
│   ├── ml/
│   │   ├── data/
│   │   │   ├── data.csv
│   │   │   └── raw_data.csv
│   │   ├── models/
│   │   │   ├── model.pkl
│   │   │   └── shap_explainer.pkl
│   │   ├── notebook.ipynb
│   │   └── shap_train.py
│   │
│   ├── .env.example
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- TailwindCSS

### Backend

- Python
- FastAPI
- Pydantic
- Pandas
- NumPy
- python-dotenv

### Machine Learning

- Scikit-learn
- Linear Regression
- StandardScaler
- SHAP

### Generative AI

- Google Gemini API

### Deployment

- Vercel — Frontend
- Render — Recommended backend deployment

---

## ⚙️ Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ayushsingh998/student_marks_prediction.git
cd student_marks_prediction
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
```

#### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

#### macOS/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

### 3. Configure environment variables

Create:

```text
backend/.env
```

Based on:

```text
backend/.env.example
```

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_TIMEOUT=90
```

`GEMINI_API_KEY` is optional if you want to use the backend fallback recommendation system.

### 4. Train/rebuild the ML artifacts if needed

From the `backend` directory:

```bash
python ml/shap_train.py
```

This generates:

```text
backend/ml/models/model.pkl
backend/ml/models/shap_explainer.pkl
```

### 5. Start the backend

```bash
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

### 6. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide the local frontend URL, typically:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend

Create:

```text
backend/.env
```

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_TIMEOUT=90
```

### Frontend

For production, configure:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

The frontend reads the backend URL using:

```javascript
import.meta.env.VITE_API_URL
```

For local development, the application falls back to:

```text
http://localhost:8000
```

> Never commit real API keys to GitHub.

---

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

Returns:

```json
{
  "status": "ok"
}
```

### Predict Marks

```http
POST /predict
```

Accepts student performance data and returns:

- Predicted marks
- Model baseline value
- SHAP values
- Influencing factors

### Explain Prediction

```http
POST /explain
```

Accepts the student inputs, prediction, target marks, and SHAP values and returns:

- Target gap
- Risk level
- Recommendations
- Feature advice
- Detailed analysis
- Recommendation source

### Swagger Documentation

```text
GET /docs
```

FastAPI automatically generates interactive API documentation.

---

## 📊 Input Features

| Input | Range | Meaning |
|---|---:|---|
| Attendance | 0–100 | Attendance percentage |
| Internal Test 1 | 0–40 | First internal test score |
| Internal Test 2 | 0–40 | Second internal test score |
| Assignment | 0–10 | Assignment score |
| Daily Study Hours | 0–24 | Average study hours per day |
| Previous Year Marks | 0–100 | Previous academic performance |
| Target Marks | 0–100 | Desired final score |

Internal tests and assignments are normalized internally before being passed to the ML model.

---

## 🚀 Deployment

### Frontend — Vercel

Recommended settings:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Production environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend — Render

Recommended settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Configure the backend environment variables in Render instead of committing `.env`.

---

## 🔄 Application Workflow

```text
1. User enters student information
              ↓
2. Frontend validates the input
              ↓
3. POST /predict
              ↓
4. Backend converts features to model format
              ↓
5. ML model predicts final marks
              ↓
6. SHAP calculates feature contributions
              ↓
7. Prediction + SHAP results return to frontend
              ↓
8. User selects/enters target marks
              ↓
9. POST /explain
              ↓
10. Backend calculates target gap and risk
              ↓
11. Gemini generates personalized analysis
    OR backend fallback generates recommendations
              ↓
12. Frontend displays charts, insights,
    priorities and recommendations
```

---

## 🧪 Testing

### Backend health test

```bash
curl http://127.0.0.1:8000/health
```

### API documentation

Open:

```text
http://127.0.0.1:8000/docs
```

### Frontend production build

```bash
cd frontend
npm run build
```

A successful build creates:

```text
frontend/dist/
```

---

## 🔒 Security Notes

- Keep `GEMINI_API_KEY` only in backend environment variables.
- Never expose the Gemini API key in React/Vite environment variables.
- Never commit `.env` files containing secrets.
- Use `.env.example` as the public configuration template.
- For production, restrict CORS to the deployed frontend origin instead of allowing all origins.

---

## ⚠️ Current Limitations

- The model is a regression model trained on the available dataset; predictions should be treated as estimates rather than guaranteed results.
- The current training script does not provide a formal accuracy/R² report in the application.
- Gemini recommendations depend on a valid API key and available Gemini service.
- Free hosting tiers may have cold starts or resource limitations.
- Model quality depends on the dataset and feature quality.

---

## 🔮 Future Enhancements

- Add model comparison between Linear Regression, Random Forest, XGBoost and other regressors.
- Add cross-validation and automated model evaluation.
- Display R², MAE and RMSE on the ML analytics page.
- Add student authentication and personal history.
- Store prediction history in a database.
- Add teacher/admin dashboards.
- Add batch prediction through CSV upload.
- Add automated progress tracking over multiple assessments.
- Improve recommendation generation using historical student progress.
- Add production monitoring and API logging.
- Restrict backend CORS to trusted production origins.
- Add automated CI/CD testing with GitHub Actions.

---

## 👨‍💻 Project Highlights

This project demonstrates practical integration of:

**Machine Learning + Explainable AI + Generative AI + REST APIs + React + FastAPI + Cloud Deployment**

It is especially useful as an academic/portfolio project because it demonstrates not only model prediction, but also **model interpretability and actionable decision support**.

---

## 📄 License

This project is intended for educational and portfolio purposes. Add an appropriate open-source license if you plan to distribute the project for reuse.

---

## ⭐ Acknowledgements

- Scikit-learn for machine learning utilities
- SHAP for model explainability
- FastAPI for backend API development
- React and Vite for frontend development
- Recharts for data visualization
- Google Gemini for optional AI-generated analysis
