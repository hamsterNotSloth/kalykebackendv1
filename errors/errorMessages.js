const errorMessages = {
  400: "Bad Request: The server could not understand the request due to invalid syntax or missing parameters.",
  401: "Unauthorized: Authentication is required to access this resource. Please provide valid credentials.",
  403: "Forbidden: You do not have permission to access this resource. Please contact the administrator for access.",
  404: "Not Found: The requested resource could not be found on the server. Please check the URL and try again.",
  500: "Internal Server Error: An unexpected error occurred on the server while processing your request. Please try again later or contact the server administrator for assistance.",
  502: "Bad Gateway: The server received an invalid response from an upstream server while acting as a gateway or proxy.",
  503: "Service Unavailable: The server is currently unable to handle the request due to temporary overloading or maintenance of the server. Please try again later.",
  504: "Gateway Timeout: The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server or some other auxiliary server it needed to access in order to complete the request.",
};

export const successMessages = {
  200: "OK: The request has been successfully processed.",
  201: "Created: The request has been successfully processed, and a new resource has been created.",
  204: "No Content: The request has been successfully processed, and there is no additional content to send in the response.",
};

export const getErrorMessage = (code, error) => {
  let message = errorMessages[code];
  return message ?? error;
};
