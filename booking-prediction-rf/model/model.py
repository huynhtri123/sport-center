import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# class đại diện cho model RandomForest
class BookingPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(random_state=42)
        self.feature_names = None

    def train(self, X_train, y_train):
        self.feature_names = X_train.columns.tolist()
        self.model.fit(X_train, y_train)

    def predict(self, X_test):
        X_test = X_test[self.feature_names]
        return self.model.predict_proba(X_test)[:, 1]

    def save_model(self, file_path):
        joblib.dump(self, file_path)

    @staticmethod
    def load_model(file_path):
        return joblib.load(file_path)


# Sinh dữ liệu âm từ dữ liệu dương
def generate_negative_samples(df_positive, n_neg_per_pos=1):
    negative_samples = []
    
    # Tạo set chứa tất cả các tổ hợp của các trường để chút check không cho trùng với tập dương
    # (trùng hết mơis bỏ)
    existing_set = set(
        zip(df_positive['field_id'], df_positive['sport_id'], df_positive['day_of_week'], 
            df_positive['hour'], df_positive['month'], df_positive['price'])
    )

    field_ids = df_positive['field_id'].unique()    # lấy trong tập dương
    sport_ids = df_positive['sport_id'].unique()
    days_of_week = list(range(1, 8))  # full 7 ngày
    hours = list(range(24))           # full 24 giờ
    months = list(range(1, 13))       # full 12 tháng
    prices = df_positive['price'].unique()

    # Duyệt qua các mẫu dương và tạo mẫu âm
    for _, row in df_positive.iterrows():
        for _ in range(n_neg_per_pos):
            field_id = np.random.choice(field_ids)
            sport_id = np.random.choice(sport_ids)
            day_of_week = np.random.choice(days_of_week)
            hour = np.random.choice(hours)
            month = np.random.choice(months)
            price = np.random.choice(prices)

            key = (field_id, sport_id, day_of_week, hour, month, price)
            
            # Lựa chọn các mẫu không trùng với các tổ hợp đã có
            if key not in existing_set:
                negative_samples.append({
                    'field_id': field_id,
                    'sport_id': sport_id,
                    'day_of_week': day_of_week,
                    'hour': hour,
                    'month': month,
                    'price': price,
                    'was_booked': 0
                })

    return pd.DataFrame(negative_samples)


# Tiền xử lý dữ liệu huấn luyện
def preprocess_training_data(df):
    le_field = LabelEncoder()
    df['field_id'] = le_field.fit_transform(df['field_id'])

    le_sport = LabelEncoder()
    df['sport_id'] = le_sport.fit_transform(df['sport_id'])

    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x in [6, 7] else 0)
    df['is_peak_hour'] = df['hour'].apply(lambda x: 1 if 17 <= x <= 21 else 0)
    
    return df


# Tiền xử lý dữ liệu đầu vào cho dự đoán
def preprocess_input(df_input):
    df = df_input.copy()
    df['field_id'] = df['field_id'].astype('category').cat.codes
    df['sport_id'] = df['sport_id'].astype('category').cat.codes

    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x in [6, 7] else 0)
    df['is_peak_hour'] = df['hour'].apply(lambda x: 1 if 17 <= x <= 21 else 0)

    expected_cols = [
        'field_id', 'sport_id', 'day_of_week', 'hour', 'month', 'price',
        'is_weekend', 'is_peak_hour'
    ]

    missing_cols = [col for col in expected_cols if col not in df.columns]
    for col in missing_cols:
        df[col] = 0

    return df[expected_cols]
