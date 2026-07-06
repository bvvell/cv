export function ensureTrailingSlash(fullPath: string): string {
    const hashIndex = fullPath.indexOf('#')
    const beforeHash = hashIndex === -1 ? fullPath : fullPath.slice(0, hashIndex)
    const hash = hashIndex === -1 ? '' : fullPath.slice(hashIndex)

    const queryIndex = beforeHash.indexOf('?')
    const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex)
    const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex)

    if (pathname === '/' || pathname.endsWith('/')) return fullPath
    // Skip paths that look like files (e.g. /cv.pdf, /sitemap.xml).
    if (/\.[^/]+$/.test(pathname)) return fullPath
    return `${pathname}/${query}${hash}`
}
