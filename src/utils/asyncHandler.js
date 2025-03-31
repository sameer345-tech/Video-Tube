const asyncHandler = (fn) =>  async(req, res, next) => {
    //    await fn(req, res, next)

    try {
     return   await fn(req, res, next)
    } catch (error) {
        if(!error) return false
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
        next(error);
    }
};

export default asyncHandler