import { folder, LevaInputs, useControls } from 'leva';
import type { ModelDetails } from '@/twin/leva/getModelInfo';

type Props = {
  details: ModelDetails | null;
};

export default function ModelInfoControls({ details }: Props) {
  useControls('选中对象信息', () => {
    if (!details) {
      return { 提示: { value: '点击模型查看信息', editable: false } };
    }

    return Object.fromEntries(
      Object.entries(details).map(([section, properties]) => [
        section,
        folder(Object.fromEntries(
          Object.entries(properties).map(([label, value]) => [
            label,
            { type: LevaInputs.STRING, value, editable: false },
          ]),
        )),
      ]),
    );
  }, { order: 1 }, [details]);

  return null;
}
