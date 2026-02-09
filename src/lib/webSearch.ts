import { tavily } from '@tavily/core';

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

/**
 * Tavily API로 검색
 */
async function searchTavily(query: string, apiKey: string): Promise<SearchResult[]> {
  try {
    const client = tavily({ apiKey });
    const response = await client.search(query, {
      maxResults: 5,
      searchDepth: 'basic',
    });

    return response.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    }));
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

/**
 * DuckDuckGo Instant Answer API로 검색
 */
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(url);
    const data = await response.json();

    const results: SearchResult[] = [];

    // Abstract (메인 결과)
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        content: data.Abstract,
      });
    }

    // Related Topics
    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 4)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.substring(0, 80),
            url: topic.FirstURL,
            content: topic.Text,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

/**
 * 웹 검색을 수행하고 결과를 마크다운 문자열로 포맷합니다.
 * Tavily API 키가 있으면 Tavily 우선 사용, 없으면 DuckDuckGo만 사용.
 */
export async function performWebSearch(
  query: string,
  tavilyApiKey?: string
): Promise<{ results: SearchResult[]; formatted: string }> {
  let results: SearchResult[] = [];

  if (tavilyApiKey) {
    results = await searchTavily(query, tavilyApiKey);
  }

  if (results.length === 0) {
    results = await searchDuckDuckGo(query);
  }

  const formatted = formatSearchResults(query, results);
  return { results, formatted };
}

function formatSearchResults(query: string, results: SearchResult[]): string {
  if (results.length === 0) {
    return `"${query}"에 대한 검색 결과를 찾지 못했습니다.`;
  }

  let md = `## 웹 검색 결과: "${query}"\n\n`;

  for (const [i, r] of results.entries()) {
    md += `### ${i + 1}. ${r.title}\n`;
    md += `- URL: ${r.url}\n`;
    md += `- ${r.content}\n\n`;
  }

  return md;
}
