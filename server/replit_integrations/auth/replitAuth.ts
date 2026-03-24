import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

const isReplitEnv = !!(process.env.REPL_ID);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "imiklomelo-session-secret-change-me",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  if (isReplitEnv) {
    // Replit OIDC auth — only available when running on Replit
    try {
      const client = await import("openid-client");
      const { Strategy } = await import("openid-client/passport");
      const passport = (await import("passport")).default;
      const memoize = (await import("memoizee")).default;
      const { authStorage } = await import("./storage");

      app.use(passport.initialize());
      app.use(passport.session());

      const getOidcConfig = memoize(
        async () => {
          return await client.discovery(
            new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
            process.env.REPL_ID!
          );
        },
        { maxAge: 3600 * 1000 }
      );

      const config = await getOidcConfig();

      const verify = async (
        tokens: any,
        verified: any
      ) => {
        const user: any = {};
        user.claims = tokens.claims();
        user.access_token = tokens.access_token;
        user.refresh_token = tokens.refresh_token;
        user.expires_at = user.claims?.exp;
        await authStorage.upsertUser({
          id: user.claims["sub"],
          email: user.claims["email"],
          firstName: user.claims["first_name"],
          lastName: user.claims["last_name"],
          profileImageUrl: user.claims["profile_image_url"],
        });
        verified(null, user);
      };

      const registeredStrategies = new Set<string>();

      const ensureStrategy = (domain: string) => {
        const strategyName = `replitauth:${domain}`;
        if (!registeredStrategies.has(strategyName)) {
          const strategy = new Strategy(
            {
              name: strategyName,
              config,
              scope: "openid email profile offline_access",
              callbackURL: `https://${domain}/api/callback`,
            },
            verify as any
          );
          passport.use(strategy);
          registeredStrategies.add(strategyName);
        }
      };

      passport.serializeUser((user: Express.User, cb) => cb(null, user));
      passport.deserializeUser((user: Express.User, cb) => cb(null, user));

      app.get("/api/login", (req, res, next) => {
        ensureStrategy(req.hostname);
        passport.authenticate(`replitauth:${req.hostname}`, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      });

      app.get("/api/callback", (req, res, next) => {
        ensureStrategy(req.hostname);
        passport.authenticate(`replitauth:${req.hostname}`, {
          successReturnToOrRedirect: "/",
          failureRedirect: "/api/login",
        })(req, res, next);
      });

      app.get("/api/logout", (req, res) => {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        });
      });

      console.log("[auth] Replit OIDC auth enabled");
    } catch (error) {
      console.warn("[auth] Failed to initialize Replit auth:", error);
    }
  } else {
    // Non-Replit environment: stub auth routes
    app.get("/api/login", (_req, res) => {
      res.redirect("/admin");
    });
    app.get("/api/logout", (_req, res) => {
      res.redirect("/");
    });
    console.log("[auth] Running without Replit OIDC — admin uses ADMIN_SECRET_KEY header");
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!isReplitEnv) {
    // In non-Replit environments, auth check is a no-op for this middleware.
    // Admin routes use x-admin-key header instead.
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated || !req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const client = await import("openid-client");
    const memoize = (await import("memoizee")).default;
    const getOidcConfig = memoize(
      async () => {
        return await client.discovery(
          new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
          process.env.REPL_ID!
        );
      },
      { maxAge: 3600 * 1000 }
    );
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    user.claims = tokenResponse.claims();
    user.access_token = tokenResponse.access_token;
    user.refresh_token = tokenResponse.refresh_token;
    user.expires_at = user.claims?.exp;
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
