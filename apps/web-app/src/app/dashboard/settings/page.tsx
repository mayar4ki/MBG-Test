'use client';

import { Globe, Languages, Moon, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@acme/ui/dropdown-menu';
import { ModeToggle } from '~/_components/common/ModeToggle';

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'zh';

const LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية (RTL)' },
  { code: 'zh', label: '中文' },
];

export default function Page() {
  // Local-only UI state; replace with your i18n store/context when wiring logic
  const [language, setLanguage] = useState<LanguageCode>('en');
  const currentLangLabel = useMemo(() => LANGUAGES.find((l) => l.code === language)?.label ?? language, [language]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Choose how the app looks. You can set light, dark, or follow your system.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="size-4 opacity-60 dark:hidden" />
              <Moon className="hidden size-4 opacity-60 dark:block" />
              <span className="text-sm text-muted-foreground">Appearance mode</span>
            </div>
            <ModeToggle size="default" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>Select your preferred language for the interface.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="size-4 opacity-60" />
              <span className="text-sm text-muted-foreground">Interface language</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-36 justify-between" disabled>
                  <span className="truncate">{currentLangLabel}</span>
                  <Globe className="ml-2 size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Choose language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={language}
                  onValueChange={(val) => {
                    // TODO: replace with your i18n change-language logic
                    setLanguage(val as LanguageCode);
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <DropdownMenuRadioItem key={l.code} value={l.code}>
                      {l.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
