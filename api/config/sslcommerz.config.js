import dotenv from "dotenv";
dotenv.config();

const sslcommerzConfig = {
  store_id: process.env.SSLCOMMERZ_STORE_ID || "testbox",
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD || "qwerty",
  is_live: process.env.SSLCOMMERZ_IS_LIVE === "true",
  currency: "BDT",
  success_url: process.env.SSLCOMMERZ_SUCCESS_URL || "http://localhost:3000/api/sslcommerz/success",
  fail_url: process.env.SSLCOMMERZ_FAIL_URL || "http://localhost:3000/api/sslcommerz/fail",
  cancel_url: process.env.SSLCOMMERZ_CANCEL_URL || "http://localhost:3000/api/sslcommerz/cancel",
  ipn_url: process.env.SSLCOMMERZ_IPN_URL || "http://localhost:3000/api/sslcommerz/ipn",
};

export default sslcommerzConfig;
