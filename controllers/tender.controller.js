import axios from "axios";
import { API_URLS, BASE_URL } from "../config.js";
export const getTenders = async (req, res) => {
    const GET_TENDERS_URL = `${BASE_URL}${API_URLS.GET_TENDERS}`.replace('mid', req.params.mid);
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ error: "Authorization token is missing" });
    }
    const result = await axios.get(GET_TENDERS_URL, {
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Accept': "application/json"
        }
    });
    const tenders = result.data.elements;
    // console.log("paymentResult",tenders);
    const transformPaymentData = (tender) => ({
        tenderId: tender.id,
        paymentType: tender.label
    });
    const transformedData = tenders.map(transformPaymentData);
    res.status(200).send({transformedData});
}