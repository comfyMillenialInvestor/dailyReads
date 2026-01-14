'use client';

import { Button } from '@/components/ui/button';
import { VALID_THEMES } from '@/lib/models/Content';

interface ThemeSelectorProps {
    currentTheme: string | null;
    onSelectTheme: (theme: string | null) => void;
}

export function ThemeSelector({ currentTheme, onSelectTheme }: ThemeSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center my-6">
            <Button
                variant={currentTheme === null ? 'default' : 'outline'}
                onClick={() => onSelectTheme(null)}
                className="capitalize"
            >
                All / Random
            </Button>
            {VALID_THEMES.map((theme) => (
                <Button
                    key={theme}
                    variant={currentTheme === theme ? 'default' : 'outline'}
                    onClick={() => onSelectTheme(theme)}
                    className="capitalize"
                >
                    {theme}
                </Button>
            ))}
        </div>
    );
}
