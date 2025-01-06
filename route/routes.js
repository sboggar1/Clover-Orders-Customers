import express from "express";
import { getOrders } from "../controllers/order.controller.js";
import { getCustomers } from "../controllers/customer.controller.js";
import { getPayments } from "../controllers/payment.controller.js";
import { getTenders } from "../controllers/tender.controller.js";
import { getOrderLineItems } from "../controllers/orderLineItems.controller.js";
import { getReport } from "../controllers/report.controller.js";
const router = express.Router();

router.get('/health', (req, res) => {
    const healthCheck = {
        message: 'OK',
        timestamp: Date.now()
    };
    res.status(200).json(healthCheck);
});

router.get('/orders/:mid', (req, res) => {   
    return getOrders(req, res)
});

router.get('/orders/:mid/lineItems/:id', (req, res) => {   
    return getOrderLineItems(req, res)
});

router.get('/customers/:mid', (req, res) => {   
    return getCustomers(req, res)
});

router.get('/orders/:mid/payments/:id', (req, res) => {   
    return getPayments(req, res)
});

router.get('/tenders/:mid', (req, res) => {   
    return getTenders(req, res)
});

router.get('/report/:mid', (req,res) => {
    return getReport(req,res)
});
export default router;