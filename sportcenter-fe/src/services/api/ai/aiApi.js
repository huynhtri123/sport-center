const aiApi = {
    async bookingPredicttion(request) {
        try {
            const url = 'http://127.0.0.1:5000/predict';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            const result = await response.json();
            //console.log(result);
            return result; // mảng 24 số xác suất
        } catch (err) {
            console.error(err);
        }
    },
};

export default aiApi;
