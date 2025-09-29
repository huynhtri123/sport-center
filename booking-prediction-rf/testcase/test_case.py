import pandas as pd
from model.model import preprocess_input
from app.utils import create_features_for_day

# TEST CASE: booking lúc 1h sáng
def test_midnight_case(predictor):
    test_df = pd.DataFrame([{
        'field_id': '67656c0cb4bf0144df3eec21',
        'sport_id': '676541a9bf85ec5de3d4b68b',
        'day_of_week': 1,
        'hour': 6,
        'month': 4,
        'price': 100000
    }])
    X_test_input = preprocess_input(test_df)
    prob = predictor.predict(X_test_input)[0]
    
    hour_val = test_df['hour'].iloc[0]  # lấy giá trị hour từ test_df

    print("-" * 40)
    print(f"Giờ: {hour_val}h → Xác suất: {prob:.2%}")


# TEST CASE: dự đoán cả ngày
def test_full_day_schedule(predictor):
    field_id = '67657d03b4bf0144df3eec2b'   #ban bong s1
    sport_id = '67654209bf85ec5de3d4b68e'   #table tennis
    day_of_week = 1  # Thứ Hai
    month = 5
    price = 100000

    X_raw = create_features_for_day(field_id, sport_id, day_of_week, month, price)
    X_input = preprocess_input(X_raw)
    probabilities = predictor.predict(X_input)

    print("\nXác suất đặt sân theo khung giờ (24h):")
    print("-" * 40)
    for hour, prob in enumerate(probabilities):
        time_range = f"{hour:02d}:00 - {(hour + 1) % 24:02d}:00"
        print(f"{time_range}: {prob:.2%}")