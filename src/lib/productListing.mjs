const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 48;
const MAX_FILTER_LENGTH = 100;
const MAX_PRICE = 10_000_000;

function parsePositiveInteger(value, fallback, maximum) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= maximum
    ? parsed
    : null;
}

function parsePrice(value) {
  if (value === null) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_PRICE
    ? parsed
    : Number.NaN;
}

export function parseProductListingParams(searchParams) {
  const category = searchParams.get("category")?.trim() || null;
  const q = searchParams.get("q")?.trim() || null;
  const page = parsePositiveInteger(searchParams.get("page"), 1, 1_000_000);
  const pageSize = parsePositiveInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const minPrice = parsePrice(searchParams.get("minPrice"));
  const maxPrice = parsePrice(searchParams.get("maxPrice"));
  const sort = searchParams.get("sort") || "default";

  if (
    (category && category.length > MAX_FILTER_LENGTH) ||
    (q && q.length > MAX_FILTER_LENGTH) ||
    page === null ||
    pageSize === null ||
    Number.isNaN(minPrice) ||
    Number.isNaN(maxPrice) ||
    (minPrice !== null && maxPrice !== null && minPrice > maxPrice) ||
    !["default", "price-asc", "price-desc", "name"].includes(sort)
  ) return null;

  return { category, q, page, pageSize, minPrice, maxPrice, sort };
}
