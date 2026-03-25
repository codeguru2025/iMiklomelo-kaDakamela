import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { authStorage } from "./storage";
import { Pool } from "pg";

const SUPERUSER_EMAIL = process.env.SUPERUSER_EMAIL || "";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const isProduction = process.env.NODE_ENV === "production";
  let databaseUrl = process.env.DATABASE_URL;
  
  console.log(`[Session Store] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Session Store] Database URL exists: ${!!databaseUrl}`);
  console.log(`[Session Store] Database URL value: ${databaseUrl?.substring(0, 30)}...`);
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  // Apply same SSL fix as db.ts - replace sslmode=require with sslmode=no-verify
  if (databaseUrl.includes('sslmode=require')) {
    databaseUrl = databaseUrl.replace('sslmode=require', 'sslmode=no-verify');
    console.log(`[Session Store] Modified SSL mode from 'require' to 'no-verify'`);
  }
  
  // Create a Pool with SSL configuration for session store
  const sessionPool = new Pool({
    connectionString: databaseUrl,
  });
  
  console.log(`[Session Store] Pool created successfully`);
  
  const sessionStore = new pgStore({
    pool: sessionPool,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || (() => {
      if (process.env.NODE_ENV === "production") {
        throw new Error("SESSION_SECRET environment variable is required in production");
      }
      console.warn("[Session] WARNING: Using default session secret. Set SESSION_SECRET in production!");
      return "dev-only-session-secret-do-not-use-in-production";
    })(),
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (clientID && clientSecret) {
    const callbackURL = `${process.env.APP_URL || "http://localhost:5000"}/api/auth/google/callback`;

    passport.use(
      new GoogleStrategy(
        { clientID, clientSecret, callbackURL },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            console.log("[auth] Google OAuth callback received for profile:", profile.id);
            const email = profile.emails?.[0]?.value || "";
            console.log("[auth] User email:", email);
            
            const isSuperuser = email.toLowerCase() === SUPERUSER_EMAIL.toLowerCase();
            console.log("[auth] Is superuser?", isSuperuser, "(comparing", email.toLowerCase(), "with", SUPERUSER_EMAIL.toLowerCase() + ")");

            // Check if user already exists to preserve their role
            const existingUser = await authStorage.getUserByEmail(email);
            console.log("[auth] Existing user:", existingUser ? "found" : "not found");

            const role = isSuperuser
              ? "superuser"
              : existingUser?.role === "admin" || existingUser?.role === "superuser"
                ? existingUser.role
                : "public";

            console.log("[auth] Assigning role:", role);

            const user = await authStorage.upsertUser({
              id: profile.id,
              email,
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
              role,
            });

            console.log("[auth] User upserted successfully:", user.email, "with role:", user.role);
            done(null, user);
          } catch (error) {
            console.error("[auth] Error in Google OAuth strategy:", error);
            done(error as Error);
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await authStorage.getUser(id);
        done(null, user || null);
      } catch (error) {
        done(error);
      }
    });

    app.get("/api/login", passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    }));

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/" }),
      (req: any, res) => {
        console.log("[auth] Google callback successful, user:", req.user?.email, "role:", req.user?.role);
        // Save session before redirecting to prevent 404
        req.session.save((err: any) => {
          if (err) {
            console.error("[auth] Session save error:", err);
            return res.redirect("/?error=session");
          }
          console.log("[auth] Session saved, redirecting to /admin");
          res.redirect("/admin");
        });
      }
    );

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        req.session.destroy(() => {
          res.redirect("/");
        });
      });
    });

    console.log("[auth] Google OAuth enabled");
  } else {
    // Dev fallback: no Google OAuth configured
    app.get("/api/login", (_req, res) => {
      res.redirect("/admin");
    });
    app.get("/api/logout", (_req, res) => {
      res.redirect("/");
    });
    console.log("[auth] No Google OAuth credentials — admin uses ADMIN_SECRET_KEY header in dev");
  }
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export function isAdmin(req: any): boolean {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const role = req.user?.role;
    if (role === "admin" || role === "superuser") return true;
  }
  // Fallback: API key access (works in all environments)
  const adminKey = req.headers["x-admin-key"];
  if (adminKey && process.env.ADMIN_SECRET_KEY && adminKey === process.env.ADMIN_SECRET_KEY) return true;
  return false;
}

export function isSuperuser(req: any): boolean {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return req.user?.role === "superuser";
  }
  return false;
}
