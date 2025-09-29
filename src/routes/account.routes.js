import { Router } from "express";

//EU6u3.p3.a1.2wd - Subscribe feature - imported toggleSubscribe, getSubscribeStatus
//EU6u4.p2.a1.1wd -  Subscribed Channels: imported subscribed channels page 
import { deleteAccount, registerUser ,  login , updateAccount , logoutUser , refreshAccessToken , getUserById , GetWatchHistory , addToWatchHistory, toggleSubscribe, getSubscribeStatus,  getMySubscriptions} from "../controllers/account.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/signup").post(registerUser)
router.route("/login").post(login)
router.route("/logout").post(verifyJWT ,  logoutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/delete/:id").delete(deleteAccount)
router.route("/update/:id").put(upload.single("avatar") , updateAccount );
router.route("/userData/:id").get(getUserById)
router.route("/history").get(verifyJWT , GetWatchHistory)
router.route("/addToHistory/:id").put(verifyJWT , addToWatchHistory)


//EU6u3.p3.a2.2ln - Subscribe feature - routed both features 
router.put("/subscribe/:channelId", verifyJWT, toggleSubscribe)
router.get("/subscribe/status/:channelId", verifyJWT, getSubscribeStatus)

//EU6u4.p2.a2.1l -  Subscribed Channels - routed for subscribed page
router.get("/subscriptions", verifyJWT, getMySubscriptions);

//EU7u1.p11.a1.3ln - Auth toggle firebase/mongo
router.get("/whoami", verifyJWT, (req,res)=>{
  res.json({ provider: res.getHeader("x-auth-provider"), user: req.user });
});


export default router