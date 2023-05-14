import { ProtectedContent } from '@/auth/components';
import { ClientSystem } from '@/system/types';
import { UserSignature } from '@/user/components';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Card, Divider } from 'antd';
import Link from 'next/link';
import { ReactElement } from 'react';

export const SystemItem = (props: ClientSystem): ReactElement => {
  const { title, urlPath, description, createdByUserId } = props;

  return (
    <Card
      title={title}
      extra={
        <Link href={`/${urlPath}`}>
          Explore
        </Link>
      }
      actions={[
        <ProtectedContent userId={createdByUserId}>
          <Link href={`/${urlPath}/edit`}>
            <EditOutlined />
          </Link>
        </ProtectedContent>,
        <ProtectedContent userId={createdByUserId}>
          <Link href={`/${urlPath}/delete`}>
            <DeleteOutlined />
          </Link>
        </ProtectedContent>
      ]}
    >
      {description}
      <Divider />
      <UserSignature label='Created by' userId={createdByUserId} />
    </Card>
  );
};
