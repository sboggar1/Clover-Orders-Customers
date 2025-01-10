import axios from "axios";
import { API_URLS, BASE_URL } from "../config.js";
import moment from "moment-timezone";

const timezone = "America/New_York";
const dateformat = "YYYY-MM-DD hh:mm:ss a z";

export const getOrders = async (req, res) => {
    const { fromDate, toDate, expand, limit } = req.query;
    let orders = [];
    let GET_ORDERS_URL = `${BASE_URL}${API_URLS.GET_ORDERS}`.replace('mid', req.params.mid)
    if(fromDate && toDate){
        const fromTime = new Date(fromDate).getTime();
        const toTime = new Date(toDate).getTime();
        GET_ORDERS_URL = `${GET_ORDERS_URL}?filter=clientCreatedTime<${toTime}&filter=clientCreatedTime>=${fromTime}&filter=state!=open&`
        if(limit){
            GET_ORDERS_URL = `${GET_ORDERS_URL}limit=${limit}&`
        }
    }
    if(expand){
        GET_ORDERS_URL = `${GET_ORDERS_URL}expand=${expand}`;
    }
    const token = req.headers.authorization;
    if (!token) {
        if (res) {
            return res.status(401).send({ error: "Authorization token is missing" });   
        } else {
            return "Authorization token is missing";
        }
    }
    console.log("Orders URL", GET_ORDERS_URL);
    const result = await axios.get(GET_ORDERS_URL, {
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Accept': "application/json"
        }
    });
    // console.log("result",result);
    // if(fromDate && toDate) {
    //     const fromTime = new Date(fromDate).getTime();
    //     const toTime = new Date(toDate).getTime();
    //     orders = result.data.elements.filter(order => order.clientCreatedTime >= fromTime && order.clientCreatedTime <= toTime);
    // } else {
    //     orders = result.data.elements;
    // }
    orders = result.data.elements;
    const transformOrderData = (order) => ({
        type: order.payType,
        date: moment(order.createdTime).tz(timezone).format(dateformat),
        receiptNumber: order.id,
        receiptState: order.state,
        itemElements: order?.lineItems?.elements || [],
        receiptAmount: order.total ? (order.total/100).toFixed(2) : '',
        customerId: order.customers?.elements?.[0]?.id || null,
        employeeId: order.employee?.id || null,
        orderTypeId: order?.orderType?.id || '',
        payments: (order.payments?.elements || []).map((payment) => {
            return {
                amount: payment?.amount,
                paymentMode: payment?.tender?.label || null
            }
            
        }),
        paymentMode: order.payments?.elements?.[0]?.tender?.label || '',
        // ...order
    });
    
    const transformedData = orders.map(transformOrderData);
    if (res) {
        res.status(200).send({transformedData});
    } else {
        return transformedData
    }
    
}