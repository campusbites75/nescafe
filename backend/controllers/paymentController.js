import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================= CREATE ORDER + RAZORPAY ORDER ================= */
const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user?.id; // 🔥 IMPORTANT

    const { amount, items, address } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // ✅ Create DB order FIRST
    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      address,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
      status: "PENDING"
    });

    // ✅ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: newOrder._id.toString()
    });

    res.json({
      success: true,
      razorpayOrder,
      orderId: newOrder._id // 🔥 send to frontend
    });

  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ================= VERIFY PAYMENT ================= */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed"
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    // ✅ UPDATE STOCK
    for (const item of order.items) {
      const food = await foodModel.findById(item._id);

      if (!food) continue;

      if (food.quantity < item.quantity) {
        return res.json({
          success: false,
          message: `${food.name} out of stock`
        });
      }

      food.quantity -= item.quantity;
      await food.save();
    }

    // ✅ UPDATE ORDER STATUS
    order.paymentStatus = "PAID";
    order.status = "CONFIRMED";
    order.payment = true;

    await order.save();

    res.json({
      success: true,
      orderId: order._id
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export { createRazorpayOrder, verifyPayment };
