import { ProtectedContent } from '@/auth/components';
import { ClientSystem, SystemListProps } from '@/system/types';
import { Col, Empty, Row } from 'antd';
import { ReactElement } from 'react';
import { SystemItem } from './system-item/system-item';

export const SystemList = (props: SystemListProps): ReactElement => {
  const { systems } = props;

  if (0 === systems.length) {
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
        <ProtectedContent>
          No formal systems were found matching your search criteria. Either alter your search criteria or create a new formal system.
        </ProtectedContent>
        <ProtectedContent invert>
          No formal systems were found matching your search criteria. Either alter your search criteria or login/signup and then create a new formal system.
        </ProtectedContent>
      </Empty>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {systems.map((system: ClientSystem): ReactElement => {
        const { id, title, urlPath, description, createdByUserId } = system;

        return (
          <Col key={id} span={24}>
            <SystemItem id={id} title={title} urlPath={urlPath} description={description} createdByUserId={createdByUserId} />
          </Col>
        );
      })}
    </Row>
  );
};
