/* Checkout entry point kept separate from cart state and rendering. */
(function () {
  function startCheckout() {
    const cart = window.NellaiCart;
    if (!cart || !cart.getItems || !cart.getItems().length) return;
    window.location.href = "checkout.html";
  }

  window.NellaiCheckout = { start: startCheckout };
})();
