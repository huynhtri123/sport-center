-   vấn đề của AI tuần trước: data cần cả nhãn dương (được book) và nhãn âm (ko được book), nhưng khi lấy dữ liệu thực tế trong project để train thì phát hiện là ta không thể lấy nhãn âm được, vì trong db chỉ lưu những booking (những trường hợp được đặt), còn nhãn âm đâu có đâu mà lấy.

-> đã thử những model khác ngoài random forest, những model mà chỉ cần nhãn dương, ko yêu cầu nhãn âm, thì dự đoán ra kết quả tào lao nên thôi
-> nghĩ ý tưởng làm AI khác, nhưng với data mình có thì ý tưởng nào cũng vậy thôi.
-> giải pháp: file csv chỉ cần nhãn dương, tự sinh nhãn âm với tỉ lệ 1:1, bằng cách là random và lọc bỏ những trường hợp trùng với nhãn dương, đảm bảo nhãn âm không trùng với nhãn dương. Ví dụ file data có 1000 dòng nhãn dương, thì ta code tự sinh ra thêm 1000 dòng nhãn âm để train cho model (những nhãn âm đảm bảo không trùng với nhãn dương).
Nhãn âm được sinh ra này thực ra chính là những trường hợp không có trong booking, nghĩa là 1 số lượng ít những trường hợp ko được book trong vô số trường hợp ko được book, nên nó đúng là trường hợp âm thật, nên ok.

-   chuẩn bị data 10.000 dòng (export file csv từ db), book theo kế hoạch cụ thể như là giờ cao điểm, cuối tuần, … thì book nhiều hơn, nên data khá hợp lý.

-   vẽ các biểu đồ thống kê data để dễ kiểm tra

Kết quả là thấy dự đoán khá đúng nên chắc ok, ví dụ ngày trong tuần thì nó dự đoán tỉ lệ thấp hơn, ngày cuối tuần dự đoán tỉ lệ cao nhiều hơn.
