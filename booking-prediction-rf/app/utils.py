import os
import pandas as pd
import matplotlib.pyplot as plt

# vẽ biểu đồ thống kê độ tác động đến kết quả của từng trường
def plot_feature_importance(model, feature_names, top_n=20, output_dir="output_plots"):
    # Kiểm tra và tạo thư mục lưu file nếu chưa có
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    importances = model.feature_importances_
    feat_imp = pd.Series(importances, index=feature_names)
    
    # Vẽ biểu đồ
    feat_imp.sort_values(ascending=True).tail(top_n).plot(kind='barh', figsize=(10, 8), color='skyblue')
    plt.title("Top Feature Importances")
    plt.xlabel("Importance")
    plt.tight_layout()
    
    # Lưu biểu đồ vào file
    plt.savefig(f"{output_dir}/feature_importance.png")  # Lưu thành file .png
    plt.close()  


# Hàm vẽ biểu đồ thống kê dữ liệu
def plot_booking_data_statistics(df, output_dir="output_plots"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Lọc dữ liệu chỉ lấy các booking thành công (nhãn dương)
    df_positive = df[df['was_booked'] == 1]

    # 1. Số lượng booking theo ngày trong tuần (day_of_week)
    total_bookings_day_of_week = df_positive['day_of_week'].value_counts().sum()
    
    plt.figure(figsize=(8, 6))
    df_positive['day_of_week'].value_counts().sort_index().plot(kind='bar', color='skyblue')
    plt.title("Số lượng booking theo ngày trong tuần (nhãn dương)")
    plt.xlabel("Ngày trong tuần (1: Thứ Hai, 7: Chủ Nhật)")
    plt.ylabel("Số lượng booking")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/bookings_by_day_of_week_positive.png")
    plt.close()

    # 2. Số lượng booking theo giờ trong ngày (hour)
    total_bookings_hour = df_positive['hour'].value_counts().sum()
    
    plt.figure(figsize=(8, 6))
    df_positive['hour'].value_counts().sort_index().plot(kind='bar', color='lightcoral')
    plt.title("Số lượng booking theo giờ trong ngày (nhãn dương)")
    plt.xlabel("Giờ trong ngày")
    plt.ylabel("Số lượng booking")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/bookings_by_hour_positive.png")
    plt.close()

    # 3. Số lượng booking theo tháng (month)
    total_bookings_month = df_positive['month'].value_counts().sum()
    
    plt.figure(figsize=(8, 6))
    df_positive['month'].value_counts().sort_index().plot(kind='bar', color='lightgreen')
    plt.title("Số lượng booking theo tháng (nhãn dương)")
    plt.xlabel("Tháng")
    plt.ylabel("Số lượng booking")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/bookings_by_month_positive.png")
    plt.close()

    # 4. Phân phối giá (price)
    total_bookings_price = len(df_positive)
    
    plt.figure(figsize=(8, 6))
    df_positive['price'].plot(kind='hist', bins=50, color='gold', edgecolor='black')
    plt.title("Phân phối giá booking (nhãn dương)")
    plt.xlabel("Giá")
    plt.ylabel("Số lượng booking")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/price_distribution_positive.png")
    plt.close()

    # 5. Tỉ lệ booking thành công và không thành công (was_booked)
    total_bookings_success = df['was_booked'].value_counts().sum()
    
    plt.figure(figsize=(8, 6))
    df['was_booked'].value_counts().plot(kind='pie', autopct='%1.1f%%', startangle=90, colors=['lightblue', 'salmon'])
    plt.title("Tỉ lệ booking thành công và không thành công")
    plt.ylabel('')
    plt.tight_layout()
    plt.savefig(f"{output_dir}/booking_success_rate.png")  # Save as image
    plt.close()  


# Tạo dữ liệu 24 slot cho 1 ngày cụ thể
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