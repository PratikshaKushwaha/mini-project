import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";

export const configurePassport = (passport) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    };

    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                // Fetch user
                const user = await User.findById(jwt_payload._id).select("-password").lean();

                if (!user) {
                    return done(null, false);
                }

                // Session validation (Optional but secure)
                if (jwt_payload.sessionId) {
                    const session = await Session.findById(jwt_payload.sessionId).lean();
                    if (!session || session.revoked) {
                        return done(null, false, { message: "Session invalid or revoked" });
                    }
                }

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        })
    );
};
