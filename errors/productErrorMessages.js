const productErrorMessages = {
    400: "Something is missing.",
    401: "Unauthorized: Authentication is required to access this resource. Please provide valid credentials.",
    403: "Forbidden: You do not have permission to access this resource. Please contact the administrator for access.",
    403 : "Username or Email Already Exist.",
    404 : "No products exist.",
};

export const productSuccessMessages = {
    200: "Products found.",
    201: "Products Successfully created.",
    204: "No Content: The request has been successfully processed, and there is no additional content to send in the response.",
};

export const getProductErrorMessage = (code) => {
    let message = productErrorMessages[code];
    return message ?? productErrorMessages;
};

export const getProductSuccessMessage = (code) => {
    let message = productSuccessMessages[code];
    return message ?? productSuccessMessages; 
}