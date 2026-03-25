import sanitizeHtml from 'sanitize-html';

// Configure the sanitization options
const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'alt', 'class'],
    div: ['class'],
    span: ['class'],
  },
  // Allow lots of schemes. A lot of these maybe unsafe, but we need some for custom protocols
  allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
  // URL schemes we permit in web links
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
  transformTags: {
    // a simple transform that strips all attributes from a tag
    'a': function(tagName, attribs) {
      // access the original href
      const href = attribs.href;
      // return a new tag
      return {
        tagName: 'a',
        attribs: {
          href: href,
          // enforce noopener and ugc for security and SEO
          rel: 'noopener ugc'
        }
      };
    }
  },
  // a custom filter to remove dangerous urls
  urlAttributes: {
    'a': ['href'],
    'img': ['src']
  },
  exclusiveFilter: function(frame) {
    // Only allow youtube and vimeo iframes
    if (frame.tag === 'iframe' && !frame.hostname) {
        return true;
    }
    // remove dangerous javascript urls
    if (frame.tag === 'a' || frame.tag === 'img') {
        const url = frame.attribs.href || frame.attribs.src;
        if (url && url.startsWith('javascript:')) {
            return true;
        }
    }
    return false;
  }
};


export default ({ app }, inject) => {
  inject('sanitize', (dirty) => {
    return sanitizeHtml(dirty, sanitizeOptions);
  });
};
