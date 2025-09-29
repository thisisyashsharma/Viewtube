import { ApiError } from "../utils/ApiError.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import { newUser } from "../models/account.model.js";
import { getAdminOrNull } from "../firebase/admin.init.js";                 //EU7u1.p1.a1.1ln  - Auth toggle firebase/mongo - safe if missing envs

export const verifyJWT = asyncHandler(async (req, res, next) => {
  
  //EU7u1.p1.a2.52ln   - Auth toggle firebase/mongo - logic of toggle in auto/firebase/mongo
  // ---- decide mode once, prefer Firebase if available when in "auto"
  const mode = (process.env.AUTH_PROVIDER || "auto").toLowerCase();
  let adminApp = null;
  try {
    adminApp = getAdminOrNull?.() || null;
  } catch {
    adminApp = null;
  }
  const canUseFirebase = !!adminApp && (mode === "firebase" || mode === "auto");

  // Try Firebase first (only if available and client sent Bearer token)
  if (canUseFirebase) {
    const authz = req.header("Authorization") || "";
    const idToken = authz.startsWith("Bearer ") ? authz.slice(7) : null;

    if (idToken) {
      try {
        const decoded = await adminApp.auth().verifyIdToken(idToken);

        // Map by email (no schema change). If missing email (e.g., phone/anon), fall back.
        const email = decoded.email;
        if (!email) throw new Error("Email not present on Firebase token");

        // Find or create a minimal Mongo user so controllers keep working with req.user._id
        let user = await newUser
          .findOne({ email })
          .select("-password -refreshToken");

        if (!user) {
          user = await newUser.create({
            name:
              decoded.name ||
              (email ? email.split("@")[0] : `user_${decoded.uid.slice(0, 6)}`),
            email,
            // never used; just to satisfy schema if required
            password: Math.random().toString(36).slice(2),
            avatar:
              decoded.picture ||
              "https://res.cloudinary.com/drr9bsrar/image/upload/v1716498256/egt2sufg3qzyn1ofws9t.jpg",
          });
          // remove sensitive fields on the object we attach
          user = await newUser
            .findById(user._id)
            .select("-password -refreshToken");
        }

        req.user = user;

        res.setHeader("x-auth-provider", "firebase");            //EU7u1.p10.a1.1ln - Auth toggle firebase/mongo - res. with header
        
        return next();
      } catch (_e) {
        if (mode !== "firebase") {
        } else {
          throw new ApiError(401, "Invalid Firebase ID token");
        }
      }
    } else if (mode === "firebase") {
      throw new ApiError(401, "Missing Firebase ID token");
    }
  }
  
  try {
    const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await newUser
    .findById(decodedToken?._id)
    .select("-password -refreshToken");
    
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    
    req.user = user;
    res.setHeader("x-auth-provider", "mongodb");            //EU7u1.p10.a2.1ln - Auth toggle firebase/mongo - res. with header  for mongo
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
