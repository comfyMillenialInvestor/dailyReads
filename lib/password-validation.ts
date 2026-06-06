/**
 * Password validation utilities for secure user registration
 */

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*(),.?":{}|<>)
 */
export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least 1 number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least 1 special character (!@#$%^&*(),.?":{}|<>)');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Get password strength score (0-4)
 * 0 = very weak, 4 = very strong
 */
export function getPasswordStrength(password: string): number {
    let score = 0;

    if (!password) return 0;

    // Length checks
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Mixed case
    if (/\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score++; // Number + special

    return Math.min(score, 4);
}

export const PASSWORD_STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
