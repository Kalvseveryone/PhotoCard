import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'memoriesofmutiahaekal_super_secret_jwt_key_2026_xyz!';

export function verifyToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // { userId, username, email }
  } catch (error) {
    return null;
  }
}
