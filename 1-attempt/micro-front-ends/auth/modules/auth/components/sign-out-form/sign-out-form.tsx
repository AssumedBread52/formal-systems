import { useSignOutUser } from '@/auth/hooks';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Space, Spin } from 'antd';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

const { Item } = Form;

const TypedForm = Form<void>;

export const SignOutForm = (): ReactElement => {
  const { back } = useRouter();

  const { signOutUser, errorMessage, isLoading } = useSignOutUser();

  const finishHandler = (): void => {
    signOutUser();
  };

  return (
    <Spin spinning={isLoading} size='large' indicator={<LoadingOutlined spin />}>
      <Card title='Sign Out' headStyle={{ textAlign: 'center' }} style={{ maxWidth: '600px', width: '50vw', marginLeft: 'auto', marginRight: 'auto' }}>
        <TypedForm onFinish={finishHandler}>
          <Item style={{ textAlign: 'center' }}>
            <Space direction='vertical'>
              <Button type='primary' htmlType='submit' block>
                Sign Out
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
