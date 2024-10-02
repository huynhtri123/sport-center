import sportApi from "../../services/api/sportApi";

function Home() {
    const data = {
        sportName: "Footbal",
        description: "Bóng đá là môn thể thao vua",
        imageUrl: "https://vff.org.vn/uploads/images/fifa-women-2015.jpg",
    };
    const handleClick = async () => {
        try {
            const response = await sportApi.create(data);
            console.log(response);
        } catch (error) {
            // Thông báo lỗi đã được xử lý trong axiosClient
            // Bạn có thể thêm các thông báo khác ở đây nếu cần
            console.log("Tạo sport không thành công: ", error);
        }
    };
    return (
        <div>
            <button onClick={handleClick}>Create sport api</button>
        </div>
    );
}

export default Home;
