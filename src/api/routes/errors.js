module.exports = {
    bad_request: {
        error: true,
        status: 400,
        message: 'The request was unacceptable, often due to missing a required parameter or passing a parameter of an unexpexted type.'
    },
    unauthorized: {
        error: true,
        status: 401,
        message: 'No valid API key provided.'
    },
    not_found: {
        error: true,
        status: 404,
        message: 'The requested resource does not exist.'
    },
    server_error: {
        error: true,
        status: 500,
        message: 'Internal server error.'
    },
}