import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { AnalyticsAdminServiceClient } from "@google-analytics/admin";
import { requireEnv, appendCSV } from "./lib.js";

const OUTPUT_DIR = "../../contexts/data/google-analytics";

interface ReportConfig {
  name: string;
  dimensions: string[];
  metrics: string[];
}

// Standard reports available on any GA4 property
const STANDARD_REPORTS: ReportConfig[] = [
  {
    name: "pages",
    dimensions: ["date", "pagePath"],
    metrics: [
      "screenPageViews",
      "activeUsers",
      "newUsers",
      "sessions",
      "engagedSessions",
      "bounceRate",
      "engagementRate",
      "averageSessionDuration",
      "screenPageViewsPerSession",
      "userEngagementDuration",
    ],
  },
  {
    name: "traffic-sources",
    dimensions: ["date", "sessionDefaultChannelGroup", "sessionSource", "sessionMedium"],
    metrics: [
      "sessions",
      "activeUsers",
      "newUsers",
      "engagedSessions",
      "bounceRate",
      "engagementRate",
      "averageSessionDuration",
      "conversions",
    ],
  },
  {
    name: "events",
    dimensions: ["date", "eventName"],
    metrics: [
      "eventCount",
      "totalUsers",
      "eventCountPerUser",
    ],
  },
  {
    name: "devices",
    dimensions: ["date", "deviceCategory", "operatingSystem", "browser"],
    metrics: [
      "activeUsers",
      "newUsers",
      "sessions",
      "engagedSessions",
      "bounceRate",
      "averageSessionDuration",
    ],
  },
  {
    name: "demographics",
    dimensions: ["date", "country", "city"],
    metrics: [
      "activeUsers",
      "newUsers",
      "sessions",
    ],
  },
];

// Convert GA4 dimension/metric names to snake_case CSV headers
function toSnakeCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

// Format GA4 date "20260304" → "2026-03-04"
function formatDate(raw: string): string {
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

// Fetch custom dimensions and metrics via Admin API
async function fetchCustomDefinitions(
  credentials: { client_email: string; private_key: string },
  propertyId: string,
): Promise<{ dimensions: string[]; metrics: string[] }> {
  const admin = new AnalyticsAdminServiceClient({ credentials });
  const parent = `properties/${propertyId}`;

  const [dims] = await admin.listCustomDimensions({ parent });
  const [mets] = await admin.listCustomMetrics({ parent });

  const dimensions = dims
    .filter((d) => d.parameterName)
    .map((d) => {
      // EVENT scope → "customEvent:param", USER scope → "customUser:param"
      const prefix = d.scope === "USER" ? "customUser" : "customEvent";
      return `${prefix}:${d.parameterName}`;
    });

  const metrics = mets
    .filter((m) => m.parameterName)
    .map((m) => {
      const prefix = String(m.scope) === "USER" ? "customUser" : "customEvent";
      return `${prefix}:${m.parameterName}`;
    });

  if (dimensions.length || metrics.length) {
    console.log(`📊 Found ${dimensions.length} custom dimensions, ${metrics.length} custom metrics`);
  }

  return { dimensions, metrics };
}

// Build custom reports from Admin API definitions
function buildCustomReports(custom: { dimensions: string[]; metrics: string[] }): ReportConfig[] {
  const reports: ReportConfig[] = [];

  if (custom.dimensions.length === 0 && custom.metrics.length === 0) {
    return reports;
  }

  // Custom event dimensions report: each custom dimension × eventName with event counts
  // GA4 allows max 9 dimensions per request, so batch if needed
  const eventDims = custom.dimensions.filter((d) => d.startsWith("customEvent:"));
  const userDims = custom.dimensions.filter((d) => d.startsWith("customUser:"));

  if (eventDims.length > 0) {
    // Max 9 dims per report, "date" and "eventName" take 2 slots → 7 custom dims per batch
    const batchSize = 7;
    for (let i = 0; i < eventDims.length; i += batchSize) {
      const batch = eventDims.slice(i, i + batchSize);
      const suffix = eventDims.length > batchSize ? `-${Math.floor(i / batchSize) + 1}` : "";
      reports.push({
        name: `custom-events${suffix}`,
        dimensions: ["date", "eventName", ...batch],
        metrics: ["eventCount", "totalUsers", ...custom.metrics],
      });
    }
  } else if (custom.metrics.length > 0) {
    // Only custom metrics, no custom dimensions → attach to events
    reports.push({
      name: "custom-events",
      dimensions: ["date", "eventName"],
      metrics: ["eventCount", "totalUsers", ...custom.metrics],
    });
  }

  if (userDims.length > 0) {
    const batchSize = 8; // "date" takes 1 slot → 8 custom dims per batch
    for (let i = 0; i < userDims.length; i += batchSize) {
      const batch = userDims.slice(i, i + batchSize);
      const suffix = userDims.length > batchSize ? `-${Math.floor(i / batchSize) + 1}` : "";
      reports.push({
        name: `custom-users${suffix}`,
        dimensions: ["date", ...batch],
        metrics: ["activeUsers", "totalUsers"],
      });
    }
  }

  return reports;
}

async function runReport(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  report: ReportConfig,
): Promise<void> {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
    dimensions: report.dimensions.map((name) => ({ name })),
    metrics: report.metrics.map((name) => ({ name })),
    orderBys: [{ dimension: { dimensionName: "date" }, desc: true }],
    limit: 10000,
  });

  const rows = response.rows ?? [];
  if (rows.length === 0) {
    console.log(`⚠️ GA4 ${report.name}: No data available for yesterday`);
    return;
  }

  const dateStr = rows[0].dimensionValues![0].value!;
  const yearMonth = formatDate(dateStr).slice(0, 7);

  const headers = [
    ...report.dimensions.map(toSnakeCase),
    ...report.metrics.map(toSnakeCase),
  ];

  const data = rows.map((row) => {
    const dims = row.dimensionValues!.map((v, i) =>
      i === 0 ? formatDate(v.value!) : v.value!,
    );
    const vals = row.metricValues!.map((v) => v.value!);
    return [...dims, ...vals];
  });

  const added = appendCSV(`${OUTPUT_DIR}/${report.name}-${yearMonth}.csv`, headers, data);
  console.log(`✅ GA4 ${report.name}: ${added} new rows appended (${data.length} fetched) → ${report.name}-${yearMonth}.csv`);
}

async function main() {
  const clientEmail = requireEnv("GCP_CLIENT_EMAIL");
  const privateKey = requireEnv("GCP_PRIVATE_KEY").replace(/\\n/g, "\n");
  const propertyId = requireEnv("GA4_PROPERTY_ID");

  const credentials = { client_email: clientEmail, private_key: privateKey };
  const dataClient = new BetaAnalyticsDataClient({ credentials });

  // Discover custom definitions via Admin API
  const custom = await fetchCustomDefinitions(credentials, propertyId);
  const customReports = buildCustomReports(custom);

  const allReports = [...STANDARD_REPORTS, ...customReports];

  for (const report of allReports) {
    await runReport(dataClient, propertyId, report);
  }
}

main();
