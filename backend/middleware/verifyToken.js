import jwt from 'jsonwebtoken' ;

export const verifyToken = (req , res , next) => {

    // collect the token from the cookie named 'jwt' saved in user's local storage 
    const token = req.cookies.jwt ;
    
    // if no token is provided simply return success as false 
    if(!token) 
        return res.status(401).json({success : false , message : "Unauthorized - no token provided"}) ;

    try {
        // verify the token provided by the user 
        const decoded = jwt.verify(token , process.env.JWT_SECRET) ;

        // if user not found simply return false with the following message
        if(!decoded) 
            return res.status(401).json({success : false , message : "Unauthorized - invalid token provided"}) ;

        // setting the userId in the request object as decoded userId
        req.userId = decoded.userId ;

        // passing the control to the next middleware function
        next() ;

    // handling the error's 
    } catch (error) {

        console.log("Error in verifyToken : " , error) ;
        return res.status(500).json({success : false , message : "Server error" }) ;
    }
}