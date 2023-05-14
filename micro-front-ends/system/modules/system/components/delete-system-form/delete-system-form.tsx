import { useDeleteSystem, useReadSystemByUrlPath } from '@/system/hooks';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Space, Spin } from 'antd';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

const { Item } = Form;

const TypedForm = Form<void>;

export const DeleteSystemForm = (): ReactElement => {
  const { back, query } = useRouter();

  const urlPath = query['system-url-path']?.toString() ?? '';

  const { data, loading } = useReadSystemByUrlPath(urlPath, !urlPath);

  const { deleteSystem, errorMessage, isLoading } = useDeleteSystem();

  const finishHandler = (): void => {
    deleteSystem(data?.id ?? '');
  };

  return (
    <Spin spinning={isLoading} size='large' indicator={<LoadingOutlined spin />}>
      <Card title={`Delete Formal System: ${data?.title}`} loading={loading} headStyle={{ textAlign: 'center' }} style={{ maxWidth: '600px', width: '50vw', marginLeft: 'auto', marginRight: 'auto' }}>
        <TypedForm onFinish={finishHandler}>
          <Item style={{ textAlign: 'center' }}>
            <Space direction='vertical'>
              <Button htmlType='submit' type='primary' block>
                Delete
              </Button>
              <Button htmlType='button' block onClick={back}>
                Cancel
              </Button>
            </Space>
          </Item>
        </TypedForm>
        {errorMessage && (
          <Alert message='Error' description={errorMessage} type='error' showIcon closable />
        )}
      </Card>
    </Spin>
  );
};
