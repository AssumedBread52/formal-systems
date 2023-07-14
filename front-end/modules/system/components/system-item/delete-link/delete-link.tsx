import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const DeleteLink = (props: Omit<System, 'description' | 'constantSymbolCount' | 'variableSymbolCount'>): ReactElement => {
  const { id, title, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${id}/${title}/delete`}>
        <AntdDeleteOutlined />
      </Link>
    </ProtectedContent>
  );
};
