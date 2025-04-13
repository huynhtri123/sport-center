import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# class đại diện cho model RandomForest
class BookingPredictor:
    # hàm tạo, khởi tạo mô hình
    def __init__(self):
        self.model = RandomForestClassifier(random_state=42)
        self.feature_names = None

    # huấn luyện mô hình
    def train(self, X_train, y_train):
        self.feature_names = X_train.columns.tolist()
        self.model.fit(X_train, y_train)

    # dự đoán kết quả
    def predict(self, X_test):
        # đảm bảo dữ liệu vào chỉ chứa các cột đúng theo thứ tự và tên
        X_test = X_test[self.feature_names]
        # gọi hàm dự đoán từ randomForest
        # hàm này trả về mảng 2 chiều với 
        # cột 0 là class 0 (tỉ lệ sân ko được đặt), cột 1 là class 1 (tỉ lệ sân được đặt)
        # lấy tất cả hàng của cột thứ 2 (tỉ lệ được đặt)
        return self.model.predict_proba(X_test)[:, 1]

    # lưu mô hình vào file
    def save_model(self, file_path):
        joblib.dump(self, file_path)

    # tải mô hình từ file đã lưu
    @staticmethod
    def load_model(file_path):
        return joblib.load(file_path)

# Tiền xử lý dữ liệu huấn luyện
def preprocess_training_data(df):
    # chuyển kiểu của cột field_id từ chuỗi thành số để random forest hiểu
    le_field = LabelEncoder()   
    df['field_id'] = le_field.fit_transform(df['field_id'])

    le_sport = LabelEncoder()
    df['sport_id'] = le_sport.fit_transform(df['sport_id'])

    # nếu là ngày 6,7 thì là ngày cuối tuần (t7,cn)
    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x in [6, 7] else 0)
    # nếu là từ 17-21 giờ thì là giờ cao điểm
    df['is_peak_hour'] = df['hour'].apply(lambda x: 1 if 17 <= x <= 21 else 0)
    return df

# Tiền xử lý dữ liệu đầu vào
def preprocess_input(df_input):
    # tạo bản sao để tránh sửa trực tiếp vào bản gốc
    df = df_input.copy()
    # chuyển thành kiểu số cho model hiểu
    df['field_id'] = df['field_id'].astype('category').cat.codes
    df['sport_id'] = df['sport_id'].astype('category').cat.codes

    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x in [6, 7] else 0)
    df['is_peak_hour'] = df['hour'].apply(lambda x: 1 if 17 <= x <= 21 else 0)

    # đảm bảo đầy đủ các cột khớp với model
    expected_cols = [
        'field_id', 'sport_id', 'day_of_week', 'hour', 'month', 'price',
    ]
    expected_cols += ['is_weekend', 'is_peak_hour']
    # nếu đầu vào thiếu cột nào thì gán bằng 0
    missing_cols = [col for col in expected_cols if col not in df.columns]
    for col in missing_cols:
        df[col] = 0

    return df[expected_cols]

# Tạo dữ liệu cho 24 giờ (dùng khi dự đoán cả ngày, ko truyền giờ cụ thể)
def create_features_for_day(field_id, sport_id, day_of_week, month, price):
    rows = []
    for hour in range(24):
        rows.append({
            'field_id': field_id,
            'sport_id': sport_id,
            'day_of_week': day_of_week,
            'hour': hour,
            'month': month,
            'price': price
        })
    return pd.DataFrame(rows)
