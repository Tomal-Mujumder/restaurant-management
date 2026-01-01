import SSLCommerzPayment from "sslcommerz-lts";
import Payment from "../models/Payment.model.js";
import sslcommerzConfig from "../config/sslcommerz.config.js";

// Temporary storage for transaction data (in a real app, use Redis or database with "pending" status)
// Map<transactionId, { userId, cartItems, originalPriceLKR, tokenNumber }>
const transactionStore = new Map();

// Initialize Payment
export const initPayment = async (req, res, next) => {
  try {
    const { userId, cartItems, totalPrice } = req.body;

    if (!userId || !cartItems || cartItems.length === 0 || !totalPrice) {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    // Convert LKR to BDT (1 LKR = 0.50 BDT)
    const amountBDT = totalPrice * 0.5;

    // Generate unique transaction ID
    const transactionId = `BH${Date.now()}${userId.substring(0, 4)}`;
    
    // Generate token number
    const tokenNumber = Math.floor(Math.random() * 1000) + 1;

    // Store transaction data temporarily
    transactionStore.set(transactionId, {
      userId,
      cartItems,
      totalPrice: totalPrice, // Store original LKR price
      tokenNumber,
    });

    const data = {
      total_amount: amountBDT,
      currency: sslcommerzConfig.currency,
      tran_id: transactionId, // use unique tran_id for each api call
      success_url: sslcommerzConfig.success_url,
      fail_url: sslcommerzConfig.fail_url,
      cancel_url: sslcommerzConfig.cancel_url,
      ipn_url: sslcommerzConfig.ipn_url,
      shipping_method: "Courier",
      product_name: "Food Items",
      product_category: "Food",
      product_profile: "general",
      cus_name: "Customer Name", // Should be fetched from user profile if available
      cus_email: "customer@example.com",
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      ship_name: "Customer Name",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(
      sslcommerzConfig.store_id,
      sslcommerzConfig.store_passwd,
      sslcommerzConfig.is_live
    );

    sslcz.init(data).then((apiResponse) => {
      // Redirect the user to payment gateway
      let gatewayUrl = apiResponse.GatewayPageURL;
      if (gatewayUrl) {
        res.status(200).json({ success: true, gatewayUrl, tokenNumber });
      } else {
        res.status(400).json({ success: false, message: "SSLCommerz Session was not successful" });
      }
    });
  } catch (error) {
    next(error);
  }
};

// Payment Success
export const paymentSuccess = async (req, res, next) => {
  try {
    const { tran_id, val_id } = req.body;

    console.log("SSLCommerz Success:", { tran_id, val_id });

    // Retrieve temporary data
    const transactionData = transactionStore.get(tran_id);

    if (!transactionData) {
      return res.redirect(`http://localhost:5173/payment-failed?reason=Session Expired or Invalid Transaction`);
    }

    const sslcz = new SSLCommerzPayment(
      sslcommerzConfig.store_id,
      sslcommerzConfig.store_passwd,
      sslcommerzConfig.is_live
    );

    // Validate transaction
    sslcz.validate({ val_id }).then(async (data) => {
      if (data.status === "VALID") {
        
        // Check for duplicate payment by transaction ID to be safe
        const existingPayment = await Payment.findOne({ "paymentInfo.cardNumber": tran_id });
        if(existingPayment) {
             return res.redirect(`http://localhost:5173/payment-failed?reason=Duplicate Transaction`);
        }

        // Save payment to database
        const newPayment = new Payment({
          userId: transactionData.userId,
          cartItems: transactionData.cartItems,
          totalPrice: transactionData.totalPrice, // Original LKR price
          paymentInfo: {
            cardType: "SSLCommerz",
            cardName: "Online Payment",
            cardNumber: tran_id, // Using transaction ID as card number reference
            expirationDate: new Date().toISOString(),
            securityCode: "Gateway Payment",
          },
          tokenNumber: transactionData.tokenNumber,
          isChecked: false,
        });

        await newPayment.save();

        // Clear temporary data
        transactionStore.delete(tran_id);

        // Redirect to success page
        res.redirect(`http://localhost:5173/payment-receipt?token=${transactionData.tokenNumber}&method=sslcommerz`);
      } else {
        res.redirect(`http://localhost:5173/payment-failed?reason=Validation Failed`);
      }
    });
  } catch (error) {
     console.error("Payment Success Error:", error);
     res.redirect(`http://localhost:5173/payment-failed?reason=Server Error`);
  }
};

// Payment Fail
export const paymentFail = async (req, res, next) => {
  try {
    const { tran_id } = req.body;
    console.log("SSLCommerz Fail:", { tran_id });

    // Clear temporary data
    transactionStore.delete(tran_id);

    res.redirect(`http://localhost:5173/payment-failed?reason=Payment Failed`);
  } catch (error) {
    next(error);
  }
};

// Payment Cancel
export const paymentCancel = async (req, res, next) => {
  try {
    const { tran_id } = req.body;
    console.log("SSLCommerz Cancel:", { tran_id });

    // Clear temporary data
    transactionStore.delete(tran_id);

    res.redirect(`http://localhost:5173/shoppingCart?cancelled=true`);
  } catch (error) {
    next(error);
  }
};

// IPN Listener
export const paymentIPN = async (req, res, next) => {
  try {
    console.log("IPN Notification:", req.body);
    res.status(200).send("IPN Received");
  } catch (error) {
    next(error);
  }
};
