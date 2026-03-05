import { google, searchconsole_v1 } from "googleapis";
import { requireEnv, appendCSV } from "./lib.js";

const OUTPUT_DIR = "../../contexts/data/google-search-console";

async function main() {
  const clientEmail = requireEnv("GCP_CLIENT_EMAIL");
  const privateKey = requireEnv("GCP_PRIVATE_KEY").replace(/\\n/g, "\n");
  const siteUrl = requireEnv("GSC_SITE_URL");

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const sc = google.searchconsole({ version: "v1", auth });

  // GSC has 2-3 day data lag. Try yesterday first, fall back up to 5 days ago.
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const datesToTry: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    datesToTry.push(fmt(d));
  }

  // Find the most recent date with data available
  let dateStr = "";
  let mainRows: searchconsole_v1.Schema$ApiDataRow[] = [];

  for (const candidate of datesToTry) {
    const rows = await fetchAllRows(sc, siteUrl, candidate, {
      dimensions: ["date", "query", "page", "country", "device"],
      searchType: "web",
    });
    if (rows.length > 0) {
      dateStr = candidate;
      mainRows = rows;
      break;
    }
  }

  if (!dateStr) {
    console.log("⚠️ GSC: No data available for the last 5 days");
    return;
  }

  const yearMonth = dateStr.slice(0, 7); // "YYYY-MM"

  const mainHeaders = ["date", "query", "page", "country", "device", "clicks", "impressions", "ctr_percent", "avg_position"];
  const mainData = mainRows.map((row) => [
    row.keys![0],
    row.keys![1],
    row.keys![2],
    row.keys![3],
    row.keys![4],
    String(row.clicks ?? 0),
    String(row.impressions ?? 0),
    ((row.ctr ?? 0) * 100).toFixed(2),
    (row.position ?? 0).toFixed(1),
  ]);

  const mainAdded = appendCSV(`${OUTPUT_DIR}/queries-${yearMonth}.csv`, mainHeaders, mainData);
  console.log(`✅ GSC queries: ${mainAdded} new rows appended (${mainData.length} fetched) → queries-${yearMonth}.csv`);

  // 2. Search appearance query: searchAppearance only (cannot combine with other dimensions)
  const appearanceRows = await fetchAllRows(sc, siteUrl, dateStr, {
    dimensions: ["searchAppearance"],
    searchType: "web",
  });

  const appearanceHeaders = ["date", "search_appearance", "clicks", "impressions", "ctr_percent", "avg_position"];
  const appearanceData = appearanceRows.map((row) => [
    dateStr,
    row.keys![0],
    String(row.clicks ?? 0),
    String(row.impressions ?? 0),
    ((row.ctr ?? 0) * 100).toFixed(2),
    (row.position ?? 0).toFixed(1),
  ]);

  const appearanceAdded = appendCSV(`${OUTPUT_DIR}/search-appearance-${yearMonth}.csv`, appearanceHeaders, appearanceData);
  console.log(`✅ GSC search appearance: ${appearanceAdded} new rows appended (${appearanceData.length} fetched) → search-appearance-${yearMonth}.csv`);
}

async function fetchAllRows(
  sc: searchconsole_v1.Searchconsole,
  siteUrl: string,
  dateStr: string,
  opts: { dimensions: string[]; searchType: string },
): Promise<searchconsole_v1.Schema$ApiDataRow[]> {
  const allRows: searchconsole_v1.Schema$ApiDataRow[] = [];
  let startRow = 0;
  const ROW_LIMIT = 25000;

  while (true) {
    const response = await sc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: dateStr,
        endDate: dateStr,
        dimensions: opts.dimensions,
        searchType: opts.searchType,
        rowLimit: ROW_LIMIT,
        startRow,
      },
    });

    const rows = response.data.rows ?? [];
    allRows.push(...rows);

    if (rows.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }

  return allRows;
}

main();
