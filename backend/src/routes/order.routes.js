const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      discount,
      total
    } = req.body;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      discount,
      total,
      // For COD, status starts as 'to-ship' (no payment needed)
      // For e-wallet, status starts as 'to-pay' until payment confirmed
      orderStatus: paymentMethod === 'cod' ? 'to-ship' : 'to-pay',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { user: req.user._id };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name images brand');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [
        { _id: req.params.id, user: req.user._id },
        { orderId: req.params.id, user: req.user._id }
      ]
    }).populate('items.productId', 'name images brand');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const order = await Order.findOne({
      $or: [
        { _id: req.params.id, user: req.user._id },
        { orderId: req.params.id, user: req.user._id }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'to-pay': ['to-ship', 'cancelled'],
      'to-ship': ['to-receive', 'cancelled'],
      'to-receive': ['completed', 'return'],
      'completed': ['return'],
      'return': [],
      'cancelled': []
    };

    if (!validTransitions[order.orderStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.orderStatus} to ${status}`
      });
    }

    order.orderStatus = status;
    
    if (status === 'cancelled') {
      order.cancelReason = reason;
    } else if (status === 'return') {
      order.returnReason = reason;
    } else if (status === 'to-receive') {
      order.shippedAt = new Date();
    } else if (status === 'completed') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Mark order as paid (for e-wallet payments)
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [
        { _id: req.params.id, user: req.user._id },
        { orderId: req.params.id, user: req.user._id }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'to-pay') {
      return res.status(400).json({
        success: false,
        message: 'Order is not awaiting payment'
      });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'to-ship';
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Pay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

module.exports = router;
