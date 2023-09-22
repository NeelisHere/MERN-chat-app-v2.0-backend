class ErrorHandler extends Error{
    constructor(message, status_code){
        super(message)
        this.status_code = status_code
    }
}

const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || 'Internal Server Error'
    err.status_code = err.status_code || 500
    return res.status(err.status_code).json({
        success: false,
        message: err.message
    })
}

module.exports = { ErrorHandler, errorMiddleware }
