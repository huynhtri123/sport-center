import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from model.model import BookingPredictor, preprocess_training_data, generate_negative_samples
from app.utils import plot_booking_data_statistics, plot_feature_importance


def train_and_save_model():
    model_path = 'model/booking_model.pkl'  # nơi lưu model
    output_dir = 'output_plots'             # nơi lưu các biểu đồ

    df_raw = pd.read_csv('data/bookings_data.csv')

    # Gán nhãn dương
    df_raw['was_booked'] = 1

    # Tạo dữ liệu âm
    df_neg = generate_negative_samples(df_raw, n_neg_per_pos=1)

    # in ra để kiểm tra
    print("Số mẫu dương:", len(df_raw))
    print("Số mẫu âm:", len(df_neg))
    print("Tỉ lệ âm/dương:", len(df_neg) / len(df_raw))

    # Gộp dương + âm
    df_full = pd.concat([df_raw, df_neg], ignore_index=True)

    # Tiền xử lý
    df_processed = preprocess_training_data(df_full)

    X = df_processed.drop('was_booked', axis=1)
    y = df_processed['was_booked']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    predictor = BookingPredictor()
    predictor.train(X_train, y_train)
    predictor.save_model(model_path)

    print("[INFO] Thống kê nhãn dương theo ngày:")
    print(df_raw['day_of_week'].value_counts().sort_index())

    print("\n[INFO] Thống kê nhãn âm theo ngày:")
    print(df_neg['day_of_week'].value_counts().sort_index())


    acc = predictor.model.score(X_test, y_test)
    print(f"[INFO] Model trained. Accuracy: {acc:.4f}")
    # Vẽ biểu đồ thống kê dữ liệu
    #plot_booking_data_statistics(df_processed, output_dir)
    # Vẽ biểu đồ tầm quan trọng của các đặc trưng
    #plot_feature_importance(predictor.model, predictor.feature_names, top_n=20, output_dir="output_plots")

    return acc

if __name__ == '__main__':
    train_and_save_model()