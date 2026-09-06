"use client";

import { Icon } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
  current: string;
  title: string;
  sub: string;
}

export default function StaffPlaceholder({ navigate, current, title, sub }: Props) {
  const { t } = useLanguage();

  return (
    <StaffShell navigate={navigate} current={current}>
      <div className="flex-1 flex items-center justify-center min-h-96 p-8">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Icon name="warehouse" size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-display mb-2">{t(title, title)}</h2>
          <p className="text-sm text-muted-foreground">{t(sub, sub)}</p>
        </div>
      </div>
    </StaffShell>
  );
}
