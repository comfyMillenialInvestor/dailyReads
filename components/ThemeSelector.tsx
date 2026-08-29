'use client';

import { Button } from '@/components/ui/button';
import { VALID_THEMES } from '@/lib/models/Content';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ThemeSelectorProps {
    currentTheme: string | null;
    onSelectTheme: (theme: string | null) => void;
}

export function ThemeSelector({ currentTheme, onSelectTheme }: ThemeSelectorProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-wrap gap-2 justify-center my-6">
            <Button
                variant={currentTheme === null ? 'default' : 'outline'}
                onClick={() => onSelectTheme(null)}
                className="capitalize"
            >
                {t('theme.allRandom')}
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
