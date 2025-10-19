
import jwt from "jsonwebtoken";

export function verifyAuth(req: Request) {


// helper function to get verify the actual user through his auth token id 
// and return his actual user id used as string to main api post fucntion   
const authHeader = req.headers.get("authorization");

if (!authHeader) {
  throw new Error("No token");
}
const token = authHeader.split(" ")[1];

const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

return decoded.userId;
  
}