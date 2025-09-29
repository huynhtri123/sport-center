// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import SportHome from './SportHome';
// import sportApi from '../../../../services/api/sportApi';

// const DynamicSportHome = () => {
//     const { sportId } = useParams(); // Lấy sportId từ URL params
//     const [sport, setSport] = useState(null); // Trạng thái để lưu trữ dữ liệu sport
//     const [loading, setLoading] = useState(true); // Trạng thái để hiển thị loading

//     useEffect(() => {
//         const getSport = async () => {
//             try {
//                 const response = await sportApi.getById(sportId); // Gọi API lấy sport
//                 setSport(response.data); // Lưu dữ liệu sport vào state
//             } catch (error) {
//                 console.error('Error fetching sport:', error);
//             } finally {
//                 setLoading(false); // Dừng trạng thái loading
//             }
//         };

//         getSport(); // Gọi hàm lấy dữ liệu sport khi component mount
//     }, [sportId]); // Chạy lại khi sportId thay đổi

//     if (loading) {
//         return <p>Loading sport data...</p>; // Hiển thị trạng thái loading
//     }

//     if (!sport) {
//         return <p>Sport not found!</p>; // Hiển thị khi không tìm thấy sport
//     }

//     return (
//         <SportHome
//             sportId={sport.id}
//             sportName={sport.sportName}
//             description={sport.description}
//             linkTo={'/sport/fields'}
//             bannerImage={sport.imageUrl}
//         />
//     );
// };

// export default DynamicSportHome;
