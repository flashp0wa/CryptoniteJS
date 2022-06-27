class OpenOrder {
  constructor(orderId, siblingOrderId, parentOrderId) {
    this.orderId = orderId;
    this.siblingOrderId = siblingOrderId;
    this.parentOrderId = parentOrderId;
  }
}

module.exports = {
  OpenOrder,
};
