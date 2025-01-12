import axios from "axios";
import { API_URLS, BASE_URL } from "../config.js";

import CSV from "csvtojson";
export const getCustomers = async (req, res) => {
    const { expand } = req.query;
    let customers = [];
    let GET_CUSTOMERS_URL = `${BASE_URL}${API_URLS.GET_CUSTOMERS}`.replace('mid', req.params.mid)
    if(expand){
        GET_CUSTOMERS_URL = `${GET_CUSTOMERS_URL}?expand=${expand}`;
    }
    const token = req.headers.authorization;
    if (!token) {
        if (res) {
            return res.status(401).send({ error: "Authorization token is missing" });
        } else {
            return "Authorization token is missing";
        }
    }
    const result = await axios.get(GET_CUSTOMERS_URL, {
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Accept': "application/json"
        }
    });
    //console.log("result", result);
    customers = result.data.elements;
    //console.log("customers", customers);

    let customersDetails = {};

    const transformCustomerData = (customer) => (
        customersDetails[customer.id] = {
            customerId: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: customer.addresses.elements.length ? customer.addresses.elements[0] : {},
            emailAddress: customer.emailAddresses?.elements?.[0]?.emailAddress || '',
            phoneNumbers: customer.phoneNumbers?.elements?.[0]?.phoneNumber || '',
        }
    );

    customers.forEach(transformCustomerData);
    if (res) {
        res.status(200).send({customersDetails});
    } else {
        return customersDetails;
    }
        //res.status(200).send({transformCustomerData});
}

export const getCustomersCSV = async (req, res) => {
    // const { expand } = req.query;
    let customers = [];
    let GET_CUSTOMERS_URL = `${BASE_URL}${API_URLS.GET_CUSTOMERS_CSV}`.replace('mid', req.params.mid)
    const token = req.headers.authorization;
    if (!token) {
        if (res) {
            return res.status(401).send({ error: "Authorization token is missing" });
        } else {
            return "Authorization token is missing";
        }
    }
    const result = await axios.get(GET_CUSTOMERS_URL, {
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Accept': "application/json"
        }
    });


    const customerArray = await CSV().fromString(result.data);

    //customers = result.data.elements;
    //console.log("customers", customers);

    let customersDetails = {};

    const transformCustomerData = (customer) => (
        customersDetails[customer['Customer ID']] = {
            customerId: customer['Customer ID'] || 'XYKY0ZKBAWW50',
            firstName: customer['First Name']?.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            lastName: customer['Last Name']?.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            address: customer['Address Line 1']?.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            city: customer['City']?.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            state: customer['State / Province']?.toUpperCase(),
            zip: customer["Postal / Zip Code"],
            emailAddress: customer["Email Address"]?.toLowerCase(),
            phoneNumbers: customer["Phone Number"],
        }
    );

    customerArray.forEach(transformCustomerData);
    // if (res) {
    //     res.status(200).send({customersDetails});
    // } else {
    //     return customersDetails;
    // }
    //res.status(200).send({transformCustomerData});
    return customersDetails;
}