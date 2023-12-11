const appUrl = process.env.APP_URL

export function generatePurchaseConfirmationEmailForBuyer(userData, productData) {
    return `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fff;">
        <h2 style="color: #333; text-align: center;">Thank You for Your Purchase</h2>
        <p style="font-size: 16px; color: #666; text-align: center;">Dear ${userData.userName || 'Customer'},</p>
        <p style="font-size: 16px; color: #666; text-align: center;">Thank you for your purchase! Your product has been successfully bought.</p>
        <p style="font-size: 16px; color: #666; text-align: center;">Product: ${productData.title}</p>
        <p style="font-size: 16px; color: #666; text-align: center;">Price: ${productData.price}</p>
        <p style="font-size: 16px; color: #666; text-align: center;">Product link: <a href="${generateDynamicLink(productData)}" style="color: #007BFF; text-decoration: none;">Download Product</a></p>
        <p style="font-size: 16px; color: #666; text-align: center;">If you have any questions or concerns, feel free to contact us.</p>
        <p style="font-size: 16px; color: #666; text-align: center;">Thank you for choosing Kalyke3D!</p>
      </div>
    `;
  }
  

export function generatePurchaseConfirmationEmailForSeller(buyerData, productData) {
  return `
  <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fff;">
  <h2 style="color: #333; text-align: center;">Product Sold Notification</h2>
  <p style="font-size: 16px; color: #666; text-align: center;">Dear Seller,</p>
  <p style="font-size: 16px; color: #666; text-align: center;">Great news! Your product has been successfully bought by ${buyerData.userName || 'a customer'}.</p>
  <p style="font-size: 16px; color: #666; text-align: center;">Sold Product: ${productData.title}</p>
  <p style="font-size: 16px; color: #666; text-align: center;">Buyer: ${buyerData.userName || 'Customer'}</p>
  <p style="font-size: 16px; color: #666; text-align: center;">Contact the buyer if needed. Here are the details:</p>
  <p style="font-size: 16px; color: #666; text-align: center;">Buyer Email: ${buyerData.email}</p>
  <p style="font-size: 16px; color: #666; text-align: center;">Transaction Amount: ${productData.price} USD</p>
  <p style="font-size: 16px; color: #666; text-align: center;">Product link: <a href="${generateDynamicLink(productData)}" style="color: #007BFF; text-decoration: none;">View Product</a></p>
</div>

  `;
}

function generateDynamicLink(productData) {
    return `${appUrl}/products/${productData._id}`; 
}