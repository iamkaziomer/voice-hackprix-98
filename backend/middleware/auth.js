import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', { userId: decoded.userId, role: decoded.role });

      req.userId = decoded.userId;
      req.role = decoded.role || 'user'; // Default to 'user' if no role specified
      req.adminRole = decoded.adminRole; // For admin-specific roles
      req.region = decoded.region; // For region-specific access
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

export default auth;