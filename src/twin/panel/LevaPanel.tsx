import { useState } from 'react';
import { Leva } from 'leva';
import ModelInfoControls from '@/twin/panel/ModelInfoControls';
import type { ModelDetails } from '@/twin/panel/getModelInfo';
import '@/twin/panel/panel.css';

type Props = {
  details: ModelDetails | null;
};

export default function LevaPanel({ details }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="leva-panel" data-expanded={!collapsed}>
        <Leva
          fill
          titleBar={{ title: '场景工具', drag: false }}
          collapsed={{ collapsed, onChange: setCollapsed }}
        />
      </div>
      <ModelInfoControls details={details} />
    </>
  );
}
