# Dual purchase actions and fast checkout

## What will change
- Replace the secondary “View”/“Checkout” actions with a prominent “Order Now” button on every product card and product detail page.
- Keep “Add to Cart” beside it, with both actions remaining clear and full-width where needed on small screens.
- Add a reusable quick-order modal opened by “Order Now” with the selected product, strap, size, quantity, customer name, phone, delivery address, and payment method.
- Show free delivery (৳0), a live total, validation feedback, and a confirmation state without altering the shopper’s existing cart.

## Technical details
- Add a quick-order context/provider and modal at the shared site level so all product grids and detail pages use one consistent flow.
- Use the current product defaults on cards and the shopper’s selected variants on the product detail page.
- Reuse the existing dark/crimson design tokens and dialog/button components; add only focused styling where required.
- Verify every listing location, product detail flow, mobile layout, form validation, successful order confirmation, and current build/runtime logs.
