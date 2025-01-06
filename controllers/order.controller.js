import axios from "axios";
import { API_URLS, BASE_URL } from "../config.js";
export const getOrders = async (req, res) => {
    const { fromDate, toDate, expand, limit } = req.query;
    let orders = [];
    let GET_ORDERS_URL = `${BASE_URL}${API_URLS.GET_ORDERS}`.replace('mid', req.params.mid)
    if(fromDate && toDate){
        // const fromTime = new Date(fromDate).getTime();
        const toTime = new Date(toDate).getTime();
        GET_ORDERS_URL = `${GET_ORDERS_URL}?filter=createdTime<${toTime}&`
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
    if(fromDate && toDate) {
        const fromTime = new Date(fromDate).getTime();
        const toTime = new Date(toDate).getTime();
       // console.log("fromDate", fromTime , toTime);
        orders = result.data.elements.filter(order => order.createdTime >= fromTime && order.createdTime <= toTime);
    } else {
        orders = result.data.elements;
    }
    const transformOrderData = (order) => ({
        type: order.payType,
        date: new Date(order.createdTime).toISOString(),
        receiptNumber: order.id,
        receiptState: order.state,
        itemName: order?.lineItems?.elements?.[0]?.name || '',
        price: order?.lineItems?.elements?.[0]?.price || '',
        receiptAmount: order.total ? (order.total/100).toFixed(2) : '',
        customerId: order.customers?.elements?.[0]?.id || null,
        employeeId: order.employee?.id || null,
        orderTypeId: order?.orderType?.id || '',
        payments: order.payments ? order.payments.elements.map((payment) => {
            return {
                amount: payment?.amount,
                paymentMode: payment?.tender?.label || null
            }
            
        }) : undefined,
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