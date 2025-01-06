import axios from "axios";
import { API_URLS, BASE_URL } from "../config.js";
export const getOrderLineItems = async (req, res) => {
    //const { fromDate, toDate } = req.query;
    let orders = [];
    const GET_ORDER_LINEITEMS_URL = `${BASE_URL}${API_URLS.GET_ORDER_LINEITEMS}`.replace('mid', req.params.mid).replace('orderId', req.params.id);
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ error: "Authorization token is missing" });
    }
    // console.log("getOrderURL:",GET_ORDERS_URL);
    // console.log("token:", token);
    const result = await axios.get(GET_ORDER_LINEITEMS_URL, {
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Accept': "application/json"
        }
    });
    const lineItems = result.data.elements;
    const transformLineItemData = (lineItem) => ({
        name: lineItem.name,
        price: lineItem.price
    });
    const transformedData = lineItems.map(transformLineItemData);
    res.status(200).send({transformedData});
    
}