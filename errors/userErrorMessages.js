const userErrorMessages = {
    400: "Email or username is missing or are incorrect.",
    401: "Unauthorized: Authentication is required to access this resource. Please provide valid credentials.",
    403: "Forbidden: You do not have permission to access this resource. Please contact the administrator for access.",
    403 : "Username or Email Already Exist.",
    404 : "User not found.",
};

export const userSuccessMessages = {
    200: "Signin Successfull.",
    201: "User Successfully created.",
    204: "No Content: The request has been successfully processed, and there is no additional content to send in the response.",
};

export const getUserErrorMessage = (code) => {
    let message = userErrorMessages[code];
    return message ?? userErrorMessages;
};

export const getUserSuccessMessage = (code) => {
    let message = userSuccessMessages[code];
    return message ?? userSuccessMessages; 
}