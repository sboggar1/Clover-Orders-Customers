import axios from "axios";
import { API_URLS, BASE_URL } from "../config.js";
export const getPayments = async (req, res) => {
    const GET_PAYMENTS_URL = `${BASE_URL}${API_URLS.GET_PAYMENTS}`.replace('mid', req.params.mid).replace('orderId',req.params.id);
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ error: "Authorization token is missing" });
    }
    const result = await axios.get(GET_PAYMENTS_URL, {
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Accept': "application/json"
        }
    });
    const payments = result.data.elements;
   // console.log("paymentResult",payments);
    const transformPaymentData = (payment) => ({
        paymentId: payment.id,
        tenderId: payment.tender?.id || null,
        amount: payment.amount
    });
    const transformedData = payments.map(transformPaymentData);
    res.status(200).send({transformedData});
}