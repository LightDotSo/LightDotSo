import {
  ReportingObserver as ReportingObserverIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
  Debug as DebugIntegration,
  CaptureConsole as CaptureConsoleIntegration,
} from "@sentry/integrations";
import * as Sentry from "@sentry/nextjs";

const version = require("./package.json").version;

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV,
  autoSessionTracking: true,
  tracesSampleRate: 1.0,
  release: `lightdotso@${version}`,
  integrations: [
    new CaptureConsoleIntegration({
      levels: ["error"],
    }),
    new DebugIntegration(),
    new ExtraErrorDataIntegration(),
    new ReportingObserverIntegration(),
  ],
});
