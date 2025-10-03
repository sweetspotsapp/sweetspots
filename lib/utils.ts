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

export function firebaseErrorMessage(code: string): string {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'The email address is already in use. Please log in instead.';
        case 'auth/invalid-email':
            return 'The email address is not valid.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled.';
        case 'auth/weak-password':
            return 'The password is too weak.';
        case 'auth/user-disabled':
            return 'The user account has been disabled by an administrator.';
        case 'auth/user-not-found':
            return 'There is no user corresponding to the given email.';
        case 'auth/wrong-password':
            return 'The password is invalid for the given email.';
        case 'auth/invalid-credential':
            return 'The credentials provided are invalid.';
        default:
            return 'An unknown error occurred. Please try again.';
    }
}