class MLService:
    def __init__(self):
        self.model = None

    def load_model(self, model_path: str):
        self.model = model_path

    def predict(self, data):
        return {"predicted_marks": 0.0, "confidence": 0.0}
