/**
 * Posts components barrel.
 *
 * Why:
 * - Some components (like `LifeCalendar`) are used inside Markdown posts.
 * - Page-level components are exported PascalCase, like the CV module.
 */
export {default as lifeCalendar} from './lifeCalendar'
export {default as PostFooter} from './postFooter'
