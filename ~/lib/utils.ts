/**
 * Utility function to concatenate class names conditionally.
 * Accepts strings, arrays, or objects.
 */
export function cn(...args: any[]): string {
    return args
        .flat(Infinity)
        .map((arg) => {
            if (!arg) return '';
            if (typeof arg === 'string') return arg;
            if (Array.isArray(arg)) return cn(...arg);
            if (typeof arg === 'object') {
                return Object.entries(arg)
                    .filter(([_, value]) => Boolean(value))
                    .map(([key]) => key)
                    .join(' ');
            }
            return '';
        })
        .filter(Boolean)
        .join(' ');
}