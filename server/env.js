// returns whether this application is executing in Cloud Run (true) or local development (false)
// see https://cloud.google.com/run/docs/container-contract#services-env-vars

export const isHosted = !!process.env.K_SERVICE;