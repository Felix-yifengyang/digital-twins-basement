import { useEffect } from 'react';
import { folder, LevaInputs, useControls } from 'leva';
import type { ModelDetails } from '@/twin/leva/getModelInfo';

type Props = {
  details: ModelDetails | null;
};

export default function ModelInfoControls({ details }: Props) {
  const [, set] = useControls('选中对象信息', () => {
    if (!details) {
      return { 提示: { value: '点击模型查看信息', editable: false } };
    }

    return Object.fromEntries(
      Object.entries(details).map(([section, properties]) => [
        section,
        folder(Object.fromEntries(
          Object.entries(properties).map(([label, value]) => [
            `${section}_${label}`,
            { label, type: LevaInputs.STRING, value, editable: false },
          ]),
        ), { collapsed: false }),
      ]),
    );
  }, { order: 1, collapsed: false }, [details]);

  useEffect(() => {
    if (!details) return;
    // Schema defaults do not replace values already registered in Leva's store.
    // Leva cannot infer value types for dynamically generated folder keys.
    const update = set as unknown as (values: Record<string, string>) => void;
    update(Object.fromEntries(
      Object.entries(details).flatMap(([section, properties]) =>
        Object.entries(properties).map(([label, value]) => [`${section}_${label}`, value]),
      ),
    ));
  }, [details, set]);

  return null;
}
