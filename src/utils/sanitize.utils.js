import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes input string by stripping all HTML tags and script injections.
 * Returns clean plain text.
 */
export function sanitizeText(input) {
  if (typeof input !== "string") return input;
  
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}
