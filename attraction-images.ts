const imageCache = new Map<string, string | null>();

async function fetchSummaryThumbnail(title: string): Promise<string | null> {
  const response = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );

  if (!response.ok) return null;

  const data = (await response.json()) as { thumbnail?: { source: string } };
  return data.thumbnail?.source ?? null;
}

async function searchWikipediaThumbnail(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "480",
    format: "json",
    origin: "*",
  });

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!response.ok) return null;

  const data = (await response.json()) as {
    query?: { pages?: Record<string, { thumbnail?: { source: string } }> };
  };

  const pages = data.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  return page?.thumbnail?.source ?? null;
}

export async function getAttractionImageUrl(
  name: string,
  destination?: string
): Promise<string | null> {
  const cacheKey = `${name}|${destination ?? ""}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) ?? null;
  }

  const queries = destination
    ? [`${name} ${destination}`, name, `${name} landmark ${destination}`]
    : [name, `${name} landmark`];

  try {
    for (const query of queries) {
      const fromSummary = await fetchSummaryThumbnail(query);
      if (fromSummary) {
        imageCache.set(cacheKey, fromSummary);
        return fromSummary;
      }

      const fromSearch = await searchWikipediaThumbnail(query);
      if (fromSearch) {
        imageCache.set(cacheKey, fromSearch);
        return fromSearch;
      }
    }

    imageCache.set(cacheKey, null);
    return null;
  } catch {
    imageCache.set(cacheKey, null);
    return null;
  }
}
