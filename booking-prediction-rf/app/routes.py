import os
import pandas as pd
from flask import Blueprint, request, jsonify
from model.model import BookingPredictor, preprocess_input
from app.utils import create_features_for_day, validate_input
from testcase.test_case import test_midnight_case, test_full_day_schedule
from train_model import train_and_save_model

bp = Blueprint('api', __name__)

# Load initial model
predictor = BookingPredictor.load_model("model/booking_model.pkl")

# api chính: Dự đoán cả ngày (24 timeslot)
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


# Dự đoán một timeslot cụ thể
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


# Test case
@bp.route('/test', methods=['GET'])
def test():
    test_midnight_case(predictor)
    test_full_day_schedule(predictor)
    return jsonify({
        "status": "success, result in console"
    })


# Thêm dữ liệu mới (1 hoặc nhiều dòng)
@bp.route('/add-data', methods=['POST'])
def add_data():
    try:
        data = request.get_json()

        if isinstance(data, dict):
            data_list = [data]  # chỉ 1 dòng
        elif isinstance(data, list):
            data_list = data    # nhiều dòng
        else:
            return jsonify({"status": "error", "message": "Dữ liệu phải là object hoặc list các object"}), 400

        required_fields = ['field_id', 'sport_id', 'day_of_week', 'hour', 'month', 'price']

        all_errors = []
        for idx, item in enumerate(data_list):
            for field in required_fields:
                if field not in item:
                    all_errors.append(f"Dòng {idx + 1}: Thiếu trường {field}")
            item_errors = validate_input(item)
            if item_errors:
                all_errors.append(f"Dòng {idx + 1}: " + "; ".join(item_errors))

        if all_errors:
            return jsonify({"status": "error", "message": " | ".join(all_errors)}), 400

        # Ghi vào file CSV
        df = pd.DataFrame(data_list)
        save_path = "data/bookings_data.csv"

        if not os.path.exists(save_path):
            df.to_csv(save_path, index=False)   # thêm luôn tên cột
        else:
            df.to_csv(save_path, mode='a', header=False, index=False)

        return jsonify({
            "status": "success",
            "message": f"Đã thêm {len(data_list)} dòng dữ liệu thành công.",
            "data": data_list
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# train và save lại model
@bp.route('/retrain', methods=['POST'])
def retrain():
    global predictor
    try:
        acc = train_and_save_model()
        predictor = BookingPredictor.load_model("model/booking_model.pkl")

        return jsonify({
            "status": "success",
            "message": "Đã huấn luyện lại mô hình.",
            "accuracy": acc
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
