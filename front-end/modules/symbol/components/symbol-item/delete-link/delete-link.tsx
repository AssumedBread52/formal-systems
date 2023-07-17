import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { Symbol } from '@/symbol/types/symbol';
import { SystemTitle } from '@/system/types/system-title';
import Link from 'next/link';
import { ReactElement } from 'react';

export const DeleteLink = (props: Omit<Symbol & SystemTitle, 'description' | 'type' | 'content'>): ReactElement => {
  const { id, title, systemId, createdByUserId, systemTitle } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${systemId}/${systemTitle}/symbol/${id}/${title}/delete`}>
        <AntdDeleteOutlined />
      </Link>
    </ProtectedContent>
  );
};
