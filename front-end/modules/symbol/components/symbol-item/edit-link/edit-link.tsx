import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { Symbol } from '@/symbol/types/symbol';
import { SystemTitle } from '@/system/types/system-title';
import Link from 'next/link';
import { ReactElement } from 'react';

export const EditLink = (props: Omit<Symbol & SystemTitle, 'description' | 'type' | 'content' | 'axiomaticStatementAppearances' | 'nonAxiomaticStatementAppearances'>): ReactElement => {
  const { id, title, systemId, createdByUserId, systemTitle } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${systemId}/${systemTitle}/symbol/${id}/${title}/edit`}>
        <AntdEditOutlined />
      </Link>
    </ProtectedContent>
  );
};
