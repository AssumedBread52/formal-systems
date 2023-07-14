import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const EditLink = (props: Omit<System, 'description' | 'constantSymbolCount' | 'variableSymbolCount'>): ReactElement => {
  const { id, title, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${id}/${title}/edit`}>
        <AntdEditOutlined />
      </Link>
    </ProtectedContent>
  );
};
