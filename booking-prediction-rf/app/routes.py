import pandas as pd
from flask import Blueprint, request, jsonify
from model.model import BookingPredictor, preprocess_input
from app.utils import create_features_for_day
from testcase.test_case import test_midnight_case, test_full_day_schedule

bp = Blueprint('api', __name__)

# Load model
predictor = BookingPredictor.load_model("model/booking_model.pkl")

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


# test trên console
@bp.route('/test', methods=['GET'])
def test():
    # Test case
    test_midnight_case(predictor)
    test_full_day_schedule(predictor)
    return jsonify({
            "status": "success, result in console"
        })
        