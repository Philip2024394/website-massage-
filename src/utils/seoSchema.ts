/**
 * SEO Schema.org Utilities
 * Reusable functions for injecting structured data into pages
 */

export interface ArticleSchemaOptions {
    title: string;
    description: string;
    url: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: string;
    keywords?: string[];
}

/**
 * Inject Article Schema.org structured data into page
 * @param options Article metadata
 * @param scriptId Unique script tag ID
 */
export function injectArticleSchema(options: ArticleSchemaOptions, scriptId: string = 'article-schema'): () => void {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": options.title,
        "description": options.description,
        "image": options.image,
        "url": options.url,
        "datePublished": options.datePublished,
        "dateModified": options.dateModified || options.datePublished,
        "author": {
            "@type": "Person",
            "name": options.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "IndaStreet Massage",
            "logo": {
                "@type": "ImageObject",
                "url": "https://ik.imagekit.io/7grri5v7d/Massage%20hub%20indastreet.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": options.url
        },
        "keywords": options.keywords?.join(', ') || ''
    };

    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
    }
    
    scriptTag.textContent = JSON.stringify(schema);

    // Return cleanup function
    return () => {
        const tag = document.getElementById(scriptId);
        if (tag) {
            tag.remove();
        }
    };
}

/**
 * Inject BreadcrumbList Schema.org structured data
 * @param breadcrumbs Array of breadcrumb items {name, url}
 * @param scriptId Unique script tag ID
 */
export function injectBreadcrumbSchema(
    breadcrumbs: Array<{ name: string; url: string }>,
    scriptId: string = 'breadcrumb-schema'
): () => void {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
        }))
    };

    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
    }
    
    scriptTag.textContent = JSON.stringify(schema);

    // Return cleanup function
    return () => {
        const tag = document.getElementById(scriptId);
        if (tag) {
            tag.remove();
        }
    };
}

/**
 * Set or update meta tag
 */
export function setMetaTag(property: string, content: string, isProperty: boolean = false): void {
    if (!content) return;
    
    const selector = isProperty 
        ? `meta[property="${property}"]`
        : `meta[name="${property}"]`;
    
    let tag = document.querySelector(selector) as HTMLMetaElement;
    
    if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
            tag.setAttribute('property', property);
        } else {
            tag.setAttribute('name', property);
        }
        document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
}

/**
 * Set canonical URL
 */
export function setCanonicalUrl(url: string): () => void {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }
    
    link.setAttribute('href', url);

    // Return cleanup function
    return () => {
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
            canonicalLink.remove();
        }
    };
}

/**
 * Complete SEO setup for blog article page
 */
export function setupBlogArticleSEO(options: {
    title: string;
    description: string;
    url: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: string;
    keywords?: string[];
    breadcrumbs: Array<{ name: string; url: string }>;
}): () => void {
    // Set document title
    document.title = `${options.title} | IndaStreet Massage Blog`;
    
    // Set meta tags
    setMetaTag('description', options.description);
    setMetaTag('keywords', options.keywords?.join(', ') || '');
    
    // Open Graph tags
    setMetaTag('og:title', options.title, true);
    setMetaTag('og:description', options.description, true);
    setMetaTag('og:image', options.image, true);
    setMetaTag('og:url', options.url, true);
    setMetaTag('og:type', 'article', true);
    
    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', options.title);
    setMetaTag('twitter:description', options.description);
    setMetaTag('twitter:image', options.image);
    
    // Inject structured data
    const cleanupArticle = injectArticleSchema(options, 'article-schema');
    const cleanupBreadcrumb = injectBreadcrumbSchema(options.breadcrumbs, 'breadcrumb-schema');
    const cleanupCanonical = setCanonicalUrl(options.url);
    
    // Return combined cleanup function
    return () => {
        cleanupArticle();
        cleanupBreadcrumb();
        cleanupCanonical();
    };
}
