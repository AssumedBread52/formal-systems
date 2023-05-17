import { useSignInUser } from '@/auth/hooks';
import { SignInPayload } from '@/auth/types';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, Spin } from 'antd';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

const { Item } = Form;
const { Password } = Input;

const TypedForm = Form<SignInPayload>;

export const SignInForm = (): ReactElement => {
  const { back } = useRouter();

  const { signInUser, errorMessage, isLoading } = useSignInUser();

  const finishHandler = (signInPayload: SignInPayload): void => {
    signInUser(signInPayload);
  };

  return (
    <Spin spinning={isLoading} size='large' indicator={<LoadingOutlined spin />}>
      <Card title='Sign In' headStyle={{ textAlign: 'center' }} style={{ maxWidth: '600px', width: '50vw', marginLeft: 'auto', marginRight: 'auto' }}>
        <TypedForm labelCol={{ span: 8 }} onFinish={finishHandler}>
          <Item label='E-mail' name='email' rules={[
            { required: true, message: 'Please enter your e-mail address.' },
            { type: 'email', message: 'Invalid format' }
          ]}>
            <Input />
          </Item>
          <Item label='Password' name='password' rules={[
            { required: true, message: 'Please enter your password.' }
          ]}>
            <Password />
          </Item>
          <Item wrapperCol={{ offset: 8 }}>
            <Space wrap>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
              <Button htmlType='button' onClick={back}>
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
