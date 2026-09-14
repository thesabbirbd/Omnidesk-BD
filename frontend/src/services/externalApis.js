/**
 * External Free API integrations for Universal Study OS.
 * Currently provides placeholder utilities for dynamic content generation.
 */

/**
 * Fetches a random curated cover image from Unsplash Source API based on a topic string.
 * This is used to dynamically add rich visuals to Study Spaces if requested.
 * 
 * @param {string} topic - The title or category of the Study Space (e.g., 'Computer Networking')
 * @returns {string} The Unsplash Source URL that resolves to a cover image.
 */
export const getUnsplashCoverImage = (topic) => {
  if (!topic) {
    return 'https://source.unsplash.com/featured/?technology,engineering';
  }
  
  // URL-encode the topic string and generate the unsplash featured URL
  const query = encodeURIComponent(topic);
  return `https://source.unsplash.com/featured/?${query},technology`;
};
