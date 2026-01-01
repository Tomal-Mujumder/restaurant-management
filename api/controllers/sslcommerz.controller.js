import SSLCommerzPayment from "sslcommerz-lts";
import Payment from "../models/Payment.model.js";
import sslcommerzConfig from "../config/sslcommerz.config.js";

// Initialize Payment
export const initPayment = async (req, res, next) => {
  try {
    const { userId, cartItems, totalPrice } = req.body;

    if (!userId || !cartItems || cartItems.length === 0 || !totalPrice) {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    // Generate unique transaction ID
    const transactionId = `BH${Date.now()}${userId.substring(0, 4)}`;
    
    // Generate token number
    const tokenNumber = Math.floor(Math.random() * 1000) + 1;

    // Create a pending payment record in the database
    // This allows the session to persist even if the server restarts
    const newPayment = new Payment({
      userId,
      cartItems,
      totalPrice, // Save directly in BDT (no conversion needed as per requirement)
      paymentInfo: {
        cardType: "SSLCommerz-Pending",
        cardName: "Pending",
        cardNumber: transactionId, // Use this to lookup the transaction later
        expirationDate: new Date().toISOString(),
        securityCode: "Pending",
      },
      tokenNumber,
      isChecked: false,
    });

    await newPayment.save();

    const data = {
      total_amount: totalPrice, // Use total price directly (BDT)
      currency: sslcommerzConfig.currency, // BDT
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
        // If init failed, delete the pending payment
        Payment.findOneAndDelete({ "paymentInfo.cardNumber": transactionId }).exec();
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

    // Find the pending payment by transaction ID (stored in cardNumber)
    const pendingPayment = await Payment.findOne({ "paymentInfo.cardNumber": tran_id });

    if (!pendingPayment) {
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
        
        // Update the payment record to mark it as successful
        // We update the existing record instead of creating a new one
        await Payment.findByIdAndUpdate(pendingPayment._id, {
            $set: {
                "paymentInfo.cardType": "SSLCommerz",
                "paymentInfo.cardName": "Online Payment",
                "paymentInfo.securityCode": "Gateway Payment",
                // You can also save other info from 'data' here if needed
            }
        });

        // Redirect to success page
        res.redirect(`http://localhost:5173/payment-receipt?token=${pendingPayment.tokenNumber}&method=sslcommerz`);
      } else {
        // Validation failed, delete the pending payment
        await Payment.findByIdAndDelete(pendingPayment._id);
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

    // Delete the pending payment
    await Payment.findOneAndDelete({ "paymentInfo.cardNumber": tran_id });

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

    // Delete the pending payment
    await Payment.findOneAndDelete({ "paymentInfo.cardNumber": tran_id });

    res.redirect(`http://localhost:5173/shoppingCart?cancelled=true`);
  } catch (error) {
    next(error);
  }
};

// IPN Listener
export const paymentIPN = async (req, res, next) => {
  try {
    console.log("IPN Notification:", req.body);
    // Handle IPN: Update payment status if needed, verify transaction, etc.
    // For now, just acknowledge.
    res.status(200).send("IPN Received");
  } catch (error) {
    next(error);
  }
};
