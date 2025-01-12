import axios from "axios";
import fs from 'fs';
import path from "path";
import { getOrders } from "../controllers/order.controller.js";
import { getCustomers, getCustomersCSV } from "../controllers/customer.controller.js";
import ExcelJS from 'exceljs';
export const getReport = async (req, res) => {
    const fileName = 'Orders.xlsx';
    const {fromDate, toDate, expand,limit} = req.query;
    const getOrdersRequestBody = {
        query: {
            fromDate,
            toDate,
            expand,
            limit
        },
        params: {
            mid: req.params.mid
        },
        headers: {
            authorization: req.headers.authorization
        }
    }

    const getCustomersRequestBody = {
        // query: {
        //     expand:'emailAddresses,addresses,phoneNumbers',
        //     limit: '1000'
        // },
        params: {
            mid: req.params.mid
        },
        headers: {
            authorization: req.headers.authorization
        }
    };

    let allOrders = await getOrders(getOrdersRequestBody)
    let allCustomers = await getCustomersCSV(getCustomersRequestBody);

    let allOrdersAndCustomerDetails = allOrders.map(orderDetails => ({
        ...orderDetails,
        ...(allCustomers[orderDetails.customerId] || {}),
        // customer: allCustomers[orderDetails.customerId] ? allCustomers[orderDetails.customerId] : {}
    }))

    const transactionFileExists = fs.existsSync(fileName);
    
    if (!transactionFileExists) {
        const newWorkbook = new ExcelJS.Workbook();
        const newWorksheet = newWorkbook.addWorksheet("Transactions");
        await newWorkbook.xlsx.writeFile(fileName);
    }

    // creating an excel workbook file
    const workbook = new ExcelJS.Workbook();
    const transactionWorkbook = await workbook.xlsx.readFile(fileName)
    const worksheet = transactionWorkbook.getWorksheet('Transactions');

    // Add column headers - [To-Do: add all column details as needed]
    worksheet.columns = [
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Date', key: 'date', width: 10 },
        { header: 'Time', key: 'time', width: 10 },
        { header: 'Receipt Number', key: 'receiptNumber', width: 10 },
        { header: 'Receipt State', key: 'receiptState', width: 10},
        { header: 'Payment Mode', key: 'paymentMode', width: 20 },
        { header: 'Item Name', key: 'itemName', width: 20 },
        { header: 'Price', key: 'itemPrice', width: 20 },
        { header: 'Receipt Amount', key: 'receiptAmount', width: 20 },
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'Email', key: 'emailAddress', width: 20 },
        { header: 'Phone Numbers', key: 'phoneNumbers', width: 20 },
        { header: 'Address', key: 'address', width: 20 },
        { header: 'city', key: 'city', width: 20 },
        { header: 'state', key: 'state', width: 20 },
        { header: 'zip', key: 'zip', width: 20 },
    ];

    // Add rows
    allOrdersAndCustomerDetails.forEach(data => {
        // worksheet.addRow(data);
        data.itemElements.forEach(itemElementData => {
            if(!itemElementData.refunded)
                worksheet.addRow({
                    ...data,
                    itemName: itemElementData.name?.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    itemPrice: ((itemElementData.modifications?.elements[0]?.amount || itemElementData.price)/100).toFixed(2)
                });
            })
        })

    // Save the file
//    const fileName = 'transactionsOutput.xlsx';
//    await workbook.xlsx.writeFile(fileName);
    await workbook.xlsx.writeFile(fileName);
    res.status(200).send(allOrdersAndCustomerDetails);
}