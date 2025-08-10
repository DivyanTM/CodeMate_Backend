export class ResponseBody {
    constructor(status, message, data = null) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    static success(message, data = null) {
        return new ResponseBody(true, message, data);
    }

    static error(message, data = null) {
        return new ResponseBody(false, message, data);
    }
}