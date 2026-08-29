import client from "./client";

export const getAnalyticsSummary = () => client.get("/analytics/summary").then((r) => r.data);
