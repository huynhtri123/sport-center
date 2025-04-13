import pandas as pd
from flask import Blueprint, request, jsonify
from app.model_utils import BookingPredictor, preprocess_input, create_features_for_day

bp = Blueprint('api', __name__)

# Load model và sport types
predictor = BookingPredictor.load_model("app/booking_model.pkl")

# dự đoán cả ngày (24 timeslot: 0-23 <=> 0: 0-1, 23: 23-0)
@bp.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        X_raw = create_features_for_day(
            field_id=data['field_id'],
            sport_id=data['sport_id'],
            day_of_week=data['day_of_week'],
            month=data['month'],
            price=data['price']
        )

        X_input = preprocess_input(X_raw)
        probs = predictor.predict(X_input)

        return jsonify({
            "status": "success",
            "probabilities": probs.tolist()
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

# dự đoán 1 timeslot cụ thể, ví dụ timeslot 1: 0h-1h -> hour=0
@bp.route('/predict-hour', methods=['POST'])
def predict_single_hour():
    try:
        data = request.get_json()

        test_df = pd.DataFrame([{
            'field_id': data['field_id'],
            'sport_id': data['sport_id'],
            'day_of_week': data['day_of_week'],
            'hour': data['hour'],
            'month': data['month'],
            'price': data['price']
        }])

        X_input = preprocess_input(test_df)
        prob = predictor.predict(X_input)[0]

        return jsonify({
            "status": "success",
            "probability": prob
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400
