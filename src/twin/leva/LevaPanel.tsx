import { useEffect, useState } from 'react';
import { Leva } from 'leva';
import ModelInfoControls from '@/twin/leva/ModelInfoControls';
import type { ModelDetails } from '@/twin/leva/getModelInfo';

type Props = {
  details: ModelDetails | null;
};

export default function LevaPanel({ details }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Expand after mounting so Leva measures the registered controls again.
    const frame = requestAnimationFrame(() => setCollapsed(false));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <Leva
        titleBar={{ title: '场景工具' }}
        collapsed={{ collapsed, onChange: setCollapsed }}
      />
      <ModelInfoControls details={details} />
    </>
  );
}
