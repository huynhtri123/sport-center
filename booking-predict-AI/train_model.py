import pandas as pd
from sklearn.model_selection import train_test_split
from app.model_utils import BookingPredictor, preprocess_training_data

def train_and_save_model():
    df = pd.read_csv('data/bookings_data.csv')
    df_processed = preprocess_training_data(df)

    X = df_processed.drop('was_booked', axis=1)
    y = df_processed['was_booked']

    # chia 80% để train, 20% để test 
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    predictor = BookingPredictor()
    predictor.train(X_train, y_train)
    predictor.save_model('app/booking_model.pkl')

    print(f"✅ Model trained and saved. Accuracy: {predictor.model.score(X_test, y_test):.4f}")

if __name__ == '__main__':
    train_and_save_model()
