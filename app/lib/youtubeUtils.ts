/**
 * Utility to extract YouTube Video ID from any format of YouTube link or embed code.
 */
export function getYouTubeVideoId(inputUrl: string): string {
  if (!inputUrl) return "";

  let url = inputUrl.trim();

  // If user pasted full <iframe> embed tag, extract the src attribute
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1];
  }

  // If user pasted raw 11-character video ID directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Comprehensive regex for youtube URLs: watch?v=, youtu.be/, embed/, shorts/, live/, v/, e/
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);

  if (match && match[1]) {
    return match[1];
  }

  return "";
}
