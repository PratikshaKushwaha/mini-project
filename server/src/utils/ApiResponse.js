/**
 * @class ApiResponse
 * @description Standardized successful API response envelope.
 * Ensures all responses have a predictable shape for client ingestion.
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
