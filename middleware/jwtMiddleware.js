const jwt = require('jsonwebtoken');

module.exports.verifiedEmailToken = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.verifiedemailtoken &&
      req.headers.verifiedemailtoken.startsWith('Bearer')
    ) {
      // eslint-disable-next-line prefer-destructuring
      token = req.headers.verifiedemailtoken.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Verified Email Token not provided',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res
            .status(401)
            .json({ status: 'fail', error: 'Token expired' });
          // eslint-disable-next-line no-else-return
        } else if (err.name === 'JsonWebTokenError') {
          return res
            .status(401)
            .json({ status: 'fail', error: 'Invalid token' });
        }
      }

      // Token is valid; you can access the decoded payload as decoded
      req.emailFromToken = decoded.email;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.authToken = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authtoken && req.headers.authtoken.startsWith('Bearer')) {
      // eslint-disable-next-line prefer-destructuring
      token = req.headers.authtoken.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Auth Token not provided',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res
            .status(401)
            .json({ status: 'fail', error: 'Token expired' });
          // eslint-disable-next-line no-else-return
        } else if (err.name === 'JsonWebTokenError') {
          return res
            .status(401)
            .json({ status: 'fail', error: 'Invalid token' });
        }
      }

      // Token is valid; you can access the decoded payload as decoded
      req.adminID = decoded._id;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
